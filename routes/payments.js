const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authenticateUser } = require("../middleware/authorizedMiddleware");

router.post("/create-payment-link", authenticateUser, paymentController.createPaymentLink);
router.post("/webhook", paymentController.webhook);

module.exports = router;
