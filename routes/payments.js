const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const Order = require("../models/order");
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
function getPayOSClient() {
  try {
    if (typeof PayOS === "function")
      return new PayOS(PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY);
    if (PayOS && typeof PayOS.default === "function")
      return new PayOS.default(
        PAYOS_CLIENT_ID,
        PAYOS_API_KEY,
        PAYOS_CHECKSUM_KEY
      );
    if (PayOS && typeof PayOS.create === "function")
      return PayOS.create({
        clientId: PAYOS_CLIENT_ID,
        apiKey: PAYOS_API_KEY,
        checksumKey: PAYOS_CHECKSUM_KEY,
      });
  } catch (e) {
    console.error(
      "Error creating PayOS client:",
      e && e.message ? e.message : e
    );
  }
  throw new Error(
    "Unable to instantiate PayOS client; check @payos/node package version and export shape."
  );
}

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

    const payOSClient = getPayOSClient();
    const paymentLinkResponse = await payOSClient.createPaymentLink(
      paymentRequest
    );

    // Try to persist an Order record
    let savedOrder = null;
    try {
      const orderDoc = new Order({
        orderCode: String(paymentRequest.orderCode),
        productId: product.id || null,
        productSnapshot: product,
        quantity: quantity,
        amount: amount,
        currency: product.currency || "VND",
        checkoutUrl: paymentLinkResponse
          ? paymentLinkResponse.checkoutUrl
          : null,
        payosResponse: paymentLinkResponse,
        returnUrl: paymentRequest.returnUrl,
        cancelUrl: paymentRequest.cancelUrl,
        status: "pending",
      });

      savedOrder = await orderDoc.save();
    } catch (saveErr) {
      console.error(
        "Failed to save order:",
        saveErr && saveErr.stack ? saveErr.stack : saveErr
      );
    }

    if (paymentLinkResponse && paymentLinkResponse.checkoutUrl) {
      return res.json({
        checkoutUrl: paymentLinkResponse.checkoutUrl,
        orderId: savedOrder ? savedOrder._id : null,
      });
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
