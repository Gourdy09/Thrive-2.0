import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export interface RecipeData {
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
  cachedAt?: number;
}

interface UserDietaryPreferences {
  dietaryRestrictions: string[];
  diabetesType: string;
}

export interface RecipeFilters {
  cuisines?: string[];
  maxCookTime?: number;
  difficulty?: string;
  mealType?: string;
}

export function useRecipeScraper() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<RecipeData[]>([]);
  const [displayRecipes, setDisplayRecipes] = useState<RecipeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserDietaryPreferences | null>(null);

  const SPOONACULAR_API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_KEY;
  const CACHE_KEY = "spoonacular_recipes_cache";
  const MAX_CACHE_SIZE = 500;
  const DISPLAY_COUNT = 30;

  useEffect(() => {
    if (user?.id) {
      loadUserPreferences();
      initializeRecipes();
    }
  }, [user]);

  useEffect(() => {
    // Sync display recipes when recipes change
    if (recipes.length > 0) {
      setDisplayRecipes(shuffleArray(recipes));
    }
  }, [recipes]);

  const loadUserPreferences = async () => {
    if (!user?.id) return;

    try {
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

  const initializeRecipes = async () => {
    try {
      const cachedRecipes = await loadFromCache();
      
      if (cachedRecipes.length > 0) {
        const cacheCount = Math.ceil(DISPLAY_COUNT * 0.6);
        const apiCount = DISPLAY_COUNT - cacheCount;
        
        const shuffledCache = shuffleArray(cachedRecipes).slice(0, cacheCount);
        await scrapeRecipes("healthy recipes", apiCount, shuffledCache);
      } else {
        await scrapeRecipes("healthy recipes", DISPLAY_COUNT);
      }
    } catch (err) {
      console.error("Error initializing recipes:", err);
    }
  };

  const loadFromCache = async (): Promise<RecipeData[]> => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
      return [];
    } catch (err) {
      console.error("Error loading from cache:", err);
      return [];
    }
  };

  const saveToCache = async (newRecipes: RecipeData[]) => {
    try {
      const currentCache = await loadFromCache();
      
      const merged = [...currentCache, ...newRecipes];
      const unique = merged.filter((recipe, index, self) => 
        index === self.findIndex(r => r.id === recipe.id)
      );
      
      const limited = unique
        .sort((a, b) => (b.cachedAt || 0) - (a.cachedAt || 0))
        .slice(0, MAX_CACHE_SIZE);
      
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(limited));
    } catch (err) {
      console.error("Error saving to cache:", err);
    }
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const cycleRecipes = () => {
    setDisplayRecipes(prev => {
      if (prev.length === 0) return prev;
      return [...prev.slice(1), prev[0]];
    });
  };

  const mapDietaryRestrictionsToSpoonacular = (restrictions: string[]): string => {
    const mapping: { [key: string]: string } = {
      "Vegetarian": "vegetarian",
      "Vegan": "vegan",
      "Gluten-free": "gluten free",
      "Dairy-free": "dairy free",
      "Ketogenic": "ketogenic",
      "Paleo": "paleo",
    };

    return restrictions
      .map(r => mapping[r] || r.toLowerCase())
      .join(",");
  };

  const scrapeRecipes = async (
    searchQuery: string = "healthy recipes", 
    count: number = 8,
    existingRecipes: RecipeData[] = [],
    filters?: RecipeFilters
  ) => {
    if (!SPOONACULAR_API_KEY) {
      setError("Spoonacular API key not configured");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let diet = "";
      let intolerances = "";
      let maxCarbs = "";

      if (userPreferences) {
        if (userPreferences.dietaryRestrictions.length > 0) {
          diet = mapDietaryRestrictionsToSpoonacular(userPreferences.dietaryRestrictions);
        }

        if (userPreferences.diabetesType !== "None") {
          maxCarbs = "40";
        }
      }

      const searchParams: Record<string, string> = {
        apiKey: SPOONACULAR_API_KEY,
        query: searchQuery,
        number: count.toString(),
        addRecipeInformation: "true",
        fillIngredients: "true",
        sort: "random",
      };

      if (diet) searchParams.diet = diet;
      if (intolerances) searchParams.intolerances = intolerances;
      if (maxCarbs) searchParams.maxCarbs = maxCarbs;

      if (filters) {
        if (filters.cuisines && filters.cuisines.length > 0) {
          searchParams.cuisine = filters.cuisines.join(",");
        }
        if (filters.maxCookTime) {
          searchParams.maxReadyTime = filters.maxCookTime.toString();
        }
        if (filters.mealType) {
          searchParams.type = filters.mealType.toLowerCase();
        }
      }

      const searchParamsObj = new URLSearchParams(searchParams);

      const searchResponse = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?${searchParamsObj}`
      );

      // Check for 402 Payment Required error
      if (searchResponse.status === 402) {
        console.warn("Spoonacular API quota exceeded - using cached recipes only");
        await loadRecipesFromCacheOnly(filters);
        return;
      }

      if (!searchResponse.ok) {
        throw new Error(`Spoonacular API error: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();

      const detailedRecipes = await Promise.all(
        searchData.results.map(async (recipe: any) => {
          try {
            const infoParams = new URLSearchParams({
              apiKey: SPOONACULAR_API_KEY,
              includeNutrition: "true",
            });

            const infoResponse = await fetch(
              `https://api.spoonacular.com/recipes/${recipe.id}/information?${infoParams}`
            );

            // Check for 402 on individual recipe fetches
            if (infoResponse.status === 402) {
              console.warn("API quota exceeded during recipe fetch");
              return null;
            }

            if (!infoResponse.ok) return null;

            const recipeInfo = await infoResponse.json();

            const nutrition = recipeInfo.nutrition?.nutrients || [];
            const calories = nutrition.find((n: any) => n.name === "Calories")?.amount || 0;
            const protein = nutrition.find((n: any) => n.name === "Protein")?.amount || 0;
            const carbs = nutrition.find((n: any) => n.name === "Carbohydrates")?.amount || 0;
            const fat = nutrition.find((n: any) => n.name === "Fat")?.amount || 0;
            const fiber = nutrition.find((n: any) => n.name === "Fiber")?.amount || 0;

            const instructions = recipeInfo.analyzedInstructions?.[0]?.steps?.map(
              (step: any) => step.step
            ) || [];

            const ingredients = recipeInfo.extendedIngredients?.map(
              (ing: any) => ing.original
            ) || [];

            const tags: string[] = [];
            if (protein >= 20) tags.push("High Protein");
            if (carbs <= 15) tags.push("Low Carb");
            if (recipeInfo.vegetarian) tags.push("Vegetarian");
            if (recipeInfo.vegan) tags.push("Vegan");
            if (recipeInfo.glutenFree) tags.push("Gluten-free");
            if (recipeInfo.dairyFree) tags.push("Dairy-free");
            if (recipeInfo.readyInMinutes <= 30) tags.push("Quick");

            const dishTypes = recipeInfo.dishTypes || [];
            if (dishTypes.includes("breakfast") || dishTypes.includes("morning meal")) {
              tags.push("Breakfast");
            }
            if (dishTypes.includes("lunch") || dishTypes.includes("main course")) {
              tags.push("Lunch");
            }
            if (dishTypes.includes("dinner") || dishTypes.includes("main course")) {
              tags.push("Dinner");
            }

            let difficulty = recipeInfo.readyInMinutes <= 30 ? "Easy" : recipeInfo.readyInMinutes <= 60 ? "Medium" : "Hard";
            
            if (filters?.difficulty) {
              if (difficulty !== filters.difficulty) {
                return null;
              }
            }

            return {
              id: `spoonacular-${recipe.id}`,
              title: recipeInfo.title,
              imageUrl: recipeInfo.image || "",
              ingredients,
              instructions,
              cookingTime: `${recipeInfo.cookingMinutes || 0} min`,
              prepTime: `${recipeInfo.preparationMinutes || 0} min`,
              totalTime: `${recipeInfo.readyInMinutes || 0} min`,
              servings: `${recipeInfo.servings || 1} servings`,
              nutrition: {
                protein: Math.round(protein),
                carbs: Math.round(carbs),
                fat: Math.round(fat),
                calories: Math.round(calories),
                fiber: Math.round(fiber),
              },
              tags,
              difficulty,
              cuisine: recipeInfo.cuisines?.[0] || "International",
              cachedAt: Date.now(),
            };
          } catch (err) {
            console.error(`Error fetching recipe ${recipe.id}:`, err);
            return null;
          }
        })
      );

      const validRecipes = detailedRecipes.filter((r): r is RecipeData => r !== null);
      
      await saveToCache(validRecipes);
      
      const combined = [...existingRecipes, ...validRecipes];
      const shuffled = shuffleArray(combined);
      
      setRecipes(validRecipes);
      setDisplayRecipes(shuffled);
    } catch (err: any) {
      console.error("Error fetching recipes from Spoonacular:", err);
      
      // If API error, try to load from cache only
      if (err.message?.includes("402") || err.message?.includes("quota") || err.message?.includes("payment")) {
        console.warn("API quota exceeded - falling back to cache only");
        await loadRecipesFromCacheOnly(filters);
      } else {
        setError(err instanceof Error ? err.message : "Failed to load recipes");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadRecipesFromCacheOnly = async (filters?: RecipeFilters) => {
    try {
      const cachedRecipes = await loadFromCache();
      
      if (cachedRecipes.length === 0) {
        setError("No cached recipes available. API quota exceeded - please try again later.");
        setRecipes([]);
        setDisplayRecipes([]);
        return;
      }

      // Apply filters to cached recipes
      let filtered = cachedRecipes;

      if (filters) {
        filtered = cachedRecipes.filter(recipe => {
          // Filter by cuisine
          if (filters.cuisines && filters.cuisines.length > 0) {
            if (!recipe.cuisine || !filters.cuisines.includes(recipe.cuisine)) {
              return false;
            }
          }

          // Filter by cook time
          if (filters.maxCookTime) {
            const totalMinutes = parseInt(recipe.totalTime) || 0;
            if (totalMinutes > filters.maxCookTime) {
              return false;
            }
          }

          // Filter by difficulty
          if (filters.difficulty) {
            if (recipe.difficulty !== filters.difficulty) {
              return false;
            }
          }

          // Filter by meal type
          if (filters.mealType) {
            if (!recipe.tags.includes(filters.mealType)) {
              return false;
            }
          }

          return true;
        });
      }

      if (filtered.length === 0) {
        setError("No cached recipes match your filters. API quota exceeded - try different filters or wait for quota reset.");
        setRecipes([]);
        setDisplayRecipes([]);
        return;
      }

      // Use up to DISPLAY_COUNT recipes from cache
      const selected = shuffleArray(filtered).slice(0, DISPLAY_COUNT);
      
      setRecipes(selected);
      setDisplayRecipes(selected);
      setError(null); // Clear any previous errors
      
      console.log(`Loaded ${selected.length} recipes from cache (API quota exceeded)`);
    } catch (err) {
      console.error("Error loading from cache:", err);
      setError("Failed to load cached recipes");
    }
  };

  const refreshRecipes = async (
    query?: string, 
    filters?: RecipeFilters
  ) => {
    const cachedRecipes = await loadFromCache();
    
    if (cachedRecipes.length > 0) {
      const cacheCount = Math.ceil(DISPLAY_COUNT * 0.6);
      const apiCount = DISPLAY_COUNT - cacheCount;
      const shuffledCache = shuffleArray(cachedRecipes).slice(0, cacheCount);
      
      try {
        await scrapeRecipes(query || "healthy recipes", apiCount, shuffledCache, filters);
      } catch (err: any) {
        // If API fails (including 402), fall back to cache only
        if (err.message?.includes("402") || err.message?.includes("quota")) {
          await loadRecipesFromCacheOnly(filters);
        }
      }
    } else {
      try {
        await scrapeRecipes(query || "healthy recipes", DISPLAY_COUNT, [], filters);
      } catch (err: any) {
        // If no cache and API fails, show error
        if (err.message?.includes("402") || err.message?.includes("quota")) {
          setError("API quota exceeded and no cached recipes available. Please try again later.");
        }
      }
    }
  };

  return {
    recipes: displayRecipes,
    loading,
    error,
    refreshRecipes,
    userPreferences,
    cycleRecipes,
  };
}