import { useEffect, useState } from "react";

interface RecipeData {
  id: string;
  title: string;
  imageUrl: string;
  ingredients: string[];
  instructions: string[];
}

const mockRecipes: { [key: string]: Omit<RecipeData, "id"> } = {
  "https://www.simplyrecipes.com/citrus-marinated-chicken-breasts-recipe-11845630":
    {
      title: "Citrus Marinated Chicken",
      imageUrl:
        "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=400&fit=crop",
      ingredients: [
        "chicken breasts",
        "orange juice",
        "lime juice",
        "garlic",
        "olive oil",
      ],
      instructions: ["Marinate chicken", "Grill until cooked", "Serve hot"],
    },
  "https://www.nutrition.gov/recipes/oatmeal-pecan-waffles": {
    title: "Oatmeal Pecan Waffles",
    imageUrl:
      "https://images.unsplash.com/photo-1568051243858-533a607809a5?w=400&h=400&fit=crop",
    ingredients: ["oats", "pecans", "flour", "eggs", "milk"],
    instructions: [
      "Mix dry ingredients",
      "Add wet ingredients",
      "Cook in waffle iron",
    ],
  },
  "https://www.allrecipes.com/recipe/21014/good-old-fashioned-pancakes/": {
    title: "Good Old Fashioned Pancakes",
    imageUrl:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop",
    ingredients: ["flour", "baking powder", "eggs", "milk", "butter"],
    instructions: [
      "Mix ingredients",
      "Pour batter on griddle",
      "Flip when bubbles form",
    ],
  },
};

export default function useMockWebscrape() {
  const [recipeData, setRecipeData] = useState<RecipeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecipeData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // TODO: FETCH API DATA
        // Convert object to array of recipes
        const recipesArray = Object.entries(mockRecipes).map(
          ([key, value]) => ({
            id: key,
            ...value,
          })
        );

        setRecipeData(recipesArray);
      } catch (e) {
        console.error("Fetching Error:", e);
        setError(e instanceof Error ? e.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadRecipeData();
  }, []);

  return { recipeData, loading, error };
}
