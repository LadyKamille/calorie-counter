// Edamam API Test Service
// Use this to test your API credentials and endpoints

const EDAMAM_APP_ID = process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EXPO_PUBLIC_EDAMAM_APP_KEY;
const EDAMAM_USER_ID = process.env.EXPO_PUBLIC_EDAMAM_USER_ID;

export class EdamamTestService {

  // Test Food Database API v2 (current implementation)
  static async testFoodDatabaseAPI(query: string = 'apple') {
    const url = `https://api.edamam.com/api/food-database/v2/parser?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=${encodeURIComponent(query)}&nutrition-type=cooking`;

    console.log('Testing Food Database API v2...');
    console.log('URL:', url);
    console.log('APP_ID:', EDAMAM_APP_ID);
    console.log('APP_KEY:', EDAMAM_APP_KEY ? `${EDAMAM_APP_KEY.substring(0, 8)}...` : 'NOT SET');

    try {
      const response = await fetch(url);
      console.log('Response Status:', response.status);
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.text();
      console.log('Response Body:', data.substring(0, 500));

      return { success: response.ok, status: response.status, data };
    } catch (error) {
      console.error('Network Error:', error);
      return { success: false, error };
    }
  }

  // Test Recipe Search API v1 (alternative)
  static async testRecipeSearchAPI(query: string = 'chicken') {
    const url = `https://api.edamam.com/search?q=${encodeURIComponent(query)}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`;

    console.log('Testing Recipe Search API v1...');
    console.log('URL:', url);
    console.log('USER_ID:', EDAMAM_USER_ID ? `${EDAMAM_USER_ID.substring(0, 8)}...` : 'NOT SET');

    const headers: any = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (EDAMAM_USER_ID) {
      headers['Edamam-Account-User'] = EDAMAM_USER_ID;
    }

    try {
      const response = await fetch(url, { headers });
      console.log('Recipe API Response Status:', response.status);

      const data = await response.text();
      console.log('Recipe API Response:', data.substring(0, 500));

      return { success: response.ok, status: response.status, data };
    } catch (error) {
      console.error('Recipe API Network Error:', error);
      return { success: false, error };
    }
  }

  // Test Recipe Search API v2 (newer version)
  static async testRecipeSearchAPIv2(query: string = 'chicken') {
    const url = `https://api.edamam.com/api/recipes/v2?type=public&q=${encodeURIComponent(query)}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`;

    console.log('Testing Recipe Search API v2...');
    console.log('URL:', url);

    try {
      const response = await fetch(url);
      console.log('Recipe API v2 Response Status:', response.status);

      const data = await response.text();
      console.log('Recipe API v2 Response:', data.substring(0, 500));

      return { success: response.ok, status: response.status, data };
    } catch (error) {
      console.error('Recipe API v2 Network Error:', error);
      return { success: false, error };
    }
  }

  // Test Nutrition Analysis API (another alternative)
  static async testNutritionAPI() {
    const url = `https://api.edamam.com/api/nutrition-data?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=1%20large%20apple`;

    console.log('Testing Nutrition Analysis API...');
    console.log('URL:', url);

    try {
      const response = await fetch(url);
      console.log('Nutrition API Response Status:', response.status);

      const data = await response.text();
      console.log('Nutrition API Response:', data.substring(0, 500));

      return { success: response.ok, status: response.status, data };
    } catch (error) {
      console.error('Nutrition API Network Error:', error);
      return { success: false, error };
    }
  }

  // Run all tests
  static async runAllTests() {
    console.log('=== EDAMAM API TESTS ===');

    await this.testFoodDatabaseAPI();
    console.log('\n---\n');

    await this.testRecipeSearchAPI();
    console.log('\n---\n');

    await this.testRecipeSearchAPIv2();
    console.log('\n---\n');

    await this.testNutritionAPI();

    console.log('=== TESTS COMPLETE ===');
  }
}