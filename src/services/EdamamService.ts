// Edamam Food Database API v2 implementation
// Uses the Food Database API for nutrition data

const EDAMAM_APP_ID = process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EXPO_PUBLIC_EDAMAM_APP_KEY;

export interface FoodSearchResult {
  label: string;
  calories: number; // calories per 100g
  id: string;
  measures?: Array<{
    uri: string;
    label: string;
    weight?: number;
  }>;
}

export interface FoodItem {
  label: string;
  caloriesPer100g: number;
  weight: number; // in grams
  totalCalories: number;
  id: string;
}

export class FoodCalculator {
  static calculateCalories(caloriesPer100g: number, weightInGrams: number): number {
    return Math.round((caloriesPer100g * weightInGrams) / 100);
  }

  static createFoodItem(searchResult: FoodSearchResult, weightInGrams: number = 100): FoodItem {
    return {
      label: searchResult.label,
      caloriesPer100g: searchResult.calories,
      weight: weightInGrams,
      totalCalories: this.calculateCalories(searchResult.calories, weightInGrams),
      id: searchResult.id,
    };
  }

  static getDefaultMeasurement(searchResult: FoodSearchResult, targetWeightGrams: number): { label: string; weight: number } {
    if (!searchResult.measures || searchResult.measures.length === 0) {
      return { label: `${targetWeightGrams}g`, weight: targetWeightGrams };
    }

    // Look for a measurement close to the target weight
    const closeMatch = searchResult.measures.find(measure =>
      measure.weight && Math.abs(measure.weight - targetWeightGrams) <= 20
    );

    if (closeMatch && closeMatch.weight) {
      return { label: closeMatch.label, weight: closeMatch.weight };
    }

    // Look for common measurements like "1 cup", "1 piece", etc.
    const commonMeasure = searchResult.measures.find(measure =>
      measure.label.toLowerCase().includes('cup') ||
      measure.label.toLowerCase().includes('piece') ||
      measure.label.toLowerCase().includes('serving')
    );

    if (commonMeasure && commonMeasure.weight) {
      return { label: commonMeasure.label, weight: commonMeasure.weight };
    }

    // Default to grams
    return { label: `${targetWeightGrams}g`, weight: targetWeightGrams };
  }
}

export class EdamamService {

  // Food Database API v2 Implementation
  static async searchFoodDatabase(query: string, options: { nutrition_type?: string; category?: string } = {}): Promise<FoodSearchResult[]> {
    if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) {
      throw new Error('API credentials not configured');
    }

    // Build URL with optional parameters
    const params = new URLSearchParams({
      app_id: EDAMAM_APP_ID,
      app_key: EDAMAM_APP_KEY,
      ingr: query,
    });

    // Add optional parameters
    if (options.nutrition_type) {
      params.append('nutrition-type', options.nutrition_type);
    }
    if (options.category) {
      params.append('category', options.category);
    }

    const url = `https://api.edamam.com/api/food-database/v2/parser?${params.toString()}`;

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
          const measures = item.measures || [];

          return {
            label: food.label || 'Unknown Food',
            calories: Math.round(food.nutrients.ENERC_KCAL || 0),
            id: food.foodId || Math.random().toString(),
            measures: measures.map((measure: any) => ({
              uri: measure.uri || '',
              label: measure.label || '',
              weight: measure.weight,
            })),
          };
        })
        .sort((a: FoodSearchResult, b: FoodSearchResult) => a.label.localeCompare(b.label));
    }

    return [];
  }


  // Main search method using Food Database API v2
  static async searchFoods(query: string): Promise<FoodSearchResult[]> {
    try {
      return await this.searchFoodDatabase(query);
    } catch (error) {
      throw new Error(`Food Database API failed: ${error}`);
    }
  }
}