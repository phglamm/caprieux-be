const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Julia API",
      version: "1.0.0",
      description: "API documentation for the Julia clothes rental backend",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      schemas: {
        Product: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6654abc123def456" },
            title: { type: "string", example: "Ao Dai Lua Do" },
            shortDescription: {
              type: "string",
              example: "Red silk ao dai for rent",
            },
            description: {
              type: "string",
              example: "Beautiful red silk ao dai, perfect for weddings and Tet celebrations",
            },
            images: {
              type: "array",
              items: { type: "string" },
              example: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
            },
            category: {
              type: "object",
              properties: {
                _id: { type: "string", example: "6654abc123def456" },
                name: { type: "string", example: "Ao Dai" },
              },
            },
            size: {
              type: "string",
              enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Free Size"],
              example: "M",
            },
            color: { type: "string", example: "Red" },
            material: { type: "string", example: "Silk" },
            gender: {
              type: "string",
              enum: ["male", "female", "unisex"],
              example: "female",
            },
            brand: { type: "string", example: "Julia" },
            condition: {
              type: "string",
              enum: ["new", "like_new", "good", "fair"],
              example: "new",
            },
            rentalType: {
              type: "string",
              enum: ["fixed", "per_day"],
              example: "fixed",
            },
            rentalPrice: { type: "number", example: 350000 },
            depositAmount: { type: "number", example: 500000 },
            stock: { type: "integer", example: 3 },
            isAvailable: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Category: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6654abc123def456" },
            name: { type: "string", example: "Ao Dai" },
            description: {
              type: "string",
              example: "Traditional Vietnamese long dress",
            },
            isActive: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6654abc123def456" },
            username: { type: "string", example: "john_doe" },
            email: { type: "string", example: "john@example.com" },
            points: { type: "number", example: 400 },
            role: { type: "string", enum: ["user", "admin"], example: "user" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Order: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6654abc123def456" },
            orderCode: { type: "string", example: "12345678" },
            user: { type: "string", example: "6654abc123def456" },
            fullName: { type: "string", example: "Nguyen Van A" },
            phoneNumber: { type: "string", example: "0901234567" },
            address: {
              type: "string",
              example: "123 Le Loi, Quan 1, TP.HCM",
            },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product: { type: "string", example: "6654abc123def456" },
                  quantity: { type: "number", example: 2 },
                  price: { type: "number", example: 250000 },
                },
              },
            },
            amount: { type: "number", example: 500000 },
            status: {
              type: "string",
              enum: ["pending", "paid", "cancelled", "failed", "completed"],
              example: "pending",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Voucher: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6654abc123def456" },
            code: { type: "string", example: "VC-M1ABC-XY2Z" },
            name: { type: "string", example: "Giam 10%" },
            description: {
              type: "string",
              example: "Giam 10% cho don hang tu 500,000 VND",
            },
            discountType: {
              type: "string",
              enum: ["percentage", "fixed"],
              example: "percentage",
            },
            discountValue: { type: "number", example: 10 },
            pointsCost: { type: "number", example: 500 },
            minOrderAmount: { type: "number", example: 500000 },
            maxUsage: {
              type: "number",
              nullable: true,
              example: 100,
            },
            usedCount: { type: "number", example: 0 },
            isActive: { type: "boolean", example: true },
            expiresAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        UserVoucher: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6654abc123def456" },
            user: { type: "string", example: "6654abc123def456" },
            voucher: { $ref: "#/components/schemas/Voucher" },
            redeemedAt: { type: "string", format: "date-time" },
            isUsed: { type: "boolean", example: false },
            usedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Error message" },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
