// hooks/useWebscrape.ts
import { useEffect, useState } from "react";

interface ContentBlock {
  type: string;
  text?: string;
}

interface RecipeData {
  title: string;
  imageUrl: string;
  ingredients: string[];
  instructions: string[];
}

export default function useWebscrape(url: string) {
  const [recipeData, setRecipeData] = useState<RecipeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecipeData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchResponse = await fetch(
          "https://api.anthropic.com/v1/messages",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
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
            }),
          }
        );

        const data = await fetchResponse.json();
        const textContent = data.content
          .map((block: ContentBlock) =>
            block.type === "text" ? block.text || "" : ""
          )
          .join("")
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        if (textContent) {
          const parsed = JSON.parse(textContent);
          setRecipeData({
            title: parsed.title,
            imageUrl: parsed.imageUrl,
            ingredients: parsed.ingredients,
            instructions: parsed.instructions,
          });
        }
      } catch (e) {
        console.error("Fetching Error:", e);
        setError(e instanceof Error ? e.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      loadRecipeData();
    }
  }, [url]);

  return { recipeData, loading, error };
}
