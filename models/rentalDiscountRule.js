const mongoose = require("mongoose");

const RentalDiscountRuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    minDays: { type: Number, required: true },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RentalDiscountRule", RentalDiscountRuleSchema);
