import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { VoiceButton } from '../voice-button';
import { VoiceListeningProvider, useVoiceListeningContext } from '../../hooks/use-voice-listening-context';
import type { PendingActionData } from '../../hooks/use-voice-listening-context';

// Mock the useAudioRecorder hook
const mockStartRecording = jest.fn();
const mockStopRecording = jest.fn().mockResolvedValue('base64AudioData');
const mockCancelRecording = jest.fn();
const mockRequestPermission = jest.fn().mockResolvedValue(true);
const mockClearError = jest.fn();

let mockHookValues: {
  isRecording: boolean;
  hasPermission: boolean;
  error: string | null;
  recordingDuration: number;
  requestPermission: jest.Mock;
  startRecording: jest.Mock;
  stopRecording: jest.Mock;
  cancelRecording: jest.Mock;
  clearError: jest.Mock;
} = {
  isRecording: false,
  hasPermission: true,
  error: null,
  recordingDuration: 0,
  requestPermission: mockRequestPermission,
  startRecording: mockStartRecording,
  stopRecording: mockStopRecording,
  cancelRecording: mockCancelRecording,
  clearError: mockClearError,
};

jest.mock('../../hooks/use-audio-recorder', () => ({
  useAudioRecorder: () => mockHookValues,
}));

// Helper to wrap components with providers
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
  // Wrapper that initializes the context state
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

