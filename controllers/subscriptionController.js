const Subscription = require("../models/Subscription");
const Plan = require("../models/Plan");
const User = require("../models/User");

// @desc Get my current subscription
// @route GET /api/subscriptions/me
exports.getMySubscription = async (req, res) => {
  const subscription = await Subscription.findOne({
    user: req.user._id,
    status: { $in: ["active", "paused"] },
  }).populate("plan");

  res.json({ success: true, subscription: subscription || null });
};

// @desc Get my subscription history
// @route GET /api/subscriptions/history
exports.getMyHistory = async (req, res) => {
  const subscriptions = await Subscription.find({ user: req.user._id })
    .populate("plan")
    .sort({ createdAt: -1 });
  res.json({ success: true, subscriptions });
};

// @desc Cancel subscription (at period end)
// @route PUT /api/subscriptions/cancel
exports.cancelSubscription = async (req, res) => {
  const subscription = await Subscription.findOne({
    user: req.user._id,
    status: "active",
  });

  if (!subscription) {
    return res
      .status(404)
      .json({ success: false, message: "No active subscription found" });
  }

  subscription.cancelAtPeriodEnd = true;
  subscription.autoRenew = false;
  subscription.cancelledAt = new Date();
  await subscription.save();

  res.json({
    success: true,
    message: "Subscription will be cancelled at the end of the billing period",
    subscription,
  });
};

// @desc Resume a cancelled-but-still-active subscription
// @route PUT /api/subscriptions/resume
exports.resumeSubscription = async (req, res) => {
  const subscription = await Subscription.findOne({
    user: req.user._id,
    status: "active",
    cancelAtPeriodEnd: true,
  });

  if (!subscription) {
    return res
      .status(404)
      .json({ success: false, message: "No cancellable subscription found" });
  }

  if (new Date(subscription.endDate) < new Date()) {
    return res
      .status(400)
      .json({ success: false, message: "Subscription period has already ended" });
  }

  subscription.cancelAtPeriodEnd = false;
  subscription.autoRenew = true;
  subscription.cancelledAt = null;
  await subscription.save();

  res.json({
    success: true,
    message: "Subscription resumed",
    subscription,
  });
};

// @desc Pause subscription
// @route PUT /api/subscriptions/pause
exports.pauseSubscription = async (req, res) => {
  const subscription = await Subscription.findOne({
    user: req.user._id,
    status: "active",
  });
  if (!subscription) {
    return res
      .status(404)
      .json({ success: false, message: "No active subscription found" });
  }
  subscription.status = "paused";
  await subscription.save();
  res.json({ success: true, message: "Subscription paused", subscription });
};

// @desc Preview upgrade/downgrade (returns proration info)
// @route POST /api/subscriptions/change-preview
exports.changePreview = async (req, res) => {
  const { newPlanId } = req.body;
  const newPlan = await Plan.findById(newPlanId);
  if (!newPlan) {
    return res.status(404).json({ success: false, message: "Plan not found" });
  }

  const current = await Subscription.findOne({
    user: req.user._id,
    status: "active",
  }).populate("plan");

  let direction = "new";
  let proratedCredit = 0;

  if (current && current.plan) {
    direction =
      newPlan.tier > current.plan.tier
        ? "upgrade"
        : newPlan.tier < current.plan.tier
        ? "downgrade"
        : "same";

    // Calculate remaining value of current subscription
    const totalDays = current.plan.durationInDays;
    const remainingMs = new Date(current.endDate) - new Date();
    const remainingDays = Math.max(0, remainingMs / (1000 * 60 * 60 * 24));
    proratedCredit =
      (current.amountPaid / totalDays) * remainingDays;
    proratedCredit = Math.round(proratedCredit * 100) / 100;
  }

  const amountDue = Math.max(0, newPlan.price - proratedCredit);

  res.json({
    success: true,
    direction,
    newPlan,
    proratedCredit,
    amountDue: Math.round(amountDue * 100) / 100,
  });
};

// ===== ADMIN =====

// @desc Get all subscriptions (admin)
// @route GET /api/subscriptions
exports.getAllSubscriptions = async (req, res) => {
  const subscriptions = await Subscription.find()
    .populate("plan")
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: subscriptions.length, subscriptions });
};

// @desc Analytics (admin)
// @route GET /api/subscriptions/analytics
exports.getAnalytics = async (req, res) => {
  const Payment = require("../models/Payment");

  const totalUsers = await User.countDocuments({ role: "user" });
  const activeSubscribers = await Subscription.countDocuments({
    status: "active",
  });
  const cancelledSubs = await Subscription.countDocuments({
    status: "cancelled",
  });
  const totalSubs = await Subscription.countDocuments();

  // Revenue
  const revenueAgg = await Payment.aggregate([
    { $match: { status: "paid" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;

  // Monthly revenue (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyRevenue = await Payment.aggregate([
    { $match: { status: "paid", createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const revenueChart = monthlyRevenue.map((m) => ({
    label: `${monthNames[m._id.month - 1]} ${m._id.year}`,
    revenue: m.revenue,
    count: m.count,
  }));

  // Plan distribution
  const planDistribution = await Subscription.aggregate([
    { $match: { status: "active" } },
    { $group: { _id: "$plan", count: { $sum: 1 } } },
    {
      $lookup: {
        from: "plans",
        localField: "_id",
        foreignField: "_id",
        as: "plan",
      },
    },
    { $unwind: "$plan" },
    { $project: { name: "$plan.name", count: 1, _id: 0 } },
  ]);

  // Churn rate = cancelled / total subscriptions
  const churnRate =
    totalSubs > 0 ? Math.round((cancelledSubs / totalSubs) * 10000) / 100 : 0;

  res.json({
    success: true,
    analytics: {
      totalUsers,
      activeSubscribers,
      cancelledSubs,
      totalSubs,
      totalRevenue,
      churnRate,
      revenueChart,
      planDistribution,
    },
  });
};
