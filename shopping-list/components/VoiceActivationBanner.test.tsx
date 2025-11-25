/**
 * VoiceActivationBanner Component Tests (TDD - RED Phase)
 * Tests for persistent voice activation indicator banner
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { VoiceActivationBanner } from './VoiceActivationBanner';

describe('VoiceActivationBanner', () => {
  describe('visibility', () => {
    it('shows banner when voice activation is enabled', () => {
      render(<VoiceActivationBanner visible={true} />);
      
      expect(screen.getByTestId('voice-activation-banner')).toBeTruthy();
    });

    it('hides banner when voice activation is disabled', () => {
      render(<VoiceActivationBanner visible={false} />);
      
      expect(screen.queryByTestId('voice-activation-banner')).toBeNull();
    });
  });

  describe('content', () => {
    it('displays microphone emoji', () => {
      render(<VoiceActivationBanner visible={true} />);
      
      expect(screen.getByText(/🎤/)).toBeTruthy();
    });

    it('displays "Voice Activation On" text', () => {
      render(<VoiceActivationBanner visible={true} />);
      
      expect(screen.getByText(/Voice Activation On/i)).toBeTruthy();
    });

    it('displays "Hey Shoppy" wake word instruction', () => {
      render(<VoiceActivationBanner visible={true} />);
      
      expect(screen.getByText(/Hey Shoppy/i)).toBeTruthy();
    });

    it('displays "Coming Soon" message', () => {
      render(<VoiceActivationBanner visible={true} />);
      
      expect(screen.getByText(/Coming Soon/i)).toBeTruthy();
    });
  });

  describe('styling', () => {
    it('applies light green background', () => {
      render(<VoiceActivationBanner visible={true} />);
      
      const banner = screen.getByTestId('voice-activation-banner');
      expect(banner.props.style).toEqual(
        expect.objectContaining({
          backgroundColor: '#E8F5E9',
        })
      );
    });

    it('has bottom border with green color', () => {
      render(<VoiceActivationBanner visible={true} />);
      
      const banner = screen.getByTestId('voice-activation-banner');
      expect(banner.props.style).toEqual(
        expect.objectContaining({
          borderBottomWidth: 1,
          borderBottomColor: '#4CAF50',
        })
      );
    });

    it('has proper padding for readability', () => {
      render(<VoiceActivationBanner visible={true} />);
      
      const banner = screen.getByTestId('voice-activation-banner');
      expect(banner.props.style).toEqual(
        expect.objectContaining({
          paddingVertical: 8,
          paddingHorizontal: 16,
        })
      );
    });
  });

  describe('accessibility', () => {
    it('has testID for automation', () => {
      render(<VoiceActivationBanner visible={true} />);
      
      expect(screen.getByTestId('voice-activation-banner')).toBeTruthy();
    });
  });
});
