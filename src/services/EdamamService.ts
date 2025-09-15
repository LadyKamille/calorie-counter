// Edamam Food Database API v2 implementation
// Uses the Food Database API for nutrition data

const EDAMAM_APP_ID = process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EXPO_PUBLIC_EDAMAM_APP_KEY;

export interface FoodSearchResult {
  label: string;
  calories: number;
  id: string;
}

export class EdamamService {

  // Food Database API v2 Implementation
  static async searchFoodDatabase(query: string): Promise<FoodSearchResult[]> {
    if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) {
      throw new Error('API credentials not configured');
    }

    // Use the Food Database API v2 format as provided
    const url = `https://api.edamam.com/api/food-database/v2/parser?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=${encodeURIComponent(query)}`;

    console.log('Food Database API URL:', url);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Parse Food Database API response
    if (data.parsed && Array.isArray(data.parsed)) {
      return data.parsed
        .filter((item: any) => item.food && item.food.nutrients && item.food.nutrients.ENERC_KCAL > 0)
        .map((item: any) => {
          const food = item.food;
          return {
            label: food.label || 'Unknown Food',
            calories: Math.round(food.nutrients.ENERC_KCAL || 0),
            id: food.foodId || Math.random().toString(),
          };
        })
        .sort((a: FoodSearchResult, b: FoodSearchResult) => a.label.localeCompare(b.label));
    }

    return [];
  }


  // Main search method using Food Database API v2
  static async searchFoods(query: string): Promise<FoodSearchResult[]> {
    try {
      console.log('Using Food Database API v2...');
      return await this.searchFoodDatabase(query);
    } catch (error) {
      console.error('Food Database API failed:', error);
      throw new Error(`Food Database API failed: ${error}`);
    }
  }
}