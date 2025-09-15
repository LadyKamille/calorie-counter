# Calorie Counter Mobile App

A comprehensive React Native calorie tracking application built with Expo and TypeScript. Track your daily food intake, scan barcodes, manage recipes, and set calorie goals - all stored locally on your device.

## Features

### 🏠 Dashboard
- Daily calorie goal tracking with visual progress
- Today's food log with detailed entries
- Quick access to all app features
- Calories consumed and remaining display

### 🔍 Food Search & Adding
- **Online Search**: Integration with Edamam API for food nutrition data
- **Manual Entry**: Add custom food items with calorie information
- **Auto-populate**: Search results automatically fill the form
- Real-time search as you type

### 📱 Barcode Scanner
- **Camera Integration**: Scan product barcodes using device camera
- **Open Food Facts API**: Automatic product lookup and nutrition data
- **Smart Navigation**: Auto-fills food data when product is found
- Fallback to manual entry if product not found

### 📝 Recipe Management
- **Create Recipes**: Build custom recipes with multiple ingredients
- **Ingredient Management**: Add, edit, and remove ingredients dynamically
- **Calorie Calculation**: Automatic total calorie calculation
- **Recipe Storage**: Save and edit recipes locally

### ⚙️ Settings
- **Calorie Goal**: Set and modify daily calorie targets
- **Quick Presets**: Common calorie goals (1500, 2000, 2500)
- **Guidelines**: Built-in calorie recommendations
- **Data Persistence**: Settings saved locally

## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack Navigator)
- **Storage**: AsyncStorage for local data persistence
- **Camera**: Expo Camera with barcode scanning
- **APIs**:
  - Edamam Food Database API
  - Open Food Facts API

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd calorie-counter
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables Setup

#### Create Environment File
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your API credentials:
   ```bash
   EXPO_PUBLIC_EDAMAM_APP_ID=your_actual_app_id
   EXPO_PUBLIC_EDAMAM_APP_KEY=your_actual_app_key
   # EXPO_PUBLIC_EDAMAM_USER_ID not needed for Food Database API
   ```

#### Edamam API Setup
1. Sign up at [Edamam Developer Portal](https://developer.edamam.com/)
2. Subscribe to the **Food Database API**
3. Get your credentials from your dashboard:
   - **App ID** and **App Key** (found in your application details)
4. Add them to your `.env` file (see above)

**Supported Plans:**
- ✅ Food Database API (recommended)
- ✅ Free tier with 5 calls/minute
- ✅ Nutrition data per 100g serving

#### Open Food Facts API
No configuration required - uses public API endpoints.

### 4. Start Development Server
```bash
npm start
```

This will open the Expo Developer Tools in your browser.

## Running the App

### On Physical Device
1. Install Expo Go app from App Store/Google Play
2. Scan the QR code from the Expo Developer Tools
3. The app will load on your device

### On Emulator/Simulator

#### Android Emulator
```bash
npm run android
```

#### iOS Simulator (macOS only)
```bash
npm run ios
```

#### Web Browser
```bash
npm run web
```

## Building for Production

### Android APK
```bash
npm run build:android
```

### iOS App
```bash
npm run build:ios
```

### EAS Build (Recommended)
For modern builds using Expo Application Services:
```bash
npx eas build --platform android
npx eas build --platform ios
```

## Project Structure

```
calorie-counter/
├── src/
│   ├── components/          # Reusable UI components
│   ├── navigation/         # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/           # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── AddFoodScreen.tsx
│   │   ├── RecipesScreen.tsx
│   │   ├── CreateRecipeScreen.tsx
│   │   ├── BarcodeScannerScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/          # Business logic & API calls
│   │   └── StorageService.ts
│   └── types/            # TypeScript type definitions
│       └── index.ts
├── assets/               # Images, fonts, etc.
├── App.tsx              # Main app component
├── app.json            # Expo configuration
├── package.json        # Dependencies & scripts
└── README.md          # This file
```

## Data Models

### FoodLogEntry
```typescript
interface FoodLogEntry {
  id: string;
  name: string;
  calories: number;
  date: string;
}
```

### Recipe
```typescript
interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
}

interface RecipeIngredient {
  name: string;
  calories: number;
}
```

### AppSettings
```typescript
interface AppSettings {
  dailyGoal: number;
}
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm run typecheck` - Run TypeScript type checking
- `npm run build` - Build for production
- `npm run build:android` - Build Android APK
- `npm run build:ios` - Build iOS app

## Features in Detail

### Barcode Scanning
- Uses device camera to scan UPC, EAN, and Code128 barcodes
- Integrates with Open Food Facts database
- Handles permission requests gracefully
- Provides fallback for unknown products

### Food Search
- Real-time search with 500ms debounce
- Displays calories per 100g for search results
- One-tap to populate form with search result
- Manual entry always available

### Recipe Management
- Dynamic ingredient list with add/remove functionality
- Real-time total calorie calculation
- Edit existing recipes
- Delete recipes with confirmation

### Local Storage
- All data stored locally using AsyncStorage
- No user authentication required
- Data persists between app sessions
- Efficient date-based food log queries

## Permissions

The app requires the following permissions:
- **Camera**: For barcode scanning functionality

## API Rate Limits

- **Edamam Food Database API**: 5 calls/minute, 10,000/month (free tier)
- **Open Food Facts**: No rate limits (public API)

## Environment Variables

### Important Notes
- **Expo SDK 49+**: Environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in client-side code
- **Security**: The `.env` file is gitignored to keep API keys secure
- **Example File**: Use `.env.example` as a template for required variables
- **Validation**: The app will show an error if API credentials are missing

### Available Variables
- `EXPO_PUBLIC_EDAMAM_APP_ID` - Your Edamam Food Database API application ID
- `EXPO_PUBLIC_EDAMAM_APP_KEY` - Your Edamam Food Database API key

## Troubleshooting

### Common Issues

1. **Camera not working on Android**
   - Ensure camera permissions are granted
   - Check if device has a camera
   - Try restarting the app

2. **Search not returning results**
   - Verify Edamam API credentials
   - Check internet connection
   - Try different search terms

3. **App crashes on startup**
   - Clear app data/cache
   - Reinstall the app
   - Check for device compatibility

### Development Issues

1. **Module resolution errors**
   ```bash
   npm install
   expo r -c
   ```

2. **TypeScript errors**
   ```bash
   npm run typecheck
   ```

3. **Build failures**
   - Check expo-cli version
   - Update dependencies
   - Clear cache and rebuild

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the troubleshooting section
- Review Expo documentation
- Check React Navigation documentation
- Open an issue in the repository

## Roadmap

Future enhancements could include:
- Meal planning features
- Exercise tracking
- Nutrition goals beyond calories
- Data export functionality
- Social features
- Offline mode improvements
- More detailed nutrition information