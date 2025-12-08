/**
 * Settings Screen Tests (TDD - RED Phase)
 * Tests for voice features settings
 */

import React from 'react';
import { Alert } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import SettingsScreen from './settings';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock safe area insets
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock Alert for "Coming Soon" messages
jest.spyOn(Alert, 'alert');

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe('voice features section', () => {
    it('renders voice features section header', () => {
      render(<SettingsScreen />);

      expect(screen.getByText('Voice Features')).toBeTruthy();
    });

    it('renders voice activation toggle', () => {
      render(<SettingsScreen />);

      expect(screen.getByText('Enable Voice Activation')).toBeTruthy();
      expect(screen.getByTestId('voice-activation-toggle')).toBeTruthy();
    });

    it('renders "Hey Shoppy" instruction text', () => {
      render(<SettingsScreen />);

      expect(screen.getByText(/Say.*Hey Shoppy.*to activate/i)).toBeTruthy();
    });

    it('shows "Coming in Task 4" message for voice activation', () => {
      render(<SettingsScreen />);

      expect(screen.getByText(/Coming in Task 4/i)).toBeTruthy();
    });

    it('renders voice button toggle', () => {
      render(<SettingsScreen />);

      expect(screen.getByText('Voice Button on Lists')).toBeTruthy();
      expect(screen.getByTestId('voice-button-toggle')).toBeTruthy();
    });

    it('shows "Coming Soon" message for voice button', () => {
      render(<SettingsScreen />);

      expect(screen.getByText(/Coming Soon/i)).toBeTruthy();
    });
  });

  describe('toggle interactions', () => {
    it('voice activation toggle is disabled', () => {
      render(<SettingsScreen />);

      const toggle = screen.getByTestId('voice-activation-toggle');
      expect(toggle.props.disabled).toBe(true);
    });

    it('shows alert when voice activation toggle is pressed', () => {
      render(<SettingsScreen />);

      const toggle = screen.getByTestId('voice-activation-toggle');
      fireEvent(toggle, 'onValueChange', true);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Coming in Task 4',
        'Voice activation with "Hey Shoppy" wake word will be available when we integrate OpenAI Whisper and GPT-4.',
        expect.any(Array)
      );
    });

    it('voice button toggle is disabled', () => {
      render(<SettingsScreen />);

      const toggle = screen.getByTestId('voice-button-toggle');
      expect(toggle.props.disabled).toBe(true);
    });

    it('shows alert when voice button toggle is pressed', () => {
      render(<SettingsScreen />);

      const toggle = screen.getByTestId('voice-button-toggle');
      fireEvent(toggle, 'onValueChange', true);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Coming Soon',
        'Voice button functionality will be available in the next update. We\'re building the voice recognition features!',
        expect.any(Array)
      );
    });
  });

  describe('toggle states', () => {
    it('voice activation toggle is off by default', () => {
      render(<SettingsScreen />);

      const toggle = screen.getByTestId('voice-activation-toggle');
      expect(toggle.props.value).toBe(false);
    });

    it('voice button toggle is on by default', () => {
      render(<SettingsScreen />);

      const toggle = screen.getByTestId('voice-button-toggle');
      expect(toggle.props.value).toBe(true);
    });
  });
});
