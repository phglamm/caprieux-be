const mongoose = require("mongoose");

const MeasurementSchema = new mongoose.Schema({}, { strict: false });

const ProductSchema = new mongoose.Schema({
  id: { type: String, index: true, unique: true, required: true },
  title: { type: String, required: true },
  shortDescription: String,
  price: { type: Number, required: true },
  currency: { type: String, default: "VND" },
  imageLink: String,
  details: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ProductSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Product", ProductSchema);
