const axios = require("axios");
const { OpenAI } = require("openai");
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
    const openAi = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.CHATBOT_KEY,
    });
    // Try multiple models in case one is unavailable
    const models = [
      "deepseek/deepseek-chat-v3-0324:free",
      "meituan/longcat-flash-chat:free",
      "deepseek/deepseek-chat-v3.1:free",
    ];

    let aiResponse = null;
    let lastError = null;

    for (const model of models) {
      try {
        const completion = await openAi.chat.completions.create({
          model: model,
          messages: messages,
        });

        // const response = await axios.post(
        //   "https://openrouter.ai/api/v1/",
        //   {
        //     model: model,
        //     messages: messages,
        //     max_tokens: 500,
        //     temperature: 0.7,
        //     stream: false,
        //   },
        //   {
        //     headers: {
        //       Authorization: `Bearer ${process.env.CHATBOT_KEY}`,
        //       "X-Title": "Perfume E-commerce Chatbot",
        //       "Content-Type": "application/json",
        //     },
        //   }
        // );

        aiResponse = completion.choices[0].message;
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
