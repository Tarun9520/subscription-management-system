const crypto = require("crypto");
const Razorpay = require("razorpay");
const Payment = require("../models/Payment");
const Plan = require("../models/Plan");
const Subscription = require("../models/Subscription");
const Coupon = require("../models/Coupon");
const Invoice = require("../models/Invoice");
const User = require("../models/User");
const { sendEmail } = require("../config/email");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc Create Razorpay order
// @route POST /api/payments/order
exports.createOrder = async (req, res) => {
  const { planId, couponCode } = req.body;

  const plan = await Plan.findById(planId);
  if (!plan || !plan.isActive) {
    return res
      .status(404)
      .json({ success: false, message: "Plan not available" });
  }

  let amount = plan.price;
  let discount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon) {
      const usable = coupon.isUsable();
      if (usable.ok && amount >= coupon.minAmount) {
        discount = coupon.calculateDiscount(amount);
        amount = amount - discount;
        appliedCoupon = coupon;
      }
    }
  }

  // Razorpay expects amount in paise
  const amountInPaise = Math.round(amount * 100);

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: plan.currency || "INR",
    receipt: `rcpt_${Date.now()}`,
    notes: { planId: plan._id.toString(), userId: req.user._id.toString() },
  });

  const payment = await Payment.create({
    user: req.user._id,
    plan: plan._id,
    razorpayOrderId: order.id,
    amount,
    currency: plan.currency || "INR",
    status: "created",
    couponCode: appliedCoupon ? appliedCoupon.code : null,
    discount,
  });

  res.json({
    success: true,
    order,
    paymentId: payment._id,
    key: process.env.RAZORPAY_KEY_ID,
    amount,
    discount,
    plan: { _id: plan._id, name: plan.name, price: plan.price },
  });
};

// @desc Verify payment & activate subscription
// @route POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  // Verify signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: "failed" }
    );
    return res
      .status(400)
      .json({ success: false, message: "Payment verification failed" });
  }

  const payment = await Payment.findOne({
    razorpayOrderId: razorpay_order_id,
  }).populate("plan");

  if (!payment) {
    return res
      .status(404)
      .json({ success: false, message: "Payment record not found" });
  }

  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.status = "paid";

  const plan = payment.plan;

  // Expire any existing active subscription (upgrade/downgrade flow)
  const existing = await Subscription.findOne({
    user: payment.user,
    status: "active",
  });
  if (existing) {
    existing.status = "expired";
    existing.endDate = new Date();
    await existing.save();
  }

  // Create new subscription
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + plan.durationInDays);

  const subscription = await Subscription.create({
    user: payment.user,
    plan: plan._id,
    status: "active",
    startDate,
    endDate,
    autoRenew: true,
    amountPaid: payment.amount,
  });

  payment.subscription = subscription._id;
  await payment.save();

  // Update user's current subscription
  await User.findByIdAndUpdate(payment.user, {
    currentSubscription: subscription._id,
  });

  // Increment coupon usage
  if (payment.couponCode) {
    await Coupon.findOneAndUpdate(
      { code: payment.couponCode },
      { $inc: { usedCount: 1 } }
    );
  }

  // Generate invoice
  const user = await User.findById(payment.user);
  const invoiceNumber = `INV-${Date.now()}-${Math.floor(
    Math.random() * 1000
  )}`;
  const tax = Math.round(payment.amount * 0.18 * 100) / 100; // 18% GST illustrative
  const invoice = await Invoice.create({
    invoiceNumber,
    user: payment.user,
    payment: payment._id,
    plan: plan._id,
    subscription: subscription._id,
    amount: payment.amount,
    discount: payment.discount,
    tax,
    total: payment.amount,
    currency: payment.currency,
    status: "paid",
    billingDetails: { name: user.name, email: user.email },
  });

  // Send confirmation email (non-blocking)
  sendEmail({
    to: user.email,
    subject: `Payment Successful - ${plan.name}`,
    html: `
      <h2>Thank you, ${user.name}!</h2>
      <p>Your payment of <strong>${payment.currency} ${payment.amount}</strong> for the <strong>${plan.name}</strong> plan was successful.</p>
      <p>Invoice Number: ${invoiceNumber}</p>
      <p>Your subscription is active until ${endDate.toDateString()}.</p>
    `,
  });

  res.json({
    success: true,
    message: "Payment verified and subscription activated",
    subscription,
    invoiceId: invoice._id,
  });
};

// @desc Get my payment history
// @route GET /api/payments/history
exports.getMyPayments = async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate("plan", "name billingCycle")
    .sort({ createdAt: -1 });
  res.json({ success: true, payments });
};

// ===== ADMIN =====

// @desc Get all payments (admin)
// @route GET /api/payments
exports.getAllPayments = async (req, res) => {
  const payments = await Payment.find()
    .populate("plan", "name billingCycle")
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: payments.length, payments });
};
