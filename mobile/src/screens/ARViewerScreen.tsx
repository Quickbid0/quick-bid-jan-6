import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Camera, CameraType } from 'expo-camera';
import { GLView } from 'expo-gl';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type ARViewerScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

const ARViewerScreen: React.FC = () => {
  const navigation = useNavigation<ARViewerScreenNavigationProp>();
  const cameraRef = useRef<Camera>(null);
  const glViewRef = useRef<GLView>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [productDetected, setProductDetected] = useState(false);
  const [productInfo, setProductInfo] = useState<any>(null);
  const [arMode, setArMode] = useState<'scan' | 'view' | 'interact'>('scan');

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const startProductScan = async () => {
    if (!cameraRef.current) return;

    setIsScanning(true);

    try {
      // Take a photo for analysis
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

      // Analyze the image using AI
      await analyzeProductImage(photo.uri, photo.base64);

    } catch (error) {
      Alert.alert('Scan Error', 'Failed to scan product. Please try again.');
      setIsScanning(false);
    }
  };

  const analyzeProductImage = async (imageUri: string, base64Data?: string) => {
    try {
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock product detection result
      const mockProduct = {
        id: 'mock-product-123',
        name: 'iPhone 15 Pro',
        category: 'Electronics',
        estimatedValue: 125000,
        condition: 'excellent',
        confidence: 0.92,
        features: ['Face ID', 'A17 Bionic', 'Pro Camera', 'Titanium Build'],
        similarProducts: [
          { id: '1', name: 'iPhone 15', price: 95000 },
          { id: '2', name: 'Samsung S23 Ultra', price: 110000 },
          { id: '3', name: 'Google Pixel 8 Pro', price: 85000 }
        ]
      };

      setProductInfo(mockProduct);
      setProductDetected(true);
      setArMode('view');
      setIsScanning(false);

    } catch (error) {
      Alert.alert('Analysis Error', 'Failed to analyze product. Please try again.');
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    setProductDetected(false);
    setProductInfo(null);
    setArMode('scan');
  };

  const onContextCreate = async (gl: any) => {
    // Initialize AR context
    // This would set up Three.js scene for AR rendering
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 0);

    // In production, this would initialize AR tracking and 3D model rendering
  };

  const renderAROverlay = () => {
    if (!productDetected || !productInfo) return null;

    return (
      <View style={styles.arOverlay}>
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.9)', 'rgba(139, 92, 246, 0.9)']}
          style={styles.productInfoCard}
        >
          <Text style={styles.productName}>{productInfo.name}</Text>
          <Text style={styles.productCategory}>{productInfo.category}</Text>
          <Text style={styles.productValue}>
            Est. Value: ₹{productInfo.estimatedValue.toLocaleString()}
          </Text>
          <Text style={styles.productConfidence}>
            AI Confidence: {Math.round(productInfo.confidence * 100)}%
          </Text>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Detected Features:</Text>
            {productInfo.features.map((feature: string, index: number) => (
              <Text key={index} style={styles.featureText}>• {feature}</Text>
            ))}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="gavel" size={20} color="white" />
              <Text style={styles.actionButtonText}>Place Bid</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="information-circle" size={20} color="white" />
              <Text style={styles.actionButtonText}>More Info</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.similarProductsContainer}>
          <Text style={styles.similarProductsTitle}>Similar Products:</Text>
          {productInfo.similarProducts.map((product: any, index: number) => (
            <TouchableOpacity key={index} style={styles.similarProductItem}>
              <Text style={styles.similarProductName}>{product.name}</Text>
              <Text style={styles.similarProductPrice}>
                ₹{product.price.toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.permissionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={CameraType.back}
        ratio="16:9"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent', 'transparent', 'rgba(0,0,0,0.7)']}
          style={styles.cameraOverlay}
        >
          {/* AR Overlay */}
          {renderAROverlay()}

          {/* Scan Interface */}
          {!productDetected && (
            <View style={styles.scanInterface}>
              <View style={styles.scanFrame}>
                <View style={styles.scanCorner} />
                <View style={[styles.scanCorner, styles.topRight]} />
                <View style={[styles.scanCorner, styles.bottomLeft]} />
                <View style={[styles.scanCorner, styles.bottomRight]} />
              </View>

              <Text style={styles.scanInstruction}>
                Point camera at product to analyze
              </Text>

              <TouchableOpacity
                style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
                onPress={startProductScan}
                disabled={isScanning}
              >
                <MaterialIcons
                  name={isScanning ? 'hourglass-empty' : 'camera'}
                  size={24}
                  color="white"
                />
                <Text style={styles.scanButtonText}>
                  {isScanning ? 'Analyzing...' : 'Scan Product'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Control Buttons */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            {productDetected && (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={resetScan}
              >
                <MaterialIcons name="refresh" size={24} color="white" />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.controlButton}>
              <MaterialIcons name="flash-on" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Camera>

      {/* AR GL View (for 3D rendering) */}
      {productDetected && arMode === 'interact' && (
        <GLView
          ref={glViewRef}
          style={styles.glView}
          onContextCreate={onContextCreate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scanInterface: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: width * 0.8,
    height: width * 0.8,
    position: 'relative',
    marginBottom: 40,
  },
  scanCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#10B981',
    borderWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderLeftWidth: 0,
  },
  scanInstruction: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  scanButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scanButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  arOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
  },
  productInfoCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  productValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  productConfidence: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.48,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  similarProductsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
  },
  similarProductsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  similarProductItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  similarProductName: {
    fontSize: 14,
    color: 'white',
    flex: 1,
  },
  similarProductPrice: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glView: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
});

export default ARViewerScreen;
