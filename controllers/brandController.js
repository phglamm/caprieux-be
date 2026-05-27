const Brand = require("../models/brand");
const mongoose = require("mongoose");

exports.listBrands = async (req, res) => {
  try {
    const filter = {};
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }
    const brands = await Brand.find(filter).sort({ name: 1 }).exec();
    res.json(brands);
  } catch (err) {
    console.error("Error listing brands:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getBrand = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid brand ID" });
    }
    const brand = await Brand.findById(id).exec();
    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }
    res.json(brand);
  } catch (err) {
    console.error("Error fetching brand:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createBrand = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Brand name is required" });
    }
    const existing = await Brand.findOne({ name }).exec();
    if (existing) {
      return res.status(400).json({ error: "Brand already exists" });
    }
    const brand = new Brand({ name, description });
    await brand.save();
    res.status(201).json(brand);
  } catch (err) {
    console.error("Error creating brand:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid brand ID" });
    }
    const brand = await Brand.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).exec();
    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }
    res.json(brand);
  } catch (err) {
    console.error("Error updating brand:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid brand ID" });
    }
    const brand = await Brand.findByIdAndDelete(id).exec();
    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting brand:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
