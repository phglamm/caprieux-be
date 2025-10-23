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
    if (!body.address || !body.fullName || !body.phoneNumber) {
      return res
        .status(400)
        .json({ error: "address, fullName, phoneNumber required" });
    }

    let items = [];
    let amount = 0;

    if (Array.isArray(body.items) && body.items.length > 0) {
      // Cart/OrderItems mode
      for (const item of body.items) {
        let product = null;
        if (item.productId) {
          product = await Product.findById(item.productId).lean().exec();
          if (!product)
            return res
              .status(404)
              .json({ error: `Product not found: ${item.productId}` });
        } else if (item.product) {
          product = item.product;
          if (!product.title || typeof product.price === "undefined") {
            return res
              .status(400)
              .json({ error: "Invalid product object in items" });
          }
        } else {
          return res
            .status(400)
            .json({ error: "Each item must have productId or product" });
        }
        const quantity = Number(item.quantity || 1);
        if (!Number.isInteger(quantity) || quantity < 1) {
          return res.status(400).json({ error: "Invalid quantity in items" });
        }
        const unitPrice = Number(product.price || 0);
        if (unitPrice <= 0) {
          return res
            .status(400)
            .json({ error: "Invalid product price in items" });
        }
        items.push({
          name: product.title || "product",
          quantity: quantity,
          price: unitPrice,
          productId: product._id ? product._id.toString() : undefined,
        });
        amount += unitPrice * quantity;
      }
    } else {
      // Single product mode (backward compatible)
      let product = null;
      if (body.productId) {
        product = await Product.findById(body.productId).lean().exec();
        if (!product)
          return res.status(404).json({ error: "Product not found" });
      } else if (body.product) {
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
      items.push({
        name: product.title || "product",
        quantity: quantity,
        price: unitPrice,
        productId: product._id ? product._id.toString() : undefined,
      });
      amount = unitPrice * quantity;
    }

    const YOUR_DOMAIN =
      process.env.YOUR_DOMAIN || `${req.protocol}://${req.get("host")}`;

    // Generate an orderCode first so it can be used in return/cancel URLs
    const orderCode = String(Number(String(Date.now()).slice(-8)));

    const paymentRequest = {
      orderCode: Number(orderCode),
      amount: 10000,
      description:
        items.length === 1 ? items[0].name : `Order with ${items.length} items`,
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      returnUrl: `${YOUR_DOMAIN}/order-success`,
      cancelUrl: `${YOUR_DOMAIN}/order-failed`,
    };

    const paymentLinkResponse = await payOs.createPaymentLink(paymentRequest);

    let savedOrder = null;
    try {
      const orderDoc = new Order({
        orderCode: orderCode,
        fullName: body.fullName || null,
        phoneNumber: body.phoneNumber || null,
        address: body.address || null,
        items: items.map((i) => ({
          product: i.productId,
          quantity: i.quantity,
          price: i.price,
        })),
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
    const { orderCode, cancel } = req.body || {};
    if (!orderCode) {
      return res.status(400).json({ error: "orderCode is required" });
    }
    const order = await Order.findOne({ orderCode: String(orderCode) }).exec();
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (cancel === "false") {
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
