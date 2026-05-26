const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    // ─── Basic Info ──────────────────────────────────────────────────
    title: { type: String, required: true },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    images: [{ type: String }],

    // ─── Clothing Attributes ─────────────────────────────────────────
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    size: {
      type: String,
      enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Free Size"],
      required: true,
    },
    color: { type: String, default: "" },
    material: { type: String, default: "" },
    gender: {
      type: String,
      enum: ["male", "female", "unisex"],
      default: "unisex",
    },
    brand: { type: String, default: "" },
    condition: {
      type: String,
      enum: ["new", "like_new", "good", "fair"],
      default: "new",
    },

    // ─── Rental Pricing ──────────────────────────────────────────────
    rentalType: {
      type: String,
      enum: ["fixed", "per_day"],
      required: true,
    },
    rentalPrice: { type: Number, required: true },
    depositAmount: { type: Number, default: 0 },
    minRentalDays: { type: Number, default: 1 },
    maxRentalDays: { type: Number, default: 30 },

    // ─── Stock & Availability ────────────────────────────────────────
    stock: { type: Number, default: 1 },
    isAvailable: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", ProductSchema);
