export interface FoodLogEntry {
  id: string;
  name: string;
  calories: number;
  date: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
}

export interface RecipeIngredient {
  name: string;
  calories: number;
}

export interface AppSettings {
  dailyGoal: number;
}

export interface EdamamFood {
  foodId: string;
  label: string;
  nutrients: {
    ENERC_KCAL: number;
  };
}

export interface EdamamResponse {
  parsed: Array<{
    food: EdamamFood;
  }>;
}

export interface OpenFoodFactsProduct {
  product_name?: string;
  nutriments?: {
    energy_100g?: number;
    'energy-kcal_100g'?: number;
  };
}

export interface OpenFoodFactsResponse {
  status: number;
  product?: OpenFoodFactsProduct;
}

export type RootStackParamList = {
  Home: undefined;
  AddFood: { prefillData?: Partial<FoodLogEntry> };
  Recipes: undefined;
  CreateRecipe: { recipe?: Recipe };
  BarcodeScanner: undefined;
  Settings: undefined;
};