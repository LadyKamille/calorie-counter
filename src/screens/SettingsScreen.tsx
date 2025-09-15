import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, AppSettings } from '../types';
import { StorageService } from '../services/StorageService';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const [dailyGoal, setDailyGoal] = useState('2000');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await StorageService.getSettings();
      setDailyGoal(settings.dailyGoal.toString());
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    const goalValue = parseInt(dailyGoal);

    if (isNaN(goalValue) || goalValue <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid daily calorie goal (greater than 0)');
      return;
    }

    if (goalValue < 800 || goalValue > 5000) {
      Alert.alert(
        'Warning',
        'Your daily calorie goal seems unusual. Are you sure you want to continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => performSave(goalValue) },
        ]
      );
      return;
    }

    await performSave(goalValue);
  };

  const performSave = async (goalValue: number) => {
    setSaving(true);
    try {
      const settings: AppSettings = {
        dailyGoal: goalValue,
      };

      await StorageService.saveSettings(settings);
      Alert.alert('Success', 'Settings saved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    Alert.alert(
      'Reset to Default',
      'This will reset your daily calorie goal to 2000 calories. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => setDailyGoal('2000'),
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.settingsCard}>
        <Text style={styles.title}>Calorie Goal Settings</Text>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Daily Calorie Goal</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter daily calorie goal"
            value={dailyGoal}
            onChangeText={setDailyGoal}
            keyboardType="numeric"
            selectTextOnFocus
          />
          <Text style={styles.helpText}>
            Set your daily calorie target. This will be used to track your progress and calculate
            remaining calories.
          </Text>
        </View>

        <View style={styles.presetSection}>
          <Text style={styles.presetTitle}>Quick Presets</Text>
          <View style={styles.presetButtons}>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setDailyGoal('1500')}
            >
              <Text style={styles.presetButtonText}>1500</Text>
              <Text style={styles.presetButtonSubtext}>Weight Loss</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setDailyGoal('2000')}
            >
              <Text style={styles.presetButtonText}>2000</Text>
              <Text style={styles.presetButtonSubtext}>Maintenance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setDailyGoal('2500')}
            >
              <Text style={styles.presetButtonText}>2500</Text>
              <Text style={styles.presetButtonSubtext}>Weight Gain</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={resetToDefault}
          >
            <Text style={styles.resetButtonText}>Reset to Default</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={saveSettings}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Settings</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Guidelines</Text>
          <Text style={styles.infoText}>
            • General maintenance: 1800-2200 calories for women, 2200-2800 for men
          </Text>
          <Text style={styles.infoText}>
            • Weight loss: 500-750 calories below maintenance
          </Text>
          <Text style={styles.infoText}>
            • Weight gain: 300-500 calories above maintenance
          </Text>
          <Text style={styles.infoText}>
            • Consult a healthcare provider for personalized advice
          </Text>
        </View>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 16,
    fontSize: 18,
    backgroundColor: '#f9f9f9',
    textAlign: 'center',
    fontWeight: '600',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  presetSection: {
    marginBottom: 24,
  },
  presetTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  presetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  presetButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  presetButtonSubtext: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  resetButton: {
    backgroundColor: '#f44336',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 6,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
});