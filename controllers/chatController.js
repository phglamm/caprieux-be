const axios = require("axios");

const sendMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Prepare the conversation history for the API
    const messages = [
      {
        role: "system", // Changed from "assistant" to "system" for better model compatibility
        content:
          "Bạn là trợ lý ảo cho The Caprieux, một store cho thuê đồ cao cấp, Hãy trả lời các câu hỏi của khách hàng một cách ngắn gọn, súc tích và thân thiện về các sản phẩm và dịch vụ của The Caprieux.",
      },
      ...conversationHistory,
      {
        role: "user",
        content: message,
      },
    ];

    // Try multiple models in case one is unavailable
    const models = [
      "deepseek/deepseek-chat-v3-0324:free",
      "tngtech/deepseek-r1t2-chimera:free",
      "tencent/hunyuan-a13b-instruct:free",
    ];

    let aiResponse = null;
    let lastError = null;

    for (const model of models) {
      try {
        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: model,
            messages: messages,
            max_tokens: 500,
            temperature: 0.7,
            stream: false,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.CHATBOT_KEY}`,
              "HTTP-Referer": "http://localhost:5000",
              "X-Title": "Perfume E-commerce Chatbot",
              "Content-Type": "application/json",
            },
          }
        );

        aiResponse = response.data.choices[0].message.content;
        break; // Success, exit the loop
      } catch (modelError) {
        lastError = modelError;
        console.log(`Model ${model} failed, trying next...`);
        continue;
      }
    }

    if (!aiResponse) {
      throw lastError;
    }

    res.json({
      success: true,
      message: aiResponse,
      conversationHistory: [
        ...conversationHistory,
        { role: "user", content: message },
        { role: "assistant", content: aiResponse },
      ],
    });
  } catch (error) {
    console.error(
      "Error in chat controller:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message:
        "Sorry, I encountered an error while processing your message. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  sendMessage,
};
