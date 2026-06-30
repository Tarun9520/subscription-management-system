const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "pending", "paused"],
      default: "pending",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    // When cancelled but still valid till endDate
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
  },
  { timestamps: true }
);

// Helper to check if subscription is currently valid
subscriptionSchema.methods.isValid = function () {
  return (
    this.status === "active" &&
    this.endDate &&
    new Date(this.endDate) > new Date()
  );
};

module.exports = mongoose.model("Subscription", subscriptionSchema);
