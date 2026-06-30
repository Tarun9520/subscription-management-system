require("dotenv").config();
const connectDB = require("./config/db");
const Plan = require("./models/Plan");
const Coupon = require("./models/Coupon");
const User = require("./models/User");

const plans = [
  {
    name: "Basic",
    slug: "basic-monthly",
    description: "Perfect for individuals getting started.",
    price: 199,
    billingCycle: "monthly",
    durationInDays: 30,
    tier: 1,
    features: ["1 User", "Basic Analytics", "Email Support", "5GB Storage"],
  },
  {
    name: "Pro",
    slug: "pro-monthly",
    description: "For growing teams and professionals.",
    price: 499,
    billingCycle: "monthly",
    durationInDays: 30,
    tier: 2,
    isPopular: true,
    features: [
      "5 Users",
      "Advanced Analytics",
      "Priority Support",
      "50GB Storage",
      "Custom Branding",
    ],
  },
  {
    name: "Pro Quarterly",
    slug: "pro-quarterly",
    description: "Pro plan billed quarterly. Save 10%.",
    price: 1349,
    billingCycle: "quarterly",
    durationInDays: 90,
    tier: 2,
    features: [
      "5 Users",
      "Advanced Analytics",
      "Priority Support",
      "50GB Storage",
      "Custom Branding",
    ],
  },
  {
    name: "Enterprise Yearly",
    slug: "enterprise-yearly",
    description: "Best value for large organizations.",
    price: 4999,
    billingCycle: "yearly",
    durationInDays: 365,
    tier: 3,
    features: [
      "Unlimited Users",
      "Premium Analytics",
      "24/7 Dedicated Support",
      "1TB Storage",
      "Custom Branding",
      "API Access",
      "SLA Guarantee",
    ],
  },
];

const coupons = [
  {
    code: "WELCOME10",
    description: "10% off for new users",
    discountType: "percentage",
    discountValue: 10,
    maxDiscount: 200,
    minAmount: 0,
  },
  {
    code: "FLAT100",
    description: "Flat 100 off",
    discountType: "fixed",
    discountValue: 100,
    minAmount: 200,
  },
];

const seed = async () => {
  try {
    await connectDB();

    await Plan.deleteMany();
    await Plan.insertMany(plans);
    console.log("Plans seeded");

    await Coupon.deleteMany();
    await Coupon.insertMany(coupons);
    console.log("Coupons seeded");

    const adminExists = await User.findOne({ email: "admin@platform.com" });
    if (!adminExists) {
      await User.create({
        name: "Admin",
        email: "admin@platform.com",
        password: "admin123",
        role: "admin",
      });
      console.log("Admin user created: admin@platform.com / admin123");
    }

    console.log("Seeding complete");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
