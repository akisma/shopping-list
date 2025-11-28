/**
 * Settings Screen Tests (TDD - RED Phase)
 * Tests for voice features settings
 */

import React from 'react';
import { Alert } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import SettingsScreen from './settings';

// Mock Alert for "Coming Soon" messages
jest.spyOn(Alert, 'alert');

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    it('shows "Unavailable" message when context is not available', () => {
      render(<SettingsScreen />);

      expect(screen.getByText(/Unavailable/i)).toBeTruthy();
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

    it('shows alert when voice activation toggle is pressed without context', () => {
      render(<SettingsScreen />);

      const toggle = screen.getByTestId('voice-activation-toggle');
      fireEvent(toggle, 'onValueChange', true);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Voice Activation Unavailable',
        'Voice activation is not available in this context. Please restart the app.',
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
