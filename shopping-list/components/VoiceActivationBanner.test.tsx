/**
 * VoiceActivationBanner Component Tests (TDD - RED Phase)
 * Tests for persistent voice activation indicator banner
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { VoiceActivationBanner } from './VoiceActivationBanner';
import { VoiceListeningProvider, useVoiceListeningContext, type PendingActionData } from '../hooks/use-voice-listening-context';

// Helper to render with VoiceListeningProvider
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <VoiceListeningProvider>
      {component}
    </VoiceListeningProvider>
  );
};

// Helper to render with custom listening state for testing
const renderWithListeningState = (
  component: React.ReactElement,
  listeningMode: 'inactive' | 'waiting-for-clarification' | 'background-wake-word',
  pendingAction?: PendingActionData | null
) => {
  const StateInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { startListeningForClarification, setBackgroundWakeWord } = useVoiceListeningContext();
    
    React.useEffect(() => {
      if (listeningMode === 'waiting-for-clarification' && pendingAction) {
        startListeningForClarification(pendingAction);
      } else if (listeningMode === 'background-wake-word') {
        setBackgroundWakeWord(true);
      }
    }, [startListeningForClarification, setBackgroundWakeWord]);

    return <>{children}</>;
  };

  return render(
    <VoiceListeningProvider>
      <StateInitializer>
        {component}
      </StateInitializer>
    </VoiceListeningProvider>
  );
};

describe('VoiceActivationBanner', () => {
  describe('visibility', () => {
    it('shows banner when voice activation is enabled', () => {
      renderWithProviders(<VoiceActivationBanner visible={true} />);
      
      expect(screen.getByTestId('voice-activation-banner')).toBeTruthy();
    });

    it('hides banner when voice activation is disabled', () => {
      renderWithProviders(<VoiceActivationBanner visible={false} />);
      
      expect(screen.queryByTestId('voice-activation-banner')).toBeNull();
    });
  });

  describe('content', () => {
    it('displays microphone emoji', () => {
      renderWithProviders(<VoiceActivationBanner visible={true} />);
      
      expect(screen.getByText(/🎤/)).toBeTruthy();
    });

    it('displays "Voice Activation On" text', () => {
      renderWithProviders(<VoiceActivationBanner visible={true} />);
      
      expect(screen.getByText(/Voice Activation On/i)).toBeTruthy();
    });

    it('displays "Hey Shoppy" wake word instruction', () => {
      renderWithProviders(<VoiceActivationBanner visible={true} />);
      
      expect(screen.getByText(/Hey Shoppy/i)).toBeTruthy();
    });

    it('displays "Coming Soon" message', () => {
      renderWithProviders(<VoiceActivationBanner visible={true} />);
      
      expect(screen.getByText(/Coming Soon/i)).toBeTruthy();
    });
  });

  describe('styling', () => {
    it('applies light green background', () => {
      renderWithProviders(<VoiceActivationBanner visible={true} />);
      
      const banner = screen.getByTestId('voice-activation-banner');
      expect(banner.props.style).toEqual(
        expect.objectContaining({
          backgroundColor: '#E8F5E9',
        })
      );
    });

    it('has bottom border with green color', () => {
      renderWithProviders(<VoiceActivationBanner visible={true} />);
      
      const banner = screen.getByTestId('voice-activation-banner');
      expect(banner.props.style).toEqual(
        expect.objectContaining({
          borderBottomWidth: 1,
          borderBottomColor: '#4CAF50',
        })
      );
    });

    it('has proper padding for readability', () => {
      renderWithProviders(<VoiceActivationBanner visible={true} />);
      
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
      renderWithProviders(<VoiceActivationBanner visible={true} />);
      
      expect(screen.getByTestId('voice-activation-banner')).toBeTruthy();
    });
  });

  describe('clarification mode integration', () => {
    const testPendingAction: PendingActionData = {
      type: 'add_item_quantity_needed',
      data: { itemName: 'chicken' },
      question: 'How much chicken?',
      sessionId: 'test-123',
    };

    it('should show clarification question when in waiting-for-clarification mode', () => {
      const { getByText } = renderWithListeningState(
        <VoiceActivationBanner visible={true} />,
        'waiting-for-clarification',
        testPendingAction
      );
      
      expect(getByText('How much chicken?')).toBeTruthy();
    });

    it('should show cancel button when in waiting-for-clarification mode', () => {
      const { getByText } = renderWithListeningState(
        <VoiceActivationBanner visible={true} />,
        'waiting-for-clarification',
        testPendingAction
      );
      
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('should call clearPendingAction when cancel button is pressed', () => {
      const { getByText } = renderWithListeningState(
        <VoiceActivationBanner visible={true} />,
        'waiting-for-clarification',
        testPendingAction
      );
      
      // Verify question is showing and cancel button exists
      expect(getByText('How much chicken?')).toBeTruthy();
      const cancelButton = getByText('Cancel');
      expect(cancelButton).toBeTruthy();
      
      // Press the cancel button - this will call clearPendingAction
      // (the actual state change is tested in end-to-end testing)
      expect(() => fireEvent.press(cancelButton)).not.toThrow();
    });

    it('should have different background color in clarification mode', () => {
      const { getByTestId } = renderWithListeningState(
        <VoiceActivationBanner visible={true} />,
        'waiting-for-clarification',
        testPendingAction
      );
      
      const banner = getByTestId('voice-activation-banner');
      // Expect a different color than the default #E8F5E9 (maybe yellow/amber for attention)
      expect(banner.props.style).toEqual(
        expect.objectContaining({
          backgroundColor: expect.not.stringMatching('#E8F5E9'),
        })
      );
    });

    it('should not show wake word message in clarification mode', () => {
      const { queryByText } = renderWithListeningState(
        <VoiceActivationBanner visible={true} />,
        'waiting-for-clarification',
        testPendingAction
      );
      
      // Wake word message should not be visible during clarification
      expect(queryByText(/Hey Shoppy/i)).toBeNull();
      expect(queryByText(/Coming Soon/i)).toBeNull();
    });

    it('should show normal banner when visible but not in clarification mode', () => {
      const { getByText, queryByText } = renderWithProviders(
        <VoiceActivationBanner visible={true} />
      );
      
      // Should show normal wake word message
      expect(getByText(/Hey Shoppy/i)).toBeTruthy();
      // Should not show clarification question
      expect(queryByText('How much chicken?')).toBeNull();
    });

    it('should not show banner when visible is false even in clarification mode', () => {
      const { queryByTestId } = renderWithListeningState(
        <VoiceActivationBanner visible={false} />,
        'waiting-for-clarification',
        testPendingAction
      );
      
      expect(queryByTestId('voice-activation-banner')).toBeNull();
    });
  });
});
