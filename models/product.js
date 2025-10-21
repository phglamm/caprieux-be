const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    shortDescription: String,
    price: { type: Number, required: true },
    brand: String,
    imageLink: String,
    details: { type: mongoose.Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", ProductSchema);
