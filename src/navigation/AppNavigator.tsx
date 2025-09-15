import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

import HomeScreen from '../screens/HomeScreen';
import AddFoodScreen from '../screens/AddFoodScreen';
import RecipesScreen from '../screens/RecipesScreen';
import CreateRecipeScreen from '../screens/CreateRecipeScreen';
import BarcodeScannerScreen from '../screens/BarcodeScannerScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Calorie Counter' }}
        />
        <Stack.Screen
          name="AddFood"
          component={AddFoodScreen}
          options={{ title: 'Add Food' }}
        />
        <Stack.Screen
          name="Recipes"
          component={RecipesScreen}
          options={{ title: 'Recipes' }}
        />
        <Stack.Screen
          name="CreateRecipe"
          component={CreateRecipeScreen}
          options={{ title: 'Create Recipe' }}
        />
        <Stack.Screen
          name="BarcodeScanner"
          component={BarcodeScannerScreen}
          options={{ title: 'Scan Barcode' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}