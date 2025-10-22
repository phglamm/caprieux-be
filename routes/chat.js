const express = require("express");
const { sendMessage } = require("../controllers/chatController");
const router = express.Router();

// POST /api/chat/message - Send a message to the AI chatbot
router.post("/message", sendMessage);

module.exports = router;
