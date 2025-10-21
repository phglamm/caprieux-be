const User = require("../models/user");
const mongoose = require("mongoose");
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().exec();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const user = await User.findById(id).exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.createUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = new User({ email, password, role });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const user = await User.findByIdAndDelete(id).exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

