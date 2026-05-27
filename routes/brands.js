const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const {
  authenticateUser,
  authorizeAdmin,
} = require("../middleware/authorizedMiddleware");

/**
 * @swagger
 * tags:
 *   name: Brands
 *   description: Clothing brand management
 */

/**
 * @swagger
 * /api/brands:
 *   get:
 *     summary: List all brands
 *     tags: [Brands]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: A list of brands sorted alphabetically
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Brand'
 *       500:
 *         description: Internal server error
 */
router.get("/", brandController.listBrands);

/**
 * @swagger
 * /api/brands/{id}:
 *   get:
 *     summary: Get a single brand by ID
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Brand details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Invalid brand ID
 *       404:
 *         description: Brand not found
 */
router.get("/:id", brandController.getBrand);

/**
 * @swagger
 * /api/brands:
 *   post:
 *     summary: Create a new brand (Admin)
 *     tags: [Brands]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Gucci"
 *               description:
 *                 type: string
 *                 example: "Italian luxury fashion brand"
 *     responses:
 *       201:
 *         description: Brand created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Missing name or brand already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post("/", authenticateUser, authorizeAdmin, brandController.createBrand);

/**
 * @swagger
 * /api/brands/{id}:
 *   put:
 *     summary: Update a brand (Admin)
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
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
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated brand
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Invalid brand ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Brand not found
 */
router.put("/:id", authenticateUser, authorizeAdmin, brandController.updateBrand);

/**
 * @swagger
 * /api/brands/{id}:
 *   delete:
 *     summary: Delete a brand (Admin)
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     responses:
 *       204:
 *         description: Brand deleted successfully
 *       400:
 *         description: Invalid brand ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Brand not found
 */
router.delete("/:id", authenticateUser, authorizeAdmin, brandController.deleteBrand);

module.exports = router;
