const Order = require("../models/order");

exports.listOrder = async (req, res) => {
  try {
    const orders = await Order.find().exec();
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
