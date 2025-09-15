import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, FoodLogEntry, AppSettings } from '../types';
import { StorageService } from '../services/StorageService';
import { useFocusEffect } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [todayEntries, setTodayEntries] = useState<FoodLogEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ dailyGoal: 2000 });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const today = StorageService.getTodayDateString();
      const [entries, appSettings] = await Promise.all([
        StorageService.getFoodLogForDate(today),
        StorageService.getSettings(),
      ]);
      setTodayEntries(entries);
      setSettings(appSettings);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const totalCalories = todayEntries.reduce((sum, entry) => sum + entry.calories, 0);
  const remainingCalories = settings.dailyGoal - totalCalories;

  const renderFoodItem = ({ item }: { item: FoodLogEntry }) => (
    <View style={styles.foodItem}>
      <Text style={styles.foodName}>{item.name}</Text>
      <Text style={styles.foodCalories}>{item.calories} cal</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Today's Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Goal:</Text>
          <Text style={styles.summaryValue}>{settings.dailyGoal} cal</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Consumed:</Text>
          <Text style={styles.summaryValue}>{totalCalories} cal</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Remaining:</Text>
          <Text
            style={[
              styles.summaryValue,
              remainingCalories < 0 ? styles.overGoal : styles.underGoal,
            ]}
          >
            {remainingCalories} cal
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate('AddFood', {})}
        >
          <Text style={styles.buttonText}>Add Food</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('BarcodeScanner')}
        >
          <Text style={styles.buttonText}>Scan Barcode</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.todayLog}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Log</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.settingsLink}>Settings</Text>
          </TouchableOpacity>
        </View>

        {todayEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No food logged today</Text>
            <Text style={styles.emptySubtext}>Tap "Add Food" to get started!</Text>
          </View>
        ) : (
          <FlatList
            data={todayEntries}
            renderItem={renderFoodItem}
            keyExtractor={(item) => item.id}
            style={styles.foodList}
          />
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, styles.recipesButton]}
        onPress={() => navigation.navigate('Recipes')}
      >
        <Text style={styles.buttonText}>View Recipes</Text>
      </TouchableOpacity>
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
  summaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  overGoal: {
    color: '#f44336',
  },
  underGoal: {
    color: '#4CAF50',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
  },
  recipesButton: {
    backgroundColor: '#FF9800',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  todayLog: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsLink: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  foodList: {
    flex: 1,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  foodName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  foodCalories: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
});