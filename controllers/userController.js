const User = require("../models/user");
const mongoose = require("mongoose");

// ─── Admin / Internal CRUD ────────────────────────────────────────────────────

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").exec();
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
    const user = await User.findById(id).select("-password").exec();
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
    const { username, email, password, role } = req.body;
    const user = new User({ username, email, password, role });
    await user.save();
    const { password: _pw, ...userObj } = user.toObject();
    res.status(201).json(userObj);
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

// ─── Profile (authenticated user) ────────────────────────────────────────────

/**
 * GET /api/users/profile
 * Returns the profile of the currently logged-in user.
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select("-password").exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PUT /api/users/profile
 * Updates the profile of the currently logged-in user.
 * Allowed fields: fullName, phone, dob, gender, address.*
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const { fullName, phone, dob, gender, address } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (dob !== undefined) updateData.dob = dob;
    if (gender !== undefined) updateData.gender = gender;

    // Merge nested address fields individually so partial updates work
    if (address && typeof address === "object") {
      const allowedAddressFields = ["street", "ward", "district", "city", "country"];
      allowedAddressFields.forEach((field) => {
        if (address[field] !== undefined) {
          updateData[`address.${field}`] = address[field];
        }
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .select("-password")
      .exec();

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
