import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import reducers
import authReducer from './slices/authSlice';
import auctionsReducer from './slices/auctionsSlice';
import bidsReducer from './slices/bidsSlice';
import productsReducer from './slices/productsSlice';
import voiceReducer from './slices/voiceSlice';
import arReducer from './slices/arSlice';
import notificationsReducer from './slices/notificationsSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'auctions', 'bids', 'voice', 'ar'], // Only persist these
};

const rootReducer = combineReducers({
  auth: authReducer,
  auctions: auctionsReducer,
  bids: bidsReducer,
  products: productsReducer,
  voice: voiceReducer,
  ar: arReducer,
  notifications: notificationsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
