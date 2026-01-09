import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface RecipeData {
  id: string;
  title: string;
  imageUrl: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  prepTime: string;
  totalTime: string;
  servings: string;
  nutrition: {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
    fiber?: number;
  };
  tags: string[];
  difficulty?: string;
  cuisine?: string;
}

interface UserDietaryPreferences {
  dietaryRestrictions: string[];
  diabetesType: string;
}

export function useRecipeScraper() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<RecipeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserDietaryPreferences | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadUserPreferences();
    }
  }, [user]);

  const loadUserPreferences = async () => {
    if (!user?.id) return;

    try {
      // Load user preferences from Supabase
      const { data: userInfo, error: userError } = await supabase
        .from("user_info")
        .select("diabetes")
        .eq("id", user.id)
        .maybeSingle();

      const { data: dietaryData, error: dietaryError } = await supabase
        .from("dietaryRestrictions")
        .select("restrictions")
        .eq("user_id", user.id)
        .maybeSingle();

      if (userError && userError.code !== "PGRST116") throw userError;
      if (dietaryError && dietaryError.code !== "PGRST116") throw dietaryError;

      setUserPreferences({
        dietaryRestrictions: dietaryData?.restrictions || [],
        diabetesType: userInfo?.diabetes || "None",
      });
    } catch (err) {
      console.error("Error loading user preferences:", err);
    }
  };

  const scrapeRecipes = async (searchQuery: string = "healthy recipes") => {
    setLoading(true);
    setError(null);

    try {
      // Build dietary restrictions context
      let dietaryContext = "";
      if (userPreferences) {
        const restrictions = userPreferences.dietaryRestrictions;
        if (restrictions.length > 0) {
          dietaryContext = `User has these dietary restrictions: ${restrictions.join(", ")}. `;
        }
        if (userPreferences.diabetesType !== "None") {
          dietaryContext += `User has ${userPreferences.diabetesType}. Prefer low-carb, low-sugar recipes. `;
        }
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: `Search cooked.wiki for "${searchQuery}". ${dietaryContext}
              
              Find 6-8 recipes that match the search and dietary preferences. For each recipe, extract:
              - Title
              - Main image URL (full URL)
              - Complete ingredients list with quantities
              - Step-by-step instructions
              - Cooking time, prep time, and total time
              - Number of servings
              - Nutrition info (calories, protein, carbs, fat, fiber per serving)
              - Tags (e.g., "High Protein", "Low Carb", "Vegetarian", "Gluten-free", "Quick")
              - Difficulty level (Easy/Medium/Hard)
              - Cuisine type

              Return ONLY valid JSON (no markdown):
              {
                "recipes": [
                  {
                    "title": "Recipe Name",
                    "imageUrl": "https://...",
                    "ingredients": ["2 cups flour", "1 egg", ...],
                    "instructions": ["Step 1", "Step 2", ...],
                    "cookingTime": "25 min",
                    "prepTime": "10 min",
                    "totalTime": "35 min",
                    "servings": "4 servings",
                    "nutrition": {
                      "protein": 25,
                      "carbs": 30,
                      "fat": 10,
                      "calories": 320,
                      "fiber": 5
                    },
                    "tags": ["High Protein", "Quick"],
                    "difficulty": "Easy",
                    "cuisine": "Mediterranean"
                  }
                ]
              }`,
            },
          ],
          tools: [
            {
              type: "web_search_20250305",
              name: "web_search",
            },
          ],
        }),
      });

      const data = await response.json();
      
      // Extract text content from response
      const textContent = data.content
        .map((block: any) => (block.type === "text" ? block.text || "" : ""))
        .join("")
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      if (textContent) {
        const parsed = JSON.parse(textContent);
        
        // Add unique IDs and filter based on preferences
        const recipesWithIds = parsed.recipes.map((recipe: any, index: number) => ({
          ...recipe,
          id: `recipe-${Date.now()}-${index}`,
        }));

        const filteredRecipes = filterRecipesByPreferences(recipesWithIds);
        setRecipes(filteredRecipes);
      }
    } catch (err) {
      console.error("Error scraping recipes:", err);
      setError(err instanceof Error ? err.message : "Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  const filterRecipesByPreferences = (recipes: RecipeData[]): RecipeData[] => {
    if (!userPreferences) return recipes;

    return recipes.filter((recipe) => {
      const { dietaryRestrictions, diabetesType } = userPreferences;

      // Check dietary restrictions
      const hasRestrictedIngredients = dietaryRestrictions.some((restriction) => {
        const restrictionLower = restriction.toLowerCase();
        
        // Check recipe tags
        const tagMatch = recipe.tags.some(tag => 
          tag.toLowerCase().includes(restrictionLower)
        );
        if (tagMatch) return false; // Recipe matches restriction, keep it

        // Check ingredients for restrictions
        const ingredientText = recipe.ingredients.join(" ").toLowerCase();
        
        if (restrictionLower.includes("vegetarian") || restrictionLower.includes("vegan")) {
          return ingredientText.includes("meat") || 
                 ingredientText.includes("chicken") || 
                 ingredientText.includes("beef") ||
                 ingredientText.includes("pork") ||
                 ingredientText.includes("fish");
        }
        
        if (restrictionLower.includes("gluten")) {
          return ingredientText.includes("flour") || 
                 ingredientText.includes("bread") ||
                 ingredientText.includes("wheat");
        }
        
        if (restrictionLower.includes("dairy") || restrictionLower.includes("lactose")) {
          return ingredientText.includes("milk") || 
                 ingredientText.includes("cheese") ||
                 ingredientText.includes("butter") ||
                 ingredientText.includes("cream");
        }

        return false;
      });

      if (hasRestrictedIngredients) return false;

      // Filter for diabetes-friendly recipes
      if (diabetesType !== "None") {
        // Prefer recipes with lower carbs (< 40g per serving)
        if (recipe.nutrition.carbs > 40) {
          // Allow if it's high in fiber (fiber offsets carbs)
          if (!recipe.nutrition.fiber || recipe.nutrition.fiber < 5) {
            return false;
          }
        }
      }

      return true;
    });
  };

  const refreshRecipes = (query?: string) => {
    scrapeRecipes(query);
  };

  return {
    recipes,
    loading,
    error,
    refreshRecipes,
    userPreferences,
  };
}