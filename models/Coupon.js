const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: null, // for percentage caps
    },
    minAmount: {
      type: Number,
      default: 0,
    },
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Validate coupon usability
couponSchema.methods.isUsable = function () {
  if (!this.isActive) return { ok: false, reason: "Coupon is inactive" };
  if (this.expiresAt && new Date(this.expiresAt) < new Date())
    return { ok: false, reason: "Coupon has expired" };
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit)
    return { ok: false, reason: "Coupon usage limit reached" };
  return { ok: true };
};

// Calculate discount for an amount
couponSchema.methods.calculateDiscount = function (amount) {
  let discount = 0;
  if (this.discountType === "percentage") {
    discount = (amount * this.discountValue) / 100;
    if (this.maxDiscount !== null) {
      discount = Math.min(discount, this.maxDiscount);
    }
  } else {
    discount = this.discountValue;
  }
  return Math.min(discount, amount);
};

module.exports = mongoose.model("Coupon", couponSchema);
