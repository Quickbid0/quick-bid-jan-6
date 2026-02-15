import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/redux/store';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import AuctionsScreen from './src/screens/AuctionsScreen';
import VoiceBidScreen from './src/screens/VoiceBidScreen';
import ARViewerScreen from './src/screens/ARViewerScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import LiveAuctionScreen from './src/screens/LiveAuctionScreen';

// Components
import TabBar from './src/components/TabBar';
import LoadingScreen from './src/components/LoadingScreen';

// Navigation Types
export type RootTabParamList = {
  Home: undefined;
  Auctions: undefined;
  VoiceBid: undefined;
  ARViewer: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  ProductDetail: { productId: string };
  LiveAuction: { auctionId: string };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Auctions" component={AuctionsScreen} />
      <Tab.Screen name="VoiceBid" component={VoiceBidScreen} />
      <Tab.Screen name="ARViewer" component={ARViewerScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Main App Component
export default function App() {
  const theme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      tertiary: '#EC4899',
    },
  };

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <PaperProvider theme={theme}>
          <SafeAreaProvider>
            <NavigationContainer>
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen name="MainTabs" component={TabNavigator} />
                <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
                <Stack.Screen name="LiveAuction" component={LiveAuctionScreen} />
              </Stack.Navigator>
              <StatusBar style="auto" />
            </NavigationContainer>
          </SafeAreaProvider>
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
}
