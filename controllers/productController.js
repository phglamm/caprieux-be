const Product = require("../models/product");
const mongoose = require("mongoose");

exports.listProducts = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Number(req.query.limit || 20));
    const skip = (page - 1) * limit;
    const searchTerm = req.query.searchTerm;

    // Build filter object from query params
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.brand) filter.brand = req.query.brand;
    if (req.query.size) filter.size = req.query.size;
    if (req.query.color) filter.color = { $regex: req.query.color, $options: "i" };
    if (req.query.gender) filter.gender = req.query.gender;
    if (req.query.isAvailable !== undefined) filter.isAvailable = req.query.isAvailable === "true";
    if (req.query.condition) filter.condition = req.query.condition;

    if (searchTerm) {
      filter.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { shortDescription: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ];
    }

    const products = await Product.find(filter)
      .populate("category", "name")
      .populate("brand", "name")
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await Product.countDocuments(filter).exec();

    res.json({
      products,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error listing products:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    const p = await Product.findById(id).populate("category", "name").populate("brand", "name").exec();
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
      runValidators: true,
    })
      .populate("category", "name")
      .populate("brand", "name")
      .exec();
    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.json(updated);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      description,
      images,
      category,
      size,
      color,
      material,
      gender,
      brand,
      condition,
      rentalPrice,
      depositAmount,
      minRentalDays,
      maxRentalDays,
      stock,
      isAvailable,
    } = req.body;

    if (!title || !size || rentalPrice == null) {
      return res
        .status(400)
        .json({ error: "title, size, and rentalPrice are required" });
    }

    const newProduct = new Product({
      title,
      shortDescription,
      description,
      images,
      category,
      size,
      color,
      material,
      gender,
      brand,
      condition,
      rentalPrice,
      depositAmount,
      minRentalDays,
      maxRentalDays,
      stock,
      isAvailable,
    });
    await newProduct.save();
    await newProduct.populate("category", "name");
    await newProduct.populate("brand", "name");
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Error creating product:", err);
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
