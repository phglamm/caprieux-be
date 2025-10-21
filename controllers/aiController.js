const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Simple controller to proxy chat requests to OpenRouter-compatible API
// Expects environment variables: OPENROUTER_API_KEY, OPENROUTER_MODEL, OPENROUTER_URL (optional)

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "gpt-4o-mini";
const OPENROUTER_URL =
  process.env.OPENROUTER_URL || "https://api.openrouter.ai/v1/chat/completions";

if (!OPENROUTER_API_KEY) {
  console.warn(
    "Warning: OPENROUTER_API_KEY is not set. AI endpoints will return 500 until configured."
  );
}

async function chat(req, res) {
  try {
    if (!OPENROUTER_API_KEY) {
      return res
        .status(500)
        .json({ error: "OpenRouter API key not configured" });
    }

    const { messages, model, temperature, max_tokens } = req.body || {};

    if (!messages || !Array.isArray(messages)) {
      return res
        .status(400)
        .json({ error: "Missing or invalid `messages` array in request body" });
    }

    const payload = {
      model: model || OPENROUTER_MODEL,
      messages,
      temperature: typeof temperature === "number" ? temperature : 0.7,
      max_tokens: typeof max_tokens === "number" ? max_tokens : 800,
    };

    const r = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const text = await r.text();
      return res
        .status(r.status)
        .json({ error: "OpenRouter request failed", details: text });
    }

    const data = await r.json();
    // Forward the raw response; callers can pick choices etc.
    return res.json(data);
  } catch (err) {
    console.error("AI chat error:", err && err.message ? err.message : err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { chat };
