import { useEffect, useState } from "react";

interface RecipeData {
  id: string;
  title: string;
  imageUrl: string;
  ingredients: string[];
  instructions: string[];
  cT: string;
  protein: number;
  carbs: number;
  tags: string[];
  servingSize: string;
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
      cT: "2 hours 35 minutes",
      protein: 50,
      carbs: 1,
      tags: [
        "not spicy",
        "High in Protein",
        "Takes a while",
        "Overnight",
        "Lunch",
        "Dinner",
      ],
      servingSize: "4-6",
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
    cT: "25 minutes",
    protein: 14,
    carbs: 50,
    tags: ["kid freindly", "Breakfast"],
    servingSize: "4 servings",
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
    cT: "20 minutes",
    protein: 5,
    carbs: 22,
    tags: ["Breakfast", "Highly Rated", "Short and Sweet"],
    servingSize: "8 servings",
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
