import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Recipe, RecipeIngredient } from '../types';
import { StorageService } from '../services/StorageService';
import FoodSearchComponent, { FoodSelectionResult } from '../components/FoodSearchComponent';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateRecipe'>;

export default function CreateRecipeScreen({ navigation, route }: Props) {
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!route.params?.recipe;
  const existingRecipe = route.params?.recipe;

  useEffect(() => {
    if (existingRecipe) {
      setRecipeName(existingRecipe.name);
      setIngredients([...existingRecipe.ingredients]);
    }
  }, [existingRecipe]);

  const handleIngredientSelected = (result: FoodSelectionResult) => {
    const newIngredient: RecipeIngredient = {
      name: result.name,
      calories: result.calories,
    };

    setIngredients([...ingredients, newIngredient]);
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(updatedIngredients);
  };

  const getTotalCalories = (): number => {
    return ingredients.reduce((sum, ingredient) => sum + ingredient.calories, 0);
  };

  const saveRecipe = async () => {
    if (!recipeName.trim()) {
      Alert.alert('Validation Error', 'Please enter a recipe name');
      return;
    }

    if (ingredients.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one ingredient');
      return;
    }

    setIsSaving(true);
    try {
      const recipe: Recipe = {
        id: existingRecipe?.id || StorageService.generateId(),
        name: recipeName.trim(),
        ingredients: [...ingredients],
      };

      await StorageService.addRecipe(recipe);

      const successMessage = isEditing ? 'Recipe updated successfully!' : 'Recipe saved successfully!';
      Alert.alert('Success', successMessage, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error saving recipe:', error);
      Alert.alert('Error', 'Failed to save recipe. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderIngredient = ({ item, index }: { item: RecipeIngredient; index: number }) => (
    <View style={styles.ingredientItem}>
      <View style={styles.ingredientInfo}>
        <Text style={styles.ingredientName}>{item.name}</Text>
        <Text style={styles.ingredientCalories}>{item.calories} cal</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeIngredient(index)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Recipe Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter recipe name"
            value={recipeName}
            onChangeText={setRecipeName}
            autoCapitalize="words"
          />
        </View>

        <FoodSearchComponent
          onFoodSelected={handleIngredientSelected}
          placeholder="Search for ingredients (min 2 chars)"
          manualEntryTitle="Add Ingredient"
        />

        {ingredients.length > 0 && (
          <View style={styles.ingredientsList}>
            <View style={styles.ingredientsHeader}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <Text style={styles.totalCalories}>
                Total: {getTotalCalories()} calories
              </Text>
            </View>

            <FlatList
              data={ingredients}
              renderItem={renderIngredient}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              style={styles.ingredientsFlatList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={saveRecipe}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Update Recipe' : 'Save Recipe'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  formSection: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  ingredientsList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ingredientsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  ingredientsFlatList: {
    flex: 1,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  ingredientCalories: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});