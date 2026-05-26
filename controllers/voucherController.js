const Voucher = require("../models/voucher");
const UserVoucher = require("../models/userVoucher");
const User = require("../models/user");
const mongoose = require("mongoose");

// ─── Admin Endpoints ────────────────────────────────────────────────

// Create a new voucher template
exports.createVoucher = async (req, res) => {
  try {
    const {
      name,
      description,
      discountType,
      discountValue,
      pointsCost,
      minOrderAmount,
      maxUsage,
      expiresAt,
    } = req.body;

    if (!name || !discountType || discountValue == null || pointsCost == null) {
      return res.status(400).json({
        error: "name, discountType, discountValue, and pointsCost are required",
      });
    }

    // Auto-generate a unique voucher code
    const code =
      "VC-" +
      Date.now().toString(36).toUpperCase() +
      "-" +
      Math.random().toString(36).substring(2, 6).toUpperCase();

    const voucher = new Voucher({
      code,
      name,
      description: description || "",
      discountType,
      discountValue,
      pointsCost,
      minOrderAmount: minOrderAmount || 0,
      maxUsage: maxUsage || null,
      expiresAt: expiresAt || null,
    });

    await voucher.save();
    res.status(201).json(voucher);
  } catch (err) {
    console.error("Error creating voucher:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// List all vouchers (admin view)
exports.listVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 }).exec();
    res.json(vouchers);
  } catch (err) {
    console.error("Error listing vouchers:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a voucher template
exports.updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid voucher ID" });
    }

    const voucher = await Voucher.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).exec();

    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    res.json(voucher);
  } catch (err) {
    console.error("Error updating voucher:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a voucher template
exports.deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid voucher ID" });
    }

    const voucher = await Voucher.findByIdAndDelete(id).exec();
    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    res.status(204).send();
  } catch (err) {
    console.error("Error deleting voucher:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── User Endpoints ─────────────────────────────────────────────────

// Get available vouchers for exchange (active, not expired, not maxed out)
exports.getAvailableVouchers = async (req, res) => {
  try {
    const now = new Date();
    const vouchers = await Voucher.find({
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
      $expr: {
        $or: [
          { $eq: ["$maxUsage", null] },
          { $lt: ["$usedCount", "$maxUsage"] },
        ],
      },
    })
      .sort({ pointsCost: 1 })
      .exec();

    res.json(vouchers);
  } catch (err) {
    console.error("Error fetching available vouchers:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Exchange points for a voucher
exports.exchangeVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid voucher ID" });
    }

    // Find the voucher
    const voucher = await Voucher.findById(id).exec();
    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    // Validate voucher is available
    if (!voucher.isActive) {
      return res.status(400).json({ error: "Voucher is no longer active" });
    }
    if (voucher.expiresAt && voucher.expiresAt < new Date()) {
      return res.status(400).json({ error: "Voucher has expired" });
    }
    if (voucher.maxUsage !== null && voucher.usedCount >= voucher.maxUsage) {
      return res
        .status(400)
        .json({ error: "Voucher has reached maximum redemptions" });
    }

    // Check user has enough points
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.points < voucher.pointsCost) {
      return res.status(400).json({
        error: "Not enough points",
        required: voucher.pointsCost,
        current: user.points,
      });
    }

    // Deduct points from user
    user.points -= voucher.pointsCost;
    await user.save();

    // Increment voucher usage count
    voucher.usedCount += 1;
    await voucher.save();

    // Create UserVoucher record
    const userVoucher = new UserVoucher({
      user: userId,
      voucher: voucher._id,
      redeemedAt: new Date(),
    });
    await userVoucher.save();

    // Populate voucher details in the response
    await userVoucher.populate("voucher");

    res.status(201).json({
      message: "Voucher redeemed successfully",
      userVoucher,
      remainingPoints: user.points,
    });
  } catch (err) {
    console.error("Error exchanging voucher:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get the authenticated user's redeemed vouchers
exports.getMyVouchers = async (req, res) => {
  try {
    const userId = req.user.id;
    const userVouchers = await UserVoucher.find({ user: userId })
      .populate("voucher")
      .sort({ redeemedAt: -1 })
      .exec();

    res.json(userVouchers);
  } catch (err) {
    console.error("Error fetching user vouchers:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get the authenticated user's points balance
exports.getMyPoints = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("points").exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ points: user.points });
  } catch (err) {
    console.error("Error fetching user points:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
