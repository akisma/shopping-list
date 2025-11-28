/**
 * Settings Screen Wake Word Integration Tests (TDD - RED Phase)
 * Tests for the integration between settings and wake word detection
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import SettingsScreen from './settings';
import { WakeWordProvider } from '@/contexts/wake-word-context';

// Mock to track wake word context state
let mockWakeWordState = {
  enabled: true,
  setEnabled: jest.fn(),
};

// Mock the context
jest.mock('@/contexts/wake-word-context', () => {
  const originalModule = jest.requireActual('@/contexts/wake-word-context');
  return {
    ...originalModule,
    useWakeWordContext: () => mockWakeWordState,
  };
});

describe('SettingsScreen - Wake Word Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWakeWordState = {
      enabled: true,
      setEnabled: jest.fn(),
    };
  });

  describe('when wake word context is available', () => {
    it('voice activation toggle is enabled', () => {
      render(
        <WakeWordProvider>
          <SettingsScreen />
        </WakeWordProvider>
      );

      const toggle = screen.getByTestId('voice-activation-toggle');
      expect(toggle.props.disabled).toBe(false);
    });

    it('voice activation toggle reflects wake word enabled state', () => {
      mockWakeWordState.enabled = true;
      
      render(
        <WakeWordProvider>
          <SettingsScreen />
        </WakeWordProvider>
      );

      const toggle = screen.getByTestId('voice-activation-toggle');
      expect(toggle.props.value).toBe(true);
    });

    it('toggling voice activation calls setEnabled', () => {
      render(
        <WakeWordProvider>
          <SettingsScreen />
        </WakeWordProvider>
      );

      const toggle = screen.getByTestId('voice-activation-toggle');
      fireEvent(toggle, 'onValueChange', false);

      expect(mockWakeWordState.setEnabled).toHaveBeenCalledWith(false);
    });

    it('does not show "Coming in Task 4" when context is available', () => {
      render(
        <WakeWordProvider>
          <SettingsScreen />
        </WakeWordProvider>
      );

      expect(screen.queryByText(/Coming in Task 4/i)).toBeNull();
    });

    it('shows "Enabled" status when wake word is enabled', () => {
      mockWakeWordState.enabled = true;
      
      render(
        <WakeWordProvider>
          <SettingsScreen />
        </WakeWordProvider>
      );

      expect(screen.getByText(/Enabled/)).toBeTruthy();
    });

    it('shows "Disabled" status when wake word is disabled', () => {
      mockWakeWordState.enabled = false;
      
      render(
        <WakeWordProvider>
          <SettingsScreen />
        </WakeWordProvider>
      );

      expect(screen.getByText(/Disabled/)).toBeTruthy();
    });
  });
});
