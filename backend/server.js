const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.post("/api/scrape-recipe", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `Fetch ${url} and extract the recipe title, main image URL, ingredients, and instructions. Return ONLY valid JSON with no markdown:
{
  "title": "recipe name",
  "imageUrl": "full URL to main recipe image",
  "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
  "instructions": ["step 1", "step 2", "step 3"]
}`,
        },
      ],
      tools: [
        {
          type: "web_fetch_20250305",
          name: "web_fetch",
        },
      ],
    });

    // Extract text content from response
    const textContent = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .filter(Boolean)
      .join("")
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    if (textContent) {
      const parsed = JSON.parse(textContent);
      res.json(parsed);
    } else {
      res.status(500).json({ error: "No content returned from API" });
    }
  } catch (error) {
    console.error("Error scraping recipe:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
{
  /* make a backhand.enc*/
}
ANTHROPIC_API_KEY = your_api_key_here;
PORT = 3001;
