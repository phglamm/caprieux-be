const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Clothing rental product management
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: List rental products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page (max 100)
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search by title or description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *           enum: [XS, S, M, L, XL, XXL, XXXL, Free Size]
 *         description: Filter by size
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *         description: Filter by color (case-insensitive)
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [male, female, unisex]
 *         description: Filter by gender
 *       - in: query
 *         description: Filter by condition
 *       - in: query
 *         name: isAvailable
 *         schema:
 *           type: boolean
 *         description: Filter by availability
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand ID
 *     responses:
 *       200:
 *         description: Paginated list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 20
 *                 total:
 *                   type: integer
 *                   example: 50
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *       500:
 *         description: Server error
 */
router.get("/", productController.listProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 */
router.get("/:id", productController.getProduct);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new rental product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - size
 *               - rentalPrice
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Ao Dai Lua Do"
 *               shortDescription:
 *                 type: string
 *                 example: "Red silk ao dai for rent"
 *               description:
 *                 type: string
 *                 example: "Beautiful red silk ao dai, perfect for weddings and Tet celebrations"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"]
 *               category:
 *                 type: string
 *                 description: Category ID
 *                 example: "6654abc123def456"
 *               size:
 *                 type: string
 *                 enum: [XS, S, M, L, XL, XXL, XXXL, Free Size]
 *                 example: "M"
 *               color:
 *                 type: string
 *                 example: "Red"
 *               material:
 *                 type: string
 *                 example: "Silk"
 *               gender:
 *                 type: string
 *                 enum: [male, female, unisex]
 *                 example: "female"
 *               brand:
 *                 type: string
 *                 description: Brand ID
 *                 example: "6654abc123def789"
 *               condition:
 *                 type: string
 *                 enum: [new, like_new, good, fair]
 *                 example: "new"
 *               rentalPrice:
 *                 type: number
 *                 description: "Price per day in VND"
 *                 example: 350000
 *               depositAmount:
 *                 type: number
 *                 description: "Refundable deposit in VND"
 *                 example: 500000
 *               minRentalDays:
 *                 type: integer
 *                 description: "Minimum rental days"
 *                 example: 1
 *               maxRentalDays:
 *                 type: integer
 *                 description: "Maximum rental days"
 *                 example: 30
 *               stock:
 *                 type: integer
 *                 example: 3
 *               isAvailable:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post("/", productController.createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deleted:
 *                   type: string
 *                   example: "6654abc123def456"
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 */
router.delete("/:id", productController.deleteProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               shortDescription:
 *                 type: string
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               category:
 *                 type: string
 *               size:
 *                 type: string
 *                 enum: [XS, S, M, L, XL, XXL, XXXL, Free Size]
 *               color:
 *                 type: string
 *               material:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, unisex]
 *               brand:
 *                 type: string
 *                 description: Brand ID
 *               condition:
 *                 type: string
 *                 enum: [new, like_new, good, fair]
 *               rentalPrice:
 *                 type: number
 *               depositAmount:
 *                 type: number
 *               stock:
 *                 type: integer
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 */
router.put("/:id", productController.updateProduct);

module.exports = router;
