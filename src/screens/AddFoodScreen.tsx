import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { StorageService } from '../services/StorageService';
import FoodSearchComponent, { FoodSelectionResult } from '../components/FoodSearchComponent';

type Props = NativeStackScreenProps<RootStackParamList, 'AddFood'>;


export default function AddFoodScreen({ navigation, route }: Props) {
  const [isAdding, setIsAdding] = useState(false);

  const handleFoodSelected = async (result: FoodSelectionResult) => {
    setIsAdding(true);
    try {
      const entry = {
        id: StorageService.generateId(),
        name: result.name,
        calories: result.calories,
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FoodSearchComponent
        onFoodSelected={handleFoodSelected}
        placeholder="Search for foods (min 2 chars, e.g., chicken, apple)"
        manualEntryTitle="Add Food"
      />

      {isAdding && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});