const RentalDiscountRule = require("../models/rentalDiscountRule");
const mongoose = require("mongoose");

/**
 * Find the best matching discount rule for a given number of rental days.
 * Returns the rule with the highest minDays that the rentalDays qualifies for.
 * @param {number} rentalDays
 * @returns {Promise<{finalPrice: number, discount: number, rule: object|null}>}
 */
async function findBestRule(rentalDays) {
  const rules = await RentalDiscountRule.find({ isActive: true })
    .sort({ minDays: -1 }) // highest minDays first
    .lean()
    .exec();

  for (const rule of rules) {
    if (rentalDays >= rule.minDays) {
      return rule;
    }
  }
  return null;
}

/**
 * Shared utility: apply the best rental discount to a base total.
 * @param {number} baseTotal - The total price before discount (unitPrice * rentalDays * quantity)
 * @param {number} rentalDays - How many days the rental is for
 * @returns {Promise<{finalPrice: number, discountAmount: number, ruleName: string}>}
 */
async function applyRentalDiscount(baseTotal, rentalDays) {
  const rule = await findBestRule(rentalDays);
  if (!rule) {
    return { finalPrice: baseTotal, discountAmount: 0, ruleName: "" };
  }

  let discountAmount = 0;
  if (rule.discountType === "percentage") {
    discountAmount = Math.round(baseTotal * (rule.discountValue / 100));
  } else if (rule.discountType === "fixed") {
    discountAmount = rule.discountValue;
  }

  // Discount cannot exceed the base total
  discountAmount = Math.min(discountAmount, baseTotal);

  return {
    finalPrice: baseTotal - discountAmount,
    discountAmount,
    ruleName: rule.name,
  };
}

// ─── CRUD Endpoints ──────────────────────────────────────────────────────────

exports.listRules = async (req, res) => {
  try {
    const filter = {};
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }
    const rules = await RentalDiscountRule.find(filter)
      .sort({ minDays: 1 })
      .exec();
    res.json(rules);
  } catch (err) {
    console.error("Error listing rental discount rules:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getRule = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid rule ID" });
    }
    const rule = await RentalDiscountRule.findById(id).exec();
    if (!rule) {
      return res.status(404).json({ error: "Rule not found" });
    }
    res.json(rule);
  } catch (err) {
    console.error("Error fetching rental discount rule:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createRule = async (req, res) => {
  try {
    const { name, minDays, discountType, discountValue } = req.body;
    if (!name || minDays == null || !discountType || discountValue == null) {
      return res.status(400).json({
        error: "name, minDays, discountType, and discountValue are required",
      });
    }
    const rule = new RentalDiscountRule({
      name,
      minDays,
      discountType,
      discountValue,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
    });
    await rule.save();
    res.status(201).json(rule);
  } catch (err) {
    console.error("Error creating rental discount rule:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid rule ID" });
    }
    const rule = await RentalDiscountRule.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).exec();
    if (!rule) {
      return res.status(404).json({ error: "Rule not found" });
    }
    res.json(rule);
  } catch (err) {
    console.error("Error updating rental discount rule:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteRule = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid rule ID" });
    }
    const rule = await RentalDiscountRule.findByIdAndDelete(id).exec();
    if (!rule) {
      return res.status(404).json({ error: "Rule not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting rental discount rule:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── Calculate Preview Endpoint ─────────────────────────────────────────────

exports.calculateDiscount = async (req, res) => {
  try {
    const days = Number(req.query.days);
    const basePrice = Number(req.query.basePrice);

    if (!days || days < 1) {
      return res.status(400).json({ error: "days must be a positive integer" });
    }
    if (!basePrice || basePrice <= 0) {
      return res
        .status(400)
        .json({ error: "basePrice must be a positive number" });
    }

    const baseTotal = basePrice * days;
    const result = await applyRentalDiscount(baseTotal, days);

    res.json({
      days,
      basePricePerDay: basePrice,
      baseTotal,
      discountAmount: result.discountAmount,
      discountRuleName: result.ruleName,
      finalPrice: result.finalPrice,
    });
  } catch (err) {
    console.error("Error calculating rental discount:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Export the shared utility for use in paymentController
exports.applyRentalDiscount = applyRentalDiscount;
