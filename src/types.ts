export type IngredientCategory = 'veggie' | 'meat' | 'seafood' | 'dairy' | 'seasoning' | 'grain';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  isEssential?: boolean; // If true, covers basic pantry items (salt, sugar, soy sauce, etc.)
  isPopular?: boolean; // If true, shown in the "Quick Access" section
  emoji?: string; // Specific emoji for the ingredient
  imageUrl?: string; // Optional: specific image URL (overrides emoji)
  isCustom?: boolean;
}

export interface RecipeIngredient {
  id: string; // References Ingredient.id
  amount: string; // e.g., "1/2 piece", "200g"
  required: boolean; // True if absolutely needed, false if optional topping
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cookingTimeMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  imageUrl: string;
  ingredients: RecipeIngredient[];
  instructions?: string[]; // Step-by-step instructions
  category?: string; // Added for filtering
  calories?: number;
  servingSize?: number; // e.g. 2 people
}

export interface MatchResult {
  recipe: Recipe;
  matchPercentage: number;
  missingCount: number;
  ownedIngredients: string[]; // IDs
  missingIngredients: string[]; // IDs
}