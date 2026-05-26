const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  authenticateUser,
  authorizeAdmin,
} = require("../middleware/authorizedMiddleware");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       properties:
 *         street:
 *           type: string
 *           example: "123 Nguyen Hue"
 *         ward:
 *           type: string
 *           example: "Ben Nghe"
 *         district:
 *           type: string
 *           example: "District 1"
 *         city:
 *           type: string
 *           example: "Ho Chi Minh City"
 *         country:
 *           type: string
 *           example: "Vietnam"
 *     UserProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "664f2a3b1c9d4e001f8b4567"
 *         username:
 *           type: string
 *           example: "john_doe"
 *         email:
 *           type: string
 *           example: "john@example.com"
 *         fullName:
 *           type: string
 *           example: "John Doe"
 *         phone:
 *           type: string
 *           example: "0901234567"
 *         dob:
 *           type: string
 *           format: date
 *           example: "1995-08-15"
 *         gender:
 *           type: string
 *           enum: [male, female, other, ""]
 *           example: "male"
 *         address:
 *           $ref: '#/components/schemas/Address'
 *         points:
 *           type: number
 *           example: 150
 *         role:
 *           type: string
 *           example: "user"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// ─── Profile routes (requires authentication) ─────────────────────────────────

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get the current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/profile", authenticateUser, userController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update the current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "John Doe"
 *               phone:
 *                 type: string
 *                 example: "0901234567"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1995-08-15"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: "male"
 *               address:
 *                 $ref: '#/components/schemas/Address'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put("/profile", authenticateUser, userController.updateProfile);

// ─── Admin-only routes ────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserProfile'
 *       403:
 *         description: Forbidden
 */
router.get("/", authenticateUser, authorizeAdmin, userController.listUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a specific user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's MongoDB ObjectId
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 */
router.get("/:id", authenticateUser, authorizeAdmin, userController.getUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 */
router.delete("/:id", authenticateUser, authorizeAdmin, userController.deleteUser);

module.exports = router;
