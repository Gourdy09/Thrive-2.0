export interface RecipeBase {
  id: string;
  title: string;
  imageUrl: string;
  ingredients: string[];
  tags?: string[];
  protein?: number;
  carbs?: number;
}

export interface RecipeFull extends RecipeBase {
  instructions: string[];
  cT: string;
  servingSize: string;
  protein: number;
  carbs: number;
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
  };
  imageUrl?: string;
}

export interface SavedRecipe extends RecipeFull {
  savedAt: Date;
}
