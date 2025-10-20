const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true, index: true },
  productId: String,
  productSnapshot: { type: mongoose.Schema.Types.Mixed },
  quantity: { type: Number, default: 1 },
  amount: { type: Number, required: true },
  currency: { type: String, default: "VND" },
  checkoutUrl: String,
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "paid", "cancelled", "failed"],
  },
  payosResponse: { type: mongoose.Schema.Types.Mixed },
  returnUrl: String,
  cancelUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

OrderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Order", OrderSchema);
