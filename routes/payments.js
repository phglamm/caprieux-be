const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const PayOS = require("@payos/node");

const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID || "";
const PAYOS_API_KEY = process.env.PAYOS_API_KEY || "";
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY || "";

if (!PAYOS_CLIENT_ID || !PAYOS_API_KEY || !PAYOS_CHECKSUM_KEY) {
  console.warn(
    "Warning: PayOS credentials are missing. /api/payments/create-payment-link will fail until they are set."
  );
}

// Lazy factory to create PayOS client. Handles different export shapes.
const payOs = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

// POST /api/payments/create-payment-link
// body: { productId?, product?, quantity?, returnUrl?, cancelUrl? }
router.post("/create-payment-link", async (req, res) => {
  try {
    const body = req.body || {};
    let product = null;

    if (body.productId) {
      product = await Product.findOne({ id: body.productId }).lean().exec();
      if (!product) return res.status(404).json({ error: "Product not found" });
    } else if (body.product) {
      product = body.product;
    } else {
      return res.status(400).json({ error: "productId or product required" });
    }

    const quantity = Number(body.quantity || 1);
    if (!Number.isInteger(quantity) || quantity < 1)
      return res.status(400).json({ error: "Invalid quantity" });

    const unitPrice = Number(product.price || 0);
    if (unitPrice <= 0)
      return res.status(400).json({ error: "Invalid product price" });

    const amount = unitPrice * quantity;

    const YOUR_DOMAIN =
      process.env.YOUR_DOMAIN || `${req.protocol}://${req.get("host")}`;

    const paymentRequest = {
      orderCode: Number(String(Date.now()).slice(-8)),
      amount: amount,
      description: `${product.title || "product"}`,
      items: [
        {
          name: product.title || "Thuê đồ quần áo",
          quantity: quantity,
          price: unitPrice,
        },
      ],
      returnUrl: body.returnUrl || `${YOUR_DOMAIN}/success.html`,
      cancelUrl: body.cancelUrl || `${YOUR_DOMAIN}/cancel.html`,
    };

    const paymentLinkResponse = await payOs.createPaymentLink(paymentRequest);

    if (paymentLinkResponse && paymentLinkResponse.checkoutUrl) {
      return res.json({ checkoutUrl: paymentLinkResponse.checkoutUrl });
    }

    return res.status(500).json({
      error: "Failed to create payment link",
      details: paymentLinkResponse,
    });
  } catch (err) {
    console.error(
      "payments.create-payment-link error:",
      err && err.stack ? err.stack : err
    );
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
