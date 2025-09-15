// Edamam Food Database API v2 implementation
// Uses the Food Database API for nutrition data

const EDAMAM_APP_ID = process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EXPO_PUBLIC_EDAMAM_APP_KEY;

export interface FoodSearchResult {
  label: string;
  calories: number; // calories per 100g
  id: string;
  image?: string;
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

  static getWeightPresets(searchResult: FoodSearchResult): Array<{ label: string; weight: number }> {
    if (!searchResult.measures || searchResult.measures.length === 0) {
      // Fallback to common gram amounts
      return [
        { label: '50g', weight: 50 },
        { label: '100g', weight: 100 },
        { label: '150g', weight: 150 },
        { label: '200g', weight: 200 }
      ];
    }

    // Get up to 4 useful measures, prioritizing common ones
    const validMeasures = searchResult.measures
      .filter(measure => measure.weight && measure.weight > 0 && measure.weight <= 500)
      .sort((a, b) => {
        // Prioritize common measures
        const aCommon = this.isCommonMeasure(a.label);
        const bCommon = this.isCommonMeasure(b.label);
        if (aCommon !== bCommon) return bCommon ? 1 : -1;

        // Then sort by weight
        return (a.weight || 0) - (b.weight || 0);
      })
      .slice(0, 4)
      .map(measure => ({
        label: measure.label,
        weight: measure.weight || 100
      }));

    // If we have fewer than 4, fill with common gram amounts
    while (validMeasures.length < 4) {
      const weights = [50, 100, 150, 200, 250];
      for (const weight of weights) {
        if (!validMeasures.some(m => Math.abs(m.weight - weight) < 10)) {
          validMeasures.push({ label: `${weight}g`, weight });
          break;
        }
      }
      if (validMeasures.length >= 4) break;
    }

    return validMeasures.slice(0, 4);
  }

  private static isCommonMeasure(label: string): boolean {
    const commonTerms = ['cup', 'piece', 'serving', 'slice', 'tablespoon', 'teaspoon', 'ounce', 'item'];
    return commonTerms.some(term => label.toLowerCase().includes(term));
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
            image: food.image,
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