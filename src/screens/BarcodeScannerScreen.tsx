import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { RootStackParamList, OpenFoodFactsResponse } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'BarcodeScanner'>;

export default function BarcodeScannerScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const fetchProductData = async (barcode: string) => {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch product data');
      }

      const data: OpenFoodFactsResponse = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;
        const productName = product.product_name || 'Unknown Product';

        // Try to get calories per 100g from different possible fields
        let calories = 0;
        if (product.nutriments) {
          calories =
            product.nutriments['energy-kcal_100g'] ||
            (product.nutriments.energy_100g ? product.nutriments.energy_100g / 4.184 : 0) ||
            0;
        }

        if (calories > 0) {
          // Navigate to AddFood with prefilled data
          navigation.navigate('AddFood', {
            prefillData: {
              name: productName,
              calories: Math.round(calories),
            },
          });
        } else {
          Alert.alert(
            'Product Found',
            `Found "${productName}" but no calorie information is available. You can add it manually.`,
            [
              {
                text: 'Add Manually',
                onPress: () => navigation.navigate('AddFood', {
                  prefillData: { name: productName },
                }),
              },
              { text: 'Cancel', onPress: () => setScanned(false) },
            ]
          );
        }
      } else {
        Alert.alert(
          'Product Not Found',
          'This product was not found in the database. You can add it manually.',
          [
            {
              text: 'Add Manually',
              onPress: () => navigation.navigate('AddFood', {}),
            },
            { text: 'Try Again', onPress: () => setScanned(false) },
          ]
        );
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
      Alert.alert(
        'Error',
        'Failed to fetch product information. You can add the food manually.',
        [
          {
            text: 'Add Manually',
            onPress: () => navigation.navigate('AddFood', {}),
          },
          { text: 'Try Again', onPress: () => setScanned(false) },
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned || isProcessing) return;

    setScanned(true);
    setIsProcessing(true);
    fetchProductData(data);
  };

  if (!permission) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.permissionText}>We need your permission to use the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.permissionButton, styles.skipButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.permissionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['upc_a', 'upc_e', 'ean13', 'ean8', 'code128', 'code39'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={styles.scanFrame} />
          </View>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              Point your camera at a barcode to scan
            </Text>
            {isProcessing && (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.processingText}>Processing...</Text>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            {scanned && (
              <TouchableOpacity
                style={styles.rescanButton}
                onPress={() => setScanned(false)}
                disabled={isProcessing}
              >
                <Text style={styles.rescanButtonText}>Scan Again</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 32,
    color: '#333',
  },
  permissionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  skipButton: {
    backgroundColor: '#666',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  scanArea: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  instructionsText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    marginHorizontal: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rescanButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    marginHorizontal: 8,
  },
  rescanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});