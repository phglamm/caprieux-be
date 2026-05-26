const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");
const {
  authenticateUser,
  authorizeAdmin,
} = require("../middleware/authorizedMiddleware");

/**
 * @swagger
 * tags:
 *   name: Vouchers
 *   description: Voucher management and points exchange
 */

// ─── User routes (authenticated) ────────────────────────────────────

/**
 * @swagger
 * /api/vouchers/available:
 *   get:
 *     summary: List vouchers available for exchange
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     description: Returns all active, non-expired vouchers that have not reached their max usage limit.
 *     responses:
 *       200:
 *         description: A list of available vouchers sorted by points cost
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Voucher'
 *       401:
 *         description: Unauthorized — JWT required
 *       500:
 *         description: Internal server error
 */
router.get("/available", authenticateUser, voucherController.getAvailableVouchers);

/**
 * @swagger
 * /api/vouchers/exchange/{id}:
 *   post:
 *     summary: Exchange points for a voucher
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     description: Spends the user's loyalty points to redeem a voucher. Checks point balance, voucher availability, expiry, and usage limits.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Voucher ID to exchange for
 *     responses:
 *       201:
 *         description: Voucher redeemed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Voucher redeemed successfully"
 *                 userVoucher:
 *                   $ref: '#/components/schemas/UserVoucher'
 *                 remainingPoints:
 *                   type: number
 *                   example: 150
 *       400:
 *         description: Not enough points, voucher inactive/expired/maxed out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Not enough points"
 *                 required:
 *                   type: number
 *                   example: 500
 *                 current:
 *                   type: number
 *                   example: 200
 *       401:
 *         description: Unauthorized — JWT required
 *       404:
 *         description: Voucher not found
 *       500:
 *         description: Internal server error
 */
router.post("/exchange/:id", authenticateUser, voucherController.exchangeVoucher);

/**
 * @swagger
 * /api/vouchers/my:
 *   get:
 *     summary: Get my redeemed vouchers
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     description: Returns all vouchers the authenticated user has redeemed, with voucher details populated.
 *     responses:
 *       200:
 *         description: A list of the user's redeemed vouchers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserVoucher'
 *       401:
 *         description: Unauthorized — JWT required
 *       500:
 *         description: Internal server error
 */
router.get("/my", authenticateUser, voucherController.getMyVouchers);

/**
 * @swagger
 * /api/vouchers/my-points:
 *   get:
 *     summary: Get my points balance
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     description: Returns the authenticated user's current loyalty points balance.
 *     responses:
 *       200:
 *         description: Points balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 points:
 *                   type: number
 *                   example: 1500
 *       401:
 *         description: Unauthorized — JWT required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/my-points", authenticateUser, voucherController.getMyPoints);

// ─── Admin routes ───────────────────────────────────────────────────

/**
 * @swagger
 * /api/vouchers:
 *   post:
 *     summary: Create a new voucher template (Admin)
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     description: Admin only. Creates a new voucher template that users can exchange points for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - discountType
 *               - discountValue
 *               - pointsCost
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Giam 10%"
 *               description:
 *                 type: string
 *                 example: "Giam 10% cho don hang tu 500,000 VND"
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *                 example: "percentage"
 *               discountValue:
 *                 type: number
 *                 example: 10
 *               pointsCost:
 *                 type: number
 *                 example: 500
 *               minOrderAmount:
 *                 type: number
 *                 example: 500000
 *               maxUsage:
 *                 type: number
 *                 nullable: true
 *                 example: 100
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: "2026-12-31T23:59:59Z"
 *     responses:
 *       201:
 *         description: Voucher created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Voucher'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized — JWT required
 *       403:
 *         description: Forbidden — Admin access required
 *       500:
 *         description: Internal server error
 */
router.post("/", authenticateUser, authorizeAdmin, voucherController.createVoucher);

/**
 * @swagger
 * /api/vouchers:
 *   get:
 *     summary: List all vouchers (Admin)
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     description: Admin only. Returns all voucher templates sorted by creation date (newest first).
 *     responses:
 *       200:
 *         description: A list of all vouchers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Voucher'
 *       401:
 *         description: Unauthorized — JWT required
 *       403:
 *         description: Forbidden — Admin access required
 *       500:
 *         description: Internal server error
 */
router.get("/", authenticateUser, authorizeAdmin, voucherController.listVouchers);

/**
 * @swagger
 * /api/vouchers/{id}:
 *   put:
 *     summary: Update a voucher (Admin)
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     description: Admin only. Update any fields on a voucher template.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Voucher ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               discountValue:
 *                 type: number
 *               pointsCost:
 *                 type: number
 *               minOrderAmount:
 *                 type: number
 *               maxUsage:
 *                 type: number
 *                 nullable: true
 *               isActive:
 *                 type: boolean
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Updated voucher
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Voucher'
 *       400:
 *         description: Invalid voucher ID
 *       401:
 *         description: Unauthorized — JWT required
 *       403:
 *         description: Forbidden — Admin access required
 *       404:
 *         description: Voucher not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", authenticateUser, authorizeAdmin, voucherController.updateVoucher);

/**
 * @swagger
 * /api/vouchers/{id}:
 *   delete:
 *     summary: Delete a voucher (Admin)
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     description: Admin only. Permanently deletes a voucher template.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Voucher ID
 *     responses:
 *       204:
 *         description: Voucher deleted successfully
 *       400:
 *         description: Invalid voucher ID
 *       401:
 *         description: Unauthorized — JWT required
 *       403:
 *         description: Forbidden — Admin access required
 *       404:
 *         description: Voucher not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", authenticateUser, authorizeAdmin, voucherController.deleteVoucher);

module.exports = router;
