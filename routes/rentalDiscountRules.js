const express = require("express");
const router = express.Router();
const ruleController = require("../controllers/rentalDiscountRuleController");
const {
  authenticateUser,
  authorizeAdmin,
} = require("../middleware/authorizedMiddleware");

/**
 * @swagger
 * tags:
 *   name: RentalDiscountRules
 *   description: Configurable rental duration discount rules
 */

/**
 * @swagger
 * /api/rental-discount-rules/calculate:
 *   get:
 *     summary: Preview discount calculation for a given rental
 *     tags: [RentalDiscountRules]
 *     parameters:
 *       - in: query
 *         name: days
 *         required: true
 *         schema:
 *           type: integer
 *           example: 5
 *         description: Number of rental days
 *       - in: query
 *         name: basePrice
 *         required: true
 *         schema:
 *           type: number
 *           example: 100000
 *         description: Base rental price per day (VND)
 *     responses:
 *       200:
 *         description: Discount calculation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 days:
 *                   type: integer
 *                   example: 5
 *                 basePricePerDay:
 *                   type: number
 *                   example: 100000
 *                 baseTotal:
 *                   type: number
 *                   example: 500000
 *                 discountAmount:
 *                   type: number
 *                   example: 50000
 *                 discountRuleName:
 *                   type: string
 *                   example: "5-day discount"
 *                 finalPrice:
 *                   type: number
 *                   example: 450000
 *       400:
 *         description: Invalid parameters
 */
// NOTE: This route MUST come before /:id to avoid "calculate" being parsed as an ID
router.get("/calculate", ruleController.calculateDiscount);

/**
 * @swagger
 * /api/rental-discount-rules:
 *   get:
 *     summary: List all rental discount rules
 *     tags: [RentalDiscountRules]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: A list of rules sorted by minDays ascending
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RentalDiscountRule'
 *       500:
 *         description: Internal server error
 */
router.get("/", ruleController.listRules);

/**
 * @swagger
 * /api/rental-discount-rules/{id}:
 *   get:
 *     summary: Get a single rental discount rule by ID
 *     tags: [RentalDiscountRules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rule ID
 *     responses:
 *       200:
 *         description: Rule details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RentalDiscountRule'
 *       400:
 *         description: Invalid rule ID
 *       404:
 *         description: Rule not found
 */
router.get("/:id", ruleController.getRule);

/**
 * @swagger
 * /api/rental-discount-rules:
 *   post:
 *     summary: Create a new rental discount rule (Admin)
 *     tags: [RentalDiscountRules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - minDays
 *               - discountType
 *               - discountValue
 *             properties:
 *               name:
 *                 type: string
 *                 example: "5-day discount"
 *               minDays:
 *                 type: integer
 *                 description: Minimum rental days to qualify
 *                 example: 5
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *                 example: "percentage"
 *               discountValue:
 *                 type: number
 *                 description: "Discount amount (percentage value or fixed VND amount)"
 *                 example: 10
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Rule created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RentalDiscountRule'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post("/", authenticateUser, authorizeAdmin, ruleController.createRule);

/**
 * @swagger
 * /api/rental-discount-rules/{id}:
 *   put:
 *     summary: Update a rental discount rule (Admin)
 *     tags: [RentalDiscountRules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rule ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               minDays:
 *                 type: integer
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               discountValue:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated rule
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RentalDiscountRule'
 *       400:
 *         description: Invalid rule ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Rule not found
 */
router.put("/:id", authenticateUser, authorizeAdmin, ruleController.updateRule);

/**
 * @swagger
 * /api/rental-discount-rules/{id}:
 *   delete:
 *     summary: Delete a rental discount rule (Admin)
 *     tags: [RentalDiscountRules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rule ID
 *     responses:
 *       204:
 *         description: Rule deleted successfully
 *       400:
 *         description: Invalid rule ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Rule not found
 */
router.delete("/:id", authenticateUser, authorizeAdmin, ruleController.deleteRule);

module.exports = router;
