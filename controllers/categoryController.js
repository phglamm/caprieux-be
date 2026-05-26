const Category = require("../models/category");
const mongoose = require("mongoose");

exports.listCategories = async (req, res) => {
  try {
    const filter = {};
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }
    const categories = await Category.find(filter).sort({ name: 1 }).exec();
    res.json(categories);
  } catch (err) {
    console.error("Error listing categories:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }
    const category = await Category.findById(id).exec();
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    console.error("Error fetching category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }
    const existing = await Category.findOne({ name }).exec();
    if (existing) {
      return res.status(400).json({ error: "Category already exists" });
    }
    const category = new Category({ name, description });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }
    const category = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).exec();
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }
    const category = await Category.findByIdAndDelete(id).exec();
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
