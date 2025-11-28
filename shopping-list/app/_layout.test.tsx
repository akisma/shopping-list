/**
 * Root Layout Tests (TDD - RED Phase)
 * Tests for app-wide provider setup including WakeWordProvider
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { useWakeWordContext } from '@/contexts/wake-word-context';

// We test that wake word context is available throughout the app
// by checking if a component can access it

// Mock the hooks
jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

// Mock expo-router Stack
jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
}));

// Mock the query client
jest.mock('@/lib/query-client', () => ({
  queryClient: {
    defaultOptions: {},
  },
}));

// Create a test component that tries to use the wake word context
function WakeWordContextChecker() {
  try {
    const context = useWakeWordContext();
    return (
      <View testID="wake-word-available">
        <Text>Wake Phrase: {context.wakePhrase}</Text>
        <Text>Status: {context.status}</Text>
      </View>
    );
  } catch {
    return (
      <View testID="wake-word-unavailable">
        <Text>Context Not Available</Text>
      </View>
    );
  }
}

describe('RootLayout Wake Word Integration', () => {
  it('should export RootLayout as default', async () => {
    // This test verifies that RootLayout exists and is exported correctly
    const RootLayoutModule = require('./_layout');
    const RootLayout = RootLayoutModule.default;
    expect(typeof RootLayout).toBe('function');
  });

  it('wake word context should have correct wake phrase', () => {
    // Import the context directly to verify setup
    const { WakeWordProvider } = require('@/contexts/wake-word-context');
    
    render(
      <WakeWordProvider>
        <WakeWordContextChecker />
      </WakeWordProvider>
    );

    expect(screen.getByTestId('wake-word-available')).toBeTruthy();
    expect(screen.getByText(/hey shoppy/i)).toBeTruthy();
  });

  it('wake word context should start with idle status', () => {
    const { WakeWordProvider } = require('@/contexts/wake-word-context');
    
    render(
      <WakeWordProvider>
        <WakeWordContextChecker />
      </WakeWordProvider>
    );

    expect(screen.getByText(/Status: idle/)).toBeTruthy();
  });
});
