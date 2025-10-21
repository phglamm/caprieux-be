var express = require("express");
var router = express.Router();

const aiController = require("../controllers/aiController");

// POST /api/ai/chat
router.post("/chat", aiController.chat);

// Basic status endpoint
router.get("/", function (req, res) {
  res.json({
    status: "ok",
    message:
      "AI route is available. POST /api/ai/chat with { messages: [...] }",
  });
});

module.exports = router;
