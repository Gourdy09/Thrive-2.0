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
      tags: ["High Protein", "Low Carb", "Gluten-free", "Lunch", "Dinner"],
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
    tags: ["Vegetarian", "Quick", "Breakfast"],
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
    tags: ["Vegetarian", "Quick", "Breakfast"],
    servingSize: "8 servings",
  },
  "https://example.com/greek-salad": {
    title: "Greek Salad",
    imageUrl:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop",
    ingredients: ["tomatoes", "cucumber", "feta cheese", "olives", "olive oil"],
    instructions: [
      "Chop vegetables",
      "Crumble feta",
      "Mix with dressing",
    ],
    cT: "15 minutes",
    protein: 8,
    carbs: 12,
    tags: ["Vegetarian", "Quick", "Gluten-free", "Low Carb", "Lunch"],
    servingSize: "2 servings",
  },
  "https://example.com/salmon-bowl": {
    title: "Teriyaki Salmon Bowl",
    imageUrl:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop",
    ingredients: ["salmon", "rice", "broccoli", "teriyaki sauce", "sesame seeds"],
    instructions: [
      "Cook salmon",
      "Steam broccoli",
      "Assemble bowl with rice",
    ],
    cT: "30 minutes",
    protein: 35,
    carbs: 45,
    tags: ["High Protein", "Gluten-free", "Dinner", "Lunch"],
    servingSize: "2 servings",
  },
  "https://example.com/veggie-stir-fry": {
    title: "Quick Veggie Stir Fry",
    imageUrl:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=400&fit=crop",
    ingredients: ["mixed vegetables", "tofu", "soy sauce", "ginger", "garlic"],
    instructions: [
      "Heat oil in wok",
      "Stir fry vegetables",
      "Add sauce and tofu",
    ],
    cT: "15 minutes",
    protein: 18,
    carbs: 20,
    tags: ["Vegan", "Vegetarian", "Quick", "Low Carb", "Dinner"],
    servingSize: "3 servings",
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