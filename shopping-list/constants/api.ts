/**
 * API Configuration Constants
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get the appropriate backend URL based on platform
const getBackendUrl = (): string => {
  console.log('[API Config] __DEV__:', __DEV__);
  console.log('[API Config] Platform.OS:', Platform.OS);
  console.log('[API Config] Constants.expoConfig?.hostUri:', Constants.expoConfig?.hostUri);
  
  // For Expo Go or development builds
  if (__DEV__) {
    // Android emulator uses 10.0.2.2 to reach host machine's localhost
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3001';
    }
    
    // For physical devices, use the Expo dev server's host
    const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
    console.log('[API Config] Extracted debuggerHost:', debuggerHost);
    
    if (debuggerHost && debuggerHost !== 'localhost') {
      const url = `http://${debuggerHost}:3001`;
      console.log('[API Config] Using physical device URL:', url);
      return url;
    }
    
    // iOS simulator and web can use localhost
    if (Platform.OS === 'ios' || Platform.OS === 'web') {
      console.log('[API Config] Using localhost for iOS simulator/web');
      return 'http://localhost:3001';
    }
  }
  
  // Production: Use environment variable or default
  return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
};

// Base URL for the backend API
export const API_BASE_URL = getBackendUrl();

// Log the URL being used for debugging
console.log('[API Config] Base URL:', API_BASE_URL);
console.log('[API Config] Platform:', Platform.OS);

// API version prefix
export const API_VERSION = '/api/v1';

// Full base path
export const API_BASE_PATH = `${API_BASE_URL}${API_VERSION}`;

// API Endpoints
export const ENDPOINTS = {
  // Shopping Lists
  SHOPPING_LISTS: '/shopping-lists',
  SHOPPING_LIST_BY_ID: (id: string) => `/shopping-lists/${id}`,
  SEND_SHOPPING_LIST: (id: string) => `/shopping-lists/${id}/send`,
  
  // Shopping List Items
  LIST_ITEMS: (listId: string) => `/shopping-lists/${listId}/items`,
  LIST_ITEM_BY_ID: (listId: string, itemId: string) => `/shopping-lists/${listId}/items/${itemId}`,
  
  // Reminders
  REMINDERS: '/reminders',
  REMINDER_BY_ID: (id: string) => `/reminders/${id}`,
  
  // Health
  HEALTH: '/health',
} as const;

// Request timeout in milliseconds
export const API_TIMEOUT = 30000;

// Retry configuration
export const API_RETRY_ATTEMPTS = 3;
export const API_RETRY_DELAY = 1000;
