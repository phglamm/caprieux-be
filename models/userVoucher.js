const mongoose = require("mongoose");

const UserVoucherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    voucher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      required: true,
    },
    redeemedAt: { type: Date, default: Date.now },
    isUsed: { type: Boolean, default: false },
    usedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserVoucher", UserVoucherSchema);
