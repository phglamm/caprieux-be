const Order = require("../models/order");

exports.listOrder = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "items.product",
        select: "title price imageLink",
      })
      .exec();
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate({
        path: "items.product",
        select: "title price imageLink images",
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    // Calculate returnAmount for each order
    const ordersWithReturn = orders.map((order) => {
      const returnAmount = (order.totalDepositAmount || 0) - (order.amount || 0);
      return {
        ...order,
        returnAmount: returnAmount > 0 ? returnAmount : 0,
      };
    });

    res.json(ordersWithReturn);
  } catch (error) {
    console.error("Error fetching my orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
