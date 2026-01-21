export interface RecipeBase {
  id: string;
  title: string;
  imageUrl: string;
  ingredients: string[];
  tags?: string[];
  nutrition?: {
    protein: number;
    carbs: number;
    fat?: number;
    calories?: number;
    fiber?: number;
  };
}

export interface RecipeFull extends RecipeBase {
  instructions: string[];
  cookingTime: string;
  prepTime: string;
  totalTime: string;
  servings: string;
  difficulty?: string;
  cuisine?: string;
  cachedAt?: number;
}

export interface FoodLogEntry {
  id: string;
  recipeId?: string;
  recipeName: string;
  timestamp: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  nutrition: {
    protein: number;
    carbs: number;
    calories?: number;
    fiber?: number;
  };
  imageUrl?: string;
}

export interface SavedRecipe extends RecipeFull {
  savedAt: Date;
}