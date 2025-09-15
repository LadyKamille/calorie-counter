// Alternative Edamam API implementations
// This service provides different API approaches based on your subscription

const EDAMAM_APP_ID = process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EXPO_PUBLIC_EDAMAM_APP_KEY;
const EDAMAM_USER_ID = process.env.EXPO_PUBLIC_EDAMAM_USER_ID;

export interface FoodSearchResult {
  label: string;
  calories: number;
  id: string;
}

export class EdamamService {

  // Recipe Search API v1 Implementation (Meal Planner Developer)
  static async searchFoodsRecipeAPI(query: string): Promise<FoodSearchResult[]> {
    if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) {
      throw new Error('API credentials not configured');
    }

    if (!EDAMAM_USER_ID) {
      throw new Error('User ID not configured. Meal Planner plan requires EXPO_PUBLIC_EDAMAM_USER_ID in .env file');
    }

    // Enhanced search for meal planning with required userID
    const url = `https://api.edamam.com/search?q=${encodeURIComponent(query)}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&from=0&to=15&health=alcohol-free`;

    const response = await fetch(url, {
      headers: {
        'Edamam-Account-User': EDAMAM_USER_ID,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Convert recipe results to food-like results with better calorie calculation
    if (data.hits && Array.isArray(data.hits)) {
      return data.hits
        .filter((hit: any) => hit.recipe && hit.recipe.calories > 0) // Only include recipes with calorie data
        .map((hit: any) => {
          const recipe = hit.recipe;
          const servings = recipe.yield || 1;
          const caloriesPerServing = Math.round(recipe.calories / servings);

          return {
            label: recipe.label || 'Unknown Recipe',
            calories: caloriesPerServing,
            id: recipe.uri || Math.random().toString(),
          };
        })
        .sort((a: FoodSearchResult, b: FoodSearchResult) => a.label.localeCompare(b.label)); // Sort alphabetically
    }

    return [];
  }

  // Recipe Search API v2 Implementation
  static async searchFoodsRecipeAPIv2(query: string): Promise<FoodSearchResult[]> {
    if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) {
      throw new Error('API credentials not configured');
    }

    const response = await fetch(
      `https://api.edamam.com/api/recipes/v2?type=public&q=${encodeURIComponent(query)}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&from=0&to=10`
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    // Convert recipe results to food-like results
    if (data.hits && Array.isArray(data.hits)) {
      return data.hits.map((hit: any) => ({
        label: hit.recipe?.label || 'Unknown Food',
        calories: Math.round(hit.recipe?.calories / (hit.recipe?.yield || 1)) || 0,
        id: hit.recipe?.uri || Math.random().toString(),
      }));
    }

    return [];
  }

  // Nutrition Analysis API Implementation (for single ingredients)
  static async searchSingleIngredient(ingredient: string): Promise<FoodSearchResult | null> {
    if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) {
      throw new Error('API credentials not configured');
    }

    const response = await fetch(
      `https://api.edamam.com/api/nutrition-data?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=${encodeURIComponent(ingredient)}`
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.calories) {
      return {
        label: ingredient,
        calories: Math.round(data.calories),
        id: Math.random().toString(),
      };
    }

    return null;
  }

  // Optimized for Meal Planner Developer plan (Recipe Search API)
  static async searchFoods(query: string): Promise<FoodSearchResult[]> {
    try {
      // Use Recipe Search API v1 (primary for Meal Planner plan)
      console.log('Using Recipe Search API v1 (Meal Planner plan)...');
      return await this.searchFoodsRecipeAPI(query);
    } catch (error) {
      console.log('Recipe API v1 failed, trying v2:', error);

      try {
        // Fallback to Recipe Search API v2
        return await this.searchFoodsRecipeAPIv2(query);
      } catch (error2) {
        console.log('Recipe API v2 also failed:', error2);
        throw new Error(`Recipe Search API failed: ${error2}. Please check your Meal Planner subscription status.`);
      }
    }
  }
}