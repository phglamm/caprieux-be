const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
// POST /api/chat/message - Send a message to the AI chatbot
router.post("/login", authController.login);
router.post("/register", authController.register);

module.exports = router;
