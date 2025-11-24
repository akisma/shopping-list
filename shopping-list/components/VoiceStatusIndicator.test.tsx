/**
 * VoiceStatusIndicator Component Tests (TDD - RED Phase)
 * Tests for voice button component with multiple states
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { VoiceStatusIndicator } from './VoiceStatusIndicator';

describe('VoiceStatusIndicator', () => {
  describe('rendering', () => {
    it('renders with microphone icon for coming-soon state', () => {
      render(<VoiceStatusIndicator status="coming-soon" />);
      
      expect(screen.getByTestId('voice-status-indicator')).toBeTruthy();
      expect(screen.getByText('🎤')).toBeTruthy();
    });

    it('renders with microphone icon for ready state', () => {
      render(<VoiceStatusIndicator status="ready" />);
      
      expect(screen.getByTestId('voice-status-indicator')).toBeTruthy();
      expect(screen.getByText('🎤')).toBeTruthy();
    });

    it('renders with microphone icon for listening state', () => {
      render(<VoiceStatusIndicator status="listening" />);
      
      expect(screen.getByTestId('voice-status-indicator')).toBeTruthy();
      expect(screen.getByText('🎤')).toBeTruthy();
    });

    it('renders with microphone icon for processing state', () => {
      render(<VoiceStatusIndicator status="processing" />);
      
      expect(screen.getByTestId('voice-status-indicator')).toBeTruthy();
      expect(screen.getByText('🎤')).toBeTruthy();
    });
  });

  describe('interaction', () => {
    it('calls onPress when button is pressed', () => {
      const mockOnPress = jest.fn();
      render(<VoiceStatusIndicator status="coming-soon" onPress={mockOnPress} />);
      
      fireEvent.press(screen.getByTestId('voice-status-indicator'));
      
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('does not crash when pressed without onPress handler', () => {
      render(<VoiceStatusIndicator status="coming-soon" />);
      
      expect(() => {
        fireEvent.press(screen.getByTestId('voice-status-indicator'));
      }).not.toThrow();
    });
  });

  describe('visual states', () => {
    it('applies gray background for coming-soon state', () => {
      render(<VoiceStatusIndicator status="coming-soon" />);
      
      const button = screen.getByTestId('voice-status-indicator');
      expect(button.props.style).toEqual(
        expect.objectContaining({
          backgroundColor: '#E0E0E0',
        })
      );
    });

    it('applies green background for ready state', () => {
      render(<VoiceStatusIndicator status="ready" />);
      
      const button = screen.getByTestId('voice-status-indicator');
      expect(button.props.style).toEqual(
        expect.objectContaining({
          backgroundColor: '#4CAF50',
        })
      );
    });

    it('applies red background for listening state', () => {
      render(<VoiceStatusIndicator status="listening" />);
      
      const button = screen.getByTestId('voice-status-indicator');
      expect(button.props.style).toEqual(
        expect.objectContaining({
          backgroundColor: '#f44336',
        })
      );
    });

    it('applies yellow background for processing state', () => {
      render(<VoiceStatusIndicator status="processing" />);
      
      const button = screen.getByTestId('voice-status-indicator');
      expect(button.props.style).toEqual(
        expect.objectContaining({
          backgroundColor: '#FFC107',
        })
      );
    });
  });

  describe('accessibility', () => {
    it('has minimum 44pt touch target', () => {
      render(<VoiceStatusIndicator status="coming-soon" />);
      
      const button = screen.getByTestId('voice-status-indicator');
      expect(button.props.style).toEqual(
        expect.objectContaining({
          width: 44,
          height: 44,
        })
      );
    });

    it('has proper testID for automation', () => {
      render(<VoiceStatusIndicator status="coming-soon" />);
      
      expect(screen.getByTestId('voice-status-indicator')).toBeTruthy();
    });
  });
});
