const Coupon = require("../models/Coupon");
const Plan = require("../models/Plan");

// @desc Validate / apply a coupon
// @route POST /api/coupons/apply
exports.applyCoupon = async (req, res) => {
  const { code, planId } = req.body;

  const coupon = await Coupon.findOne({ code: code?.toUpperCase() });
  if (!coupon) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid coupon code" });
  }

  const usable = coupon.isUsable();
  if (!usable.ok) {
    return res.status(400).json({ success: false, message: usable.reason });
  }

  const plan = await Plan.findById(planId);
  if (!plan) {
    return res.status(404).json({ success: false, message: "Plan not found" });
  }

  if (plan.price < coupon.minAmount) {
    return res.status(400).json({
      success: false,
      message: `Minimum order amount is ${coupon.minAmount}`,
    });
  }

  const discount = coupon.calculateDiscount(plan.price);
  const finalAmount = Math.round((plan.price - discount) * 100) / 100;

  res.json({
    success: true,
    message: "Coupon applied",
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    },
    originalAmount: plan.price,
    discount: Math.round(discount * 100) / 100,
    finalAmount,
  });
};

// ===== ADMIN =====

// @desc Get all coupons
// @route GET /api/coupons
exports.getCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, count: coupons.length, coupons });
};

// @desc Create coupon
// @route POST /api/coupons
exports.createCoupon = async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    maxDiscount,
    minAmount,
    usageLimit,
    expiresAt,
  } = req.body;

  if (!code || !discountType || discountValue === undefined) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    description,
    discountType,
    discountValue,
    maxDiscount: maxDiscount || null,
    minAmount: minAmount || 0,
    usageLimit: usageLimit || null,
    expiresAt: expiresAt || null,
  });

  res.status(201).json({ success: true, coupon });
};

// @desc Update coupon
// @route PUT /api/coupons/:id
exports.updateCoupon = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    return res
      .status(404)
      .json({ success: false, message: "Coupon not found" });
  }

  const fields = [
    "description",
    "discountType",
    "discountValue",
    "maxDiscount",
    "minAmount",
    "usageLimit",
    "expiresAt",
    "isActive",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) coupon[f] = req.body[f];
  });
  if (req.body.code) coupon.code = req.body.code.toUpperCase();

  await coupon.save();
  res.json({ success: true, coupon });
};

// @desc Delete coupon
// @route DELETE /api/coupons/:id
exports.deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    return res
      .status(404)
      .json({ success: false, message: "Coupon not found" });
  }
  await coupon.deleteOne();
  res.json({ success: true, message: "Coupon deleted" });
};
