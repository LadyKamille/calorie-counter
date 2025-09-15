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
import { RootStackParamList, EdamamResponse, EdamamFood } from '../types';
import { StorageService } from '../services/StorageService';
import { EdamamTestService } from '../services/EdamamTestService';
import { EdamamService, FoodSearchResult } from '../services/EdamamService';

type Props = NativeStackScreenProps<RootStackParamList, 'AddFood'>;

const EDAMAM_APP_ID = process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EXPO_PUBLIC_EDAMAM_APP_KEY;

// Using FoodSearchResult from EdamamService

export default function AddFoodScreen({ navigation, route }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
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
    setCalories(result.calories.toString());
    setSearchResults([]);
    setSearchQuery('');
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
      <Text style={styles.resultCalories}>{item.calories} cal/100g</Text>
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
          <Text style={styles.inputLabel}>Calories</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter calories"
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
          />
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

        {/* Debug Buttons - Remove after testing */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: '#FF5722', marginTop: 10 }]}
          onPress={() => EdamamTestService.runAllTests()}
        >
          <Text style={styles.addButtonText}>🐛 Test All APIs (Check Console)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: '#9C27B0', marginTop: 10 }]}
          onPress={async () => {
            try {
              console.log('Testing new search service...');
              const results = await EdamamService.searchFoods('chicken');
              console.log('Search results:', results);
              Alert.alert('Test Results', `Found ${results.length} results. Check console for details.`);
            } catch (error) {
              console.error('Test error:', error);
              Alert.alert('Test Error', `${error}`);
            }
          }}
        >
          <Text style={styles.addButtonText}>🚀 Test New Search</Text>
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
});