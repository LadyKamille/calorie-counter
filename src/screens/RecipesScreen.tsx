import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Recipe } from '../types';
import { StorageService } from '../services/StorageService';
import { useFocusEffect } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'Recipes'>;

export default function RecipesScreen({ navigation }: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecipes = async () => {
    try {
      const savedRecipes = await StorageService.getRecipes();
      setRecipes(savedRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
      Alert.alert('Error', 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [])
  );

  const deleteRecipe = async (recipeId: string) => {
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteRecipe(recipeId);
              setRecipes(recipes.filter(r => r.id !== recipeId));
            } catch (error) {
              console.error('Error deleting recipe:', error);
              Alert.alert('Error', 'Failed to delete recipe');
            }
          },
        },
      ]
    );
  };

  const getTotalCalories = (recipe: Recipe): number => {
    return recipe.ingredients.reduce((sum, ingredient) => sum + ingredient.calories, 0);
  };

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <View style={styles.recipeItem}>
      <TouchableOpacity
        style={styles.recipeContent}
        onPress={() => navigation.navigate('CreateRecipe', { recipe: item })}
      >
        <Text style={styles.recipeName}>{item.name}</Text>
        <Text style={styles.recipeCalories}>{getTotalCalories(item)} total calories</Text>
        <Text style={styles.ingredientCount}>
          {item.ingredients.length} ingredient{item.ingredients.length !== 1 ? 's' : ''}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteRecipe(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading recipes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('CreateRecipe', {})}
      >
        <Text style={styles.addButtonText}>Create New Recipe</Text>
      </TouchableOpacity>

      {recipes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No recipes saved yet</Text>
          <Text style={styles.emptySubtext}>
            Tap "Create New Recipe" to get started!
          </Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id}
          style={styles.recipesList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  recipesList: {
    flex: 1,
  },
  recipeItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeContent: {
    flex: 1,
    padding: 16,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  recipeCalories: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 4,
  },
  ingredientCount: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});