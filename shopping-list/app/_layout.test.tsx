/**
 * Root Layout Tests
 * Tests for app-wide provider setup including WakeWordProvider
 */

import React from 'react';

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

describe('RootLayout', () => {
  it('should export RootLayout as default', () => {
    const RootLayoutModule = require('./_layout');
    const RootLayout = RootLayoutModule.default;
    expect(typeof RootLayout).toBe('function');
  });
});
