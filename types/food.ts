export interface Recipe {
  id: string;
  title: string;
  imageUrl: string;
  ingredients: string[];
  instructions: string[];
  cT: string;
  protein: number;
  carbs: number;
  fat?: number;
  calories?: number;
  tags: string[];
  servingSize: string;
  isBookmarked: boolean;
  createdAt: Date;
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

export interface SavedRecipe extends Recipe {
  savedAt: Date;
}