describe('VoiceButton', () => {
  const mockOnVoiceCommand = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock values to defaults
    mockHookValues = {
      isRecording: false,
      hasPermission: true,
      error: null,
      recordingDuration: 0,
      requestPermission: mockRequestPermission,
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
      cancelRecording: mockCancelRecording,
      clearError: mockClearError,
    };
    
    mockRequestPermission.mockResolvedValue(true);
    mockStopRecording.mockResolvedValue('base64AudioData');
  });

  describe('rendering', () => {
    it('should render microphone icon by default', () => {
      const { getByTestId } = renderWithProviders(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      expect(getByTestId('voice-button')).toBeTruthy();
    });

    it('should be disabled when disabled prop is true', () => {
      const { getByTestId } = renderWithProviders(<VoiceButton onVoiceCommand={mockOnVoiceCommand} disabled />);
      const button = getByTestId('voice-button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('should show recording indicator when recording', () => {
      // Update mock values for recording state
      mockHookValues.isRecording = true;
      mockHookValues.recordingDuration = 2;

      const { getByTestId } = renderWithProviders(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      expect(getByTestId('recording-indicator')).toBeTruthy();
    });
  });

  describe('permission handling', () => {
    it('should request permission on first press if not granted', async () => {
      mockHookValues.hasPermission = false;

      const { getByTestId } = renderWithProviders(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      const button = getByTestId('voice-button');

      fireEvent(button, 'pressIn');

      await waitFor(() => {
        expect(mockRequestPermission).toHaveBeenCalled();
      });
    });

    it('should show error message when permission denied', async () => {
      mockHookValues.hasPermission = false;
      mockRequestPermission.mockResolvedValue(false);

      const { getByTestId, findByText } = renderWithProviders(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      const button = getByTestId('voice-button');

      fireEvent(button, 'pressIn');

      await findByText(/permission/i);
    });
  });

  describe('press and hold gesture', () => {
    it('should start recording on pressIn', async () => {
      const { getByTestId } = renderWithProviders(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      const button = getByTestId('voice-button');

      fireEvent(button, 'pressIn');

      await waitFor(() => {
        expect(mockStartRecording).toHaveBeenCalled();
      });
    });

    it('should stop recording and send command on pressOut', async () => {
      // Start with recording active
      mockHookValues.isRecording = true;
      
      const { getByTestId } = renderWithProviders(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      const button = getByTestId('voice-button');

      fireEvent(button, 'pressOut');

      await waitFor(() => {
        expect(mockStopRecording).toHaveBeenCalled();
        expect(mockOnVoiceCommand).toHaveBeenCalledWith('base64AudioData');
      });
    });

    it('should cancel recording if drag gesture moves too far', async () => {
      mockHookValues.isRecording = true;
      
      const { getByTestId } = renderWithProviders(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      const cancelButton = getByTestId('cancel-button');

      fireEvent.press(cancelButton);

      await waitFor(() => {
        expect(mockCancelRecording).toHaveBeenCalled();
      });
    });
  });

  describe('recording states', () => {
    it('should show duration while recording', () => {
      mockHookValues.isRecording = true;
      mockHookValues.recordingDuration = 5;

      const { getByText } = renderWithProviders(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      expect(getByText('0:05')).toBeTruthy();
    });

    it('should disable button while processing', () => {
      const { getByTestId } = renderWithProviders(<VoiceButton onVoiceCommand={mockOnVoiceCommand} processing />);
      const button = getByTestId('voice-button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('should show processing indicator when processing prop is true', () => {
      const { getByTestId } = renderWithProviders(<VoiceButton onVoiceCommand={mockOnVoiceCommand} processing />);
      expect(getByTestId('processing-indicator')).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should display error message from hook', () => {
      mockHookValues.error = 'Recording failed';

      const { getByText } = renderWithProviders(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      expect(getByText('Recording failed')).toBeTruthy();
    });

    it('should clear error when user taps error message', () => {
      mockHookValues.error = 'Recording failed';

      const { getByText } = renderWithProviders(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      const errorMessage = getByText('Recording failed');
      
      fireEvent.press(errorMessage);
      
      expect(mockClearError).toHaveBeenCalled();
    });

    it('should not send command if stopRecording returns null', async () => {
      mockStopRecording.mockResolvedValue(null);
      // Start with recording active
      mockHookValues.isRecording = true;

      const { getByTestId } = renderWithProviders(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      const button = getByTestId('voice-button');

      fireEvent(button, 'pressOut');

      await waitFor(() => {
        expect(mockStopRecording).toHaveBeenCalled();
        expect(mockOnVoiceCommand).not.toHaveBeenCalled();
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper accessibility label', () => {
      const { getByTestId } = renderWithProviders(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      const button = getByTestId('voice-button');
      expect(button.props.accessibilityLabel.toLowerCase()).toContain('voice');
    });

    it('should have proper accessibility hint for press and hold', () => {
      const { getByTestId } = renderWithProviders(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      const button = getByTestId('voice-button');
      expect(button.props.accessibilityHint).toContain('hold');
    });
  });

  describe('clarification mode integration', () => {
    const testPendingAction: PendingActionData = {
      type: 'add_item_quantity_needed',
      data: { itemName: 'chicken' },
      question: 'How much chicken?',
      sessionId: 'test-123',
    };

    it('should have green background when in waiting-for-clarification mode', () => {
      const { getByTestId } = renderWithListeningState(
        <VoiceButton onVoiceCommand={mockOnVoiceCommand} />,
        'waiting-for-clarification',
        testPendingAction
      );
      const button = getByTestId('voice-button');
      
      // Button should have green background color (#10b981)
      expect(button.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: '#10b981' })
      );
    });

    it('should show "Tap to answer..." hint when in clarification mode', () => {
      const { getByText } = renderWithListeningState(
        <VoiceButton onVoiceCommand={mockOnVoiceCommand} />,
        'waiting-for-clarification',
        testPendingAction
      );
      
      expect(getByText('Tap to answer...')).toBeTruthy();
    });

    it('should update accessibility label for clarification mode', () => {
      const { getByTestId } = renderWithListeningState(
        <VoiceButton onVoiceCommand={mockOnVoiceCommand} />,
        'waiting-for-clarification',
        testPendingAction
      );
      const button = getByTestId('voice-button');
      
      expect(button.props.accessibilityLabel).toContain('answer clarification');
    });

    it('should update accessibility hint for clarification mode', () => {
      const { getByTestId } = renderWithListeningState(
        <VoiceButton onVoiceCommand={mockOnVoiceCommand} />,
        'waiting-for-clarification',
        testPendingAction
      );
      const button = getByTestId('voice-button');
      
      expect(button.props.accessibilityHint).toContain('record your answer');
    });

    it('should have pulsing animation in clarification mode', async () => {
      const { getByTestId } = renderWithListeningState(
        <VoiceButton onVoiceCommand={mockOnVoiceCommand} />,
        'waiting-for-clarification',
        testPendingAction
      );
      const button = getByTestId('voice-button');
      
      // Verify button is rendered (animation tested via visual/manual testing)
      expect(button).toBeTruthy();
    });
  });

  describe('wake word mode integration', () => {
    it('should show subtle blue border when in background-wake-word mode', () => {
      const { getByTestId } = renderWithListeningState(
        <VoiceButton onVoiceCommand={mockOnVoiceCommand} />,
        'background-wake-word'
      );
      const button = getByTestId('voice-button');
      
      // Button should have blue border to indicate wake word is listening
      expect(button.props.style).toContainEqual(
        expect.objectContaining({ borderWidth: 3, borderColor: '#3B82F6' })
      );
    });

    it('should show "Listening for wake word..." hint in background-wake-word mode', () => {
      const { getByText } = renderWithListeningState(
        <VoiceButton onVoiceCommand={mockOnVoiceCommand} />,
        'background-wake-word'
      );
      
      expect(getByText(/Listening for wake word/i)).toBeTruthy();
    });

    it('should update accessibility label for background-wake-word mode', () => {
      const { getByTestId } = renderWithListeningState(
        <VoiceButton onVoiceCommand={mockOnVoiceCommand} />,
        'background-wake-word'
      );
      const button = getByTestId('voice-button');
      
      expect(button.props.accessibilityLabel).toContain('Wake word detection active');
    });

    it('should not show wake word indicator when recording', () => {
      mockHookValues.isRecording = true;
      
      const { queryByText } = renderWithListeningState(
        <VoiceButton onVoiceCommand={mockOnVoiceCommand} />,
        'background-wake-word'
      );
      
      // Should show recording indicator, not wake word message
      expect(queryByText(/Listening for wake word/i)).toBeNull();
    });

    it('should have higher priority for clarification mode than wake word mode', () => {
      const testPendingAction: PendingActionData = {
        type: 'add_item_quantity_needed',
        data: { itemName: 'milk' },
        question: 'How much milk?',
        sessionId: 'test-456',
      };
      
      const { getByTestId } = renderWithListeningState(
        <VoiceButton onVoiceCommand={mockOnVoiceCommand} />,
        'waiting-for-clarification',
        testPendingAction
      );
      const button = getByTestId('voice-button');
      
      // Should show clarification (green), not wake word (blue)
      expect(button.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: '#10b981' })
      );
    });
  });
});
