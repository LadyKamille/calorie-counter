import React, { useState, useEffect, useRef } from 'react';
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
import { RootStackParamList } from '../types';
import { StorageService } from '../services/StorageService';
import { EdamamService, FoodSearchResult, FoodItem, FoodCalculator } from '../services/EdamamService';

type Props = NativeStackScreenProps<RootStackParamList, 'AddFood'>;


export default function AddFoodScreen({ navigation, route }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [weight, setWeight] = useState('100');
  const [caloriesPer100g, setCaloriesPer100g] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (route.params?.prefillData) {
      const { name, calories: prefillCalories } = route.params.prefillData;
      if (name) setFoodName(name);
      if (prefillCalories) setCalories(prefillCalories.toString());
    }
  }, [route.params]);

  const searchFoods = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await EdamamService.searchFoods(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', `${error}`);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce ref to store timeout
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchTextChange = (text: string) => {
    setSearchQuery(text);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If search is empty, clear results immediately
    if (!text.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Require minimum 2 characters for search
    if (text.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Show loading state immediately for better UX
    setIsSearching(true);

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      searchFoods(text);
    }, 800); // Increased to 800ms for better API rate limiting
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const selectSearchResult = (result: FoodSearchResult) => {
    setFoodName(result.label);
    setCaloriesPer100g(result.calories);
    setWeight('100'); // Default to 100g
    setCalories(result.calories.toString()); // Start with 100g calories
    setSearchResults([]);
    setSearchQuery('');
  };

  // Update calories when weight changes
  const handleWeightChange = (newWeight: string) => {
    setWeight(newWeight);

    if (caloriesPer100g !== null && newWeight.trim()) {
      const weightValue = parseFloat(newWeight);
      if (!isNaN(weightValue) && weightValue > 0) {
        const calculatedCalories = FoodCalculator.calculateCalories(caloriesPer100g, weightValue);
        setCalories(calculatedCalories.toString());
      }
    }
  };

  // Clear weight calculation when entering manual calories
  const handleManualCalorieChange = (newCalories: string) => {
    setCalories(newCalories);
    if (caloriesPer100g !== null) {
      // Clear the calculation state to allow manual entry
      setCaloriesPer100g(null);
      setWeight('100');
    }
  };

  const addFood = async () => {
    if (!foodName.trim() || !calories.trim()) {
      Alert.alert('Validation Error', 'Please enter both food name and calories');
      return;
    }

    const calorieValue = parseInt(calories);
    if (isNaN(calorieValue) || calorieValue < 0) {
      Alert.alert('Validation Error', 'Please enter a valid calorie amount');
      return;
    }

    setIsAdding(true);
    try {
      const entry = {
        id: StorageService.generateId(),
        name: foodName.trim(),
        calories: calorieValue,
        date: StorageService.getTodayDateString(),
      };

      await StorageService.addFoodLogEntry(entry);
      Alert.alert('Success', 'Food added to your log!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error adding food:', error);
      Alert.alert('Error', 'Failed to add food. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const renderSearchResult = ({ item }: { item: FoodSearchResult }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => selectSearchResult(item)}
    >
      <Text style={styles.resultName}>{item.label}</Text>
      <Text style={styles.resultCalories}>{item.calories} cal/100g → Tap to customize</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Search Foods</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for foods (min 2 chars, e.g., chicken, apple)"
          value={searchQuery}
          onChangeText={handleSearchTextChange}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {isSearching && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}

        {searchResults.length > 0 && (
          <View style={styles.searchResults}>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              style={styles.resultsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Add Food</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Food Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter food name"
            value={foodName}
            onChangeText={setFoodName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Weight (grams)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter weight in grams"
            value={weight}
            onChangeText={handleWeightChange}
            keyboardType="numeric"
          />
          {caloriesPer100g !== null && (
            <Text style={styles.helpText}>
              {caloriesPer100g} cal/100g
            </Text>
          )}
        </View>

        {caloriesPer100g !== null && (
          <View style={styles.weightPresets}>
            <Text style={styles.presetsLabel}>Quick weights:</Text>
            <View style={styles.presetButtons}>
              {[50, 100, 150, 200].map((presetWeight) => (
                <TouchableOpacity
                  key={presetWeight}
                  style={[
                    styles.presetButton,
                    weight === presetWeight.toString() && styles.presetButtonActive
                  ]}
                  onPress={() => handleWeightChange(presetWeight.toString())}
                >
                  <Text style={[
                    styles.presetButtonText,
                    weight === presetWeight.toString() && styles.presetButtonTextActive
                  ]}>
                    {presetWeight}g
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Total Calories</Text>
          <TextInput
            style={[styles.textInput, caloriesPer100g !== null && styles.calculatedInput]}
            placeholder="Enter calories"
            value={calories}
            onChangeText={handleManualCalorieChange}
            keyboardType="numeric"
            editable={caloriesPer100g === null} // Only editable for manual entry
          />
          {caloriesPer100g !== null && (
            <Text style={styles.helpText}>
              Automatically calculated from weight
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.addButton, isAdding && styles.addButtonDisabled]}
          onPress={addFood}
          disabled={isAdding}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>Add to Log</Text>
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
  searchSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
  },
  searchResults: {
    maxHeight: 200,
    marginTop: 12,
  },
  resultsList: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 6,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  resultCalories: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
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
    backgroundColor: '#f9f9f9',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  calculatedInput: {
    backgroundColor: '#f0f8f0',
    borderColor: '#4CAF50',
  },
  weightPresets: {
    marginBottom: 16,
  },
  presetsLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  presetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  presetButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  presetButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  presetButtonTextActive: {
    color: '#fff',
  },
});