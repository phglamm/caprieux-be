const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const { nanoid } = require("nanoid");

// List all products (with optional pagination)
router.get("/", async function (req, res, next) {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Number(req.query.limit || 20));
  const skip = (page - 1) * limit;
  const products = await Product.find().skip(skip).limit(limit).exec();
  res.json(products);
});

// Get single product
router.get("/:id", async function (req, res, next) {
  const p = await Product.findOne({ id: req.params.id }).exec();
  if (!p) return res.status(404).json({ error: "Product not found" });
  res.json(p);
});

// Create product
router.post("/", async function (req, res, next) {
  const data = req.body;
  if (!data || !data.title || !data.price)
    return res.status(400).json({ error: "title and price required" });
  const newProduct = new Product(
    Object.assign({}, data, { id: data.id || nanoid(10) })
  );
  await newProduct.save();
  res.status(201).json(newProduct);
});

// Update product (partial)
router.patch("/:id", async function (req, res, next) {
  const updated = await Product.findOneAndUpdate(
    { id: req.params.id },
    { $set: req.body },
    { new: true }
  ).exec();
  if (!updated) return res.status(404).json({ error: "Product not found" });
  res.json(updated);
});

// Delete product
router.delete("/:id", async function (req, res, next) {
  const removed = await Product.findOneAndDelete({ id: req.params.id }).exec();
  if (!removed) return res.status(404).json({ error: "Product not found" });
  res.json({ deleted: removed.id });
});

module.exports = router;
