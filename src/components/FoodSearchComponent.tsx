import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { EdamamService, FoodSearchResult, FoodCalculator } from '../services/EdamamService';

export interface FoodSelectionResult {
  name: string;
  calories: number;
  weight: number;
  caloriesPer100g: number;
}

interface FoodSearchComponentProps {
  onFoodSelected: (result: FoodSelectionResult) => void;
  placeholder?: string;
  showWeightInput?: boolean;
  defaultWeight?: string;
  allowManualEntry?: boolean;
  manualEntryTitle?: string;
}

export default function FoodSearchComponent({
  onFoodSelected,
  placeholder = "Search for foods (min 2 chars)",
  showWeightInput = true,
  defaultWeight = "100",
  allowManualEntry = true,
  manualEntryTitle = "Or Enter Manually"
}: FoodSearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Form fields
  const [foodName, setFoodName] = useState('');
  const [weight, setWeight] = useState(defaultWeight);
  const [calories, setCalories] = useState('');
  const [caloriesPer100g, setCaloriesPer100g] = useState<number | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

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

  const handleSearchTextChange = (text: string) => {
    setSearchQuery(text);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!text.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (text.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(() => {
      searchFoods(text);
    }, 800);
  };

  const selectSearchResult = (result: FoodSearchResult) => {
    setFoodName(result.label);
    setCaloriesPer100g(result.calories);
    setWeight(defaultWeight);
    setCalories(result.calories.toString());
    setSearchResults([]);
    setSearchQuery('');
  };

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

  const handleManualCalorieChange = (newCalories: string) => {
    setCalories(newCalories);
    if (caloriesPer100g !== null) {
      setCaloriesPer100g(null);
      setWeight(defaultWeight);
    }
  };

  const handleAddFood = () => {
    if (!foodName.trim() || !calories.trim()) {
      Alert.alert('Validation Error', 'Please enter both food name and calories');
      return;
    }

    const calorieValue = parseInt(calories);
    if (isNaN(calorieValue) || calorieValue < 0) {
      Alert.alert('Validation Error', 'Please enter a valid calorie amount');
      return;
    }

    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid weight');
      return;
    }

    const result: FoodSelectionResult = {
      name: foodName.trim(),
      calories: calorieValue,
      weight: weightValue,
      caloriesPer100g: caloriesPer100g || (calorieValue * 100 / weightValue),
    };

    onFoodSelected(result);

    // Reset form
    setFoodName('');
    setCalories('');
    setWeight(defaultWeight);
    setCaloriesPer100g(null);
  };

  const renderSearchResult = ({ item }: { item: FoodSearchResult }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => selectSearchResult(item)}
    >
      <Text style={styles.resultName}>{item.label}</Text>
      <Text style={styles.resultCalories}>{item.calories} cal/100g → Tap to add</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Section */}
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Search Foods</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
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

      {/* Manual Entry Section */}
      {allowManualEntry && (
        <View style={styles.manualSection}>
          <Text style={styles.sectionTitle}>{manualEntryTitle}</Text>

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

          {showWeightInput && (
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
          )}

          {caloriesPer100g !== null && showWeightInput && (
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
              editable={caloriesPer100g === null}
            />
            {caloriesPer100g !== null && (
              <Text style={styles.helpText}>
                Automatically calculated from weight
              </Text>
            )}
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddFood}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  searchSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  manualSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
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
  calculatedInput: {
    backgroundColor: '#f0f8f0',
    borderColor: '#4CAF50',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
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
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});