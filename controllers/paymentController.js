const Product = require("../models/product");
const Order = require("../models/order");
const PayOS = require("@payos/node");
const payOs = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);
exports.createPaymentLink = async (req, res) => {
  try {
    const body = req.body || {};
    let product = null;
    if (!body.address || !body.fullName || !body.phoneNumber) {
      return res
        .status(400)
        .json({ error: "address, fullName, phoneNumber required" });
    }
    if (body.productId) {
      // Product model stores products with ObjectId _id. Use findById.
      product = await Product.findById(body.productId).lean().exec();
      if (!product) return res.status(404).json({ error: "Product not found" });
    } else if (body.product) {
      // allow passing a product object directly (e.g., from client), but ensure required fields exist
      product = body.product;
      if (!product.title || typeof product.price === "undefined") {
        return res.status(400).json({ error: "Invalid product object" });
      }
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

    // Generate an orderCode first so it can be used in return/cancel URLs
    const orderCode = String(Number(String(Date.now()).slice(-8)));

    const paymentRequest = {
      orderCode: Number(orderCode),
      // amount: amount,
      amount: 10000,
      description: `${product.title || "product"}`,
      items: [
        {
          name: product.title || "product",
          quantity: quantity,
          price: unitPrice,
        },
      ],
      returnUrl: `${YOUR_DOMAIN}/order-success/?orderCode=${orderCode}&code=01`,
      cancelUrl: `${YOUR_DOMAIN}/order-failed/?orderCode=${orderCode}&code=00`,
    };

    const paymentLinkResponse = await payOs.createPaymentLink(paymentRequest);

    let savedOrder = null;
    try {
      const orderDoc = new Order({
        orderCode: orderCode,
        fullName: body.fullName || null,
        phoneNumber: body.phoneNumber || null,
        address: body.address || null,
        product: body.productId || product._id || null,
        quantity: quantity,
        amount: amount,
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
};

exports.webhook = async (req, res) => {
  try {
    const { orderCode, code } = req.body || {};
    if (!orderCode) {
      return res.status(400).json({ error: "orderCode is required" });
    }
    const order = await Order.findOne({ orderCode: String(orderCode) }).exec();
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (code === "01") {
      order.status = "paid";
    } else {
      order.status = "cancelled";
    }

    await order.save();

    return res
      .status(200)
      .json({ ok: true, orderId: order._id, status: order.status });
  } catch (err) {
    console.error(
      "Webhook handling error:",
      err && err.stack ? err.stack : err
    );
    return res.status(500).json({ error: "Server error" });
  }
};
