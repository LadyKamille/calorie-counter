import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodLogEntry, Recipe, AppSettings } from '../types';

const KEYS = {
  FOOD_LOG: 'food_log',
  RECIPES: 'recipes',
  SETTINGS: 'settings',
};

export class StorageService {
  static async getFoodLog(): Promise<FoodLogEntry[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.FOOD_LOG);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading food log:', error);
      return [];
    }
  }

  static async saveFoodLog(foodLog: FoodLogEntry[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.FOOD_LOG, JSON.stringify(foodLog));
    } catch (error) {
      console.error('Error saving food log:', error);
      throw error;
    }
  }

  static async addFoodLogEntry(entry: FoodLogEntry): Promise<void> {
    try {
      const currentLog = await this.getFoodLog();
      currentLog.push(entry);
      await this.saveFoodLog(currentLog);
    } catch (error) {
      console.error('Error adding food log entry:', error);
      throw error;
    }
  }

  static async getFoodLogForDate(date: string): Promise<FoodLogEntry[]> {
    try {
      const allEntries = await this.getFoodLog();
      return allEntries.filter(entry => entry.date === date);
    } catch (error) {
      console.error('Error loading food log for date:', error);
      return [];
    }
  }

  static async getRecipes(): Promise<Recipe[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.RECIPES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading recipes:', error);
      return [];
    }
  }

  static async saveRecipes(recipes: Recipe[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.RECIPES, JSON.stringify(recipes));
    } catch (error) {
      console.error('Error saving recipes:', error);
      throw error;
    }
  }

  static async addRecipe(recipe: Recipe): Promise<void> {
    try {
      const currentRecipes = await this.getRecipes();
      const existingIndex = currentRecipes.findIndex(r => r.id === recipe.id);

      if (existingIndex >= 0) {
        currentRecipes[existingIndex] = recipe;
      } else {
        currentRecipes.push(recipe);
      }

      await this.saveRecipes(currentRecipes);
    } catch (error) {
      console.error('Error adding recipe:', error);
      throw error;
    }
  }

  static async deleteRecipe(recipeId: string): Promise<void> {
    try {
      const currentRecipes = await this.getRecipes();
      const filteredRecipes = currentRecipes.filter(r => r.id !== recipeId);
      await this.saveRecipes(filteredRecipes);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  }

  static async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : { dailyGoal: 2000 };
    } catch (error) {
      console.error('Error loading settings:', error);
      return { dailyGoal: 2000 };
    }
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  static getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  static generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}