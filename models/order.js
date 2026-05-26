const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    fullName: String,
    phoneNumber: String,
    address: String,
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true },
        rentalDays: { type: Number, default: 1 },
        rentalStartDate: { type: Date },
        rentalEndDate: { type: Date },
      },
    ],
    amount: { type: Number, required: true },
    totalDepositAmount: { type: Number, default: 0 },
    rentalStartDate: { type: Date },
    rentalEndDate: { type: Date },
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
