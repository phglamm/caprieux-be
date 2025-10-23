const Product = require("../models/product");
const mongoose = require("mongoose");

exports.listProducts = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Number(req.query.limit || 20));
    const skip = (page - 1) * limit;
    const searchTerms = req.query.searchTerm;
    if (!searchTerms) {
      const products = await Product.find().skip(skip).limit(limit).exec();
      return res.json(products);
    }
    console.log("productController.listProducts searchTerms:", searchTerms);
    const products = await Product.find({
      $or: [
        { title: { $regex: searchTerms, $options: "i" } },
        { shortDescription: { $regex: searchTerms, $options: "i" } },
        { details: { $regex: searchTerms, $options: "i" } },
      ],
    })
      .skip(skip)
      .limit(limit)
      .exec();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    const p = await Product.findById(id).exec();
    if (!p) return res.status(404).json({ error: "Product not found" });
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    const updated = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    }).exec();
    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { title, shortDescription, price, imageLink, details, brand } =
      req.body;
    console.log("productController.createProduct req.body:", req.body);
    if (!title || !price) {
      return res.status(400).json({ error: "title and price required" });
    }

    const newProduct = new Product({
      title,
      shortDescription,
      price,
      imageLink,
      details,
      brand,
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("productController.createProduct error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    const removed = await Product.findByIdAndDelete(id).exec();
    if (!removed) return res.status(404).json({ error: "Product not found" });
    res.json({ deleted: removed._id });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
