const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true, index: true },
    fullName: String,
    phoneNumber: String,
    address: String,
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, default: 1 },
    amount: { type: Number, required: true },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "paid", "cancelled", "failed", "completed"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", OrderSchema);
