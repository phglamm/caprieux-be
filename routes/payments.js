const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authenticateUser } = require("../middleware/authorizedMiddleware");

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing via PayOS
 */

/**
 * @swagger
 * /api/payments/create-payment-link:
 *   post:
 *     summary: Create a payment link for an order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - phoneNumber
 *               - address
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Nguyen Van A"
 *               phoneNumber:
 *                 type: string
 *                 example: "0901234567"
 *               address:
 *                 type: string
 *                 example: "123 Le Loi, Quan 1, TP.HCM"
 *               productId:
 *                 type: string
 *                 description: Single product mode — product ID
 *                 example: "6654abc123def456"
 *               rentalStartDate:
 *                 type: string
 *                 format: date-time
 *                 description: Global rental start date
 *               rentalEndDate:
 *                 type: string
 *                 format: date-time
 *                 description: Global rental end date
 *               quantity:
 *                 type: integer
 *                 description: Single product mode — quantity (default 1)
 *                 example: 1
 *               items:
 *                 type: array
 *                 description: Cart mode — array of items (overrides productId)
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       example: "6654abc123def456"
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                     rentalStartDate:
 *                       type: string
 *                       format: date-time
 *                     rentalEndDate:
 *                       type: string
 *                       format: date-time
 *     responses:
 *       200:
 *         description: Payment link created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 checkoutUrl:
 *                   type: string
 *                   example: "https://pay.payos.vn/web/xxx"
 *                 orderId:
 *                   type: string
 *                   example: "6654abc123def456"
 *       400:
 *         description: Missing required fields or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized — JWT required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.post("/create-payment-link", authenticateUser, paymentController.createPaymentLink);

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Payment webhook callback
 *     tags: [Payments]
 *     description: Called by the payment gateway or frontend to update order status. When an order is paid, loyalty points are automatically awarded to the user (1 point per 1,000 VND).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderCode
 *             properties:
 *               orderCode:
 *                 type: string
 *                 example: "12345678"
 *               cancel:
 *                 type: string
 *                 description: '"false" for paid, anything else for cancelled'
 *                 example: "false"
 *     responses:
 *       200:
 *         description: Order status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 orderId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [paid, cancelled]
 *       400:
 *         description: Missing orderCode
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.post("/webhook", paymentController.webhook);

module.exports = router;
