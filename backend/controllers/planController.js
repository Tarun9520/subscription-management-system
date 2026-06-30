const Plan = require("../models/Plan");

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const cycleToDays = { monthly: 30, quarterly: 90, yearly: 365 };

// @desc Get all active plans (public)
// @route GET /api/plans
exports.getPlans = async (req, res) => {
  const filter = req.query.all === "true" ? {} : { isActive: true };
  const plans = await Plan.find(filter).sort({ tier: 1, price: 1 });
  res.json({ success: true, count: plans.length, plans });
};

// @desc Get single plan
// @route GET /api/plans/:id
exports.getPlan = async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) {
    return res.status(404).json({ success: false, message: "Plan not found" });
  }
  res.json({ success: true, plan });
};

// @desc Create plan (admin)
// @route POST /api/plans
exports.createPlan = async (req, res) => {
  const {
    name,
    description,
    price,
    billingCycle,
    features,
    tier,
    isPopular,
    currency,
  } = req.body;

  if (!name || price === undefined || !billingCycle) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  const plan = await Plan.create({
    name,
    slug: slugify(name) + "-" + billingCycle,
    description,
    price,
    currency: currency || "INR",
    billingCycle,
    durationInDays: cycleToDays[billingCycle] || 30,
    features: features || [],
    tier: tier || 1,
    isPopular: !!isPopular,
  });

  res.status(201).json({ success: true, plan });
};

// @desc Update plan (admin)
// @route PUT /api/plans/:id
exports.updatePlan = async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) {
    return res.status(404).json({ success: false, message: "Plan not found" });
  }

  const fields = [
    "name",
    "description",
    "price",
    "billingCycle",
    "features",
    "tier",
    "isPopular",
    "isActive",
    "currency",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) plan[f] = req.body[f];
  });

  if (req.body.billingCycle) {
    plan.durationInDays = cycleToDays[req.body.billingCycle] || plan.durationInDays;
  }
  if (req.body.name || req.body.billingCycle) {
    plan.slug = slugify(plan.name) + "-" + plan.billingCycle;
  }

  await plan.save();
  res.json({ success: true, plan });
};

// @desc Delete plan (admin)
// @route DELETE /api/plans/:id
exports.deletePlan = async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) {
    return res.status(404).json({ success: false, message: "Plan not found" });
  }
  // Soft delete by deactivating to preserve historical references
  plan.isActive = false;
  await plan.save();
  res.json({ success: true, message: "Plan deactivated" });
};
