import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { VoiceButton } from '../voice-button';

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
      const { getByTestId } = render(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      expect(getByTestId('voice-button')).toBeTruthy();
    });

    it('should be disabled when disabled prop is true', () => {
      const { getByTestId } = render(<VoiceButton onVoiceCommand={mockOnVoiceCommand} disabled />);
      const button = getByTestId('voice-button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('should show recording indicator when recording', () => {
      // Update mock values for recording state
      mockHookValues.isRecording = true;
      mockHookValues.recordingDuration = 2;

      const { getByTestId } = render(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      expect(getByTestId('recording-indicator')).toBeTruthy();
    });
  });

  describe('permission handling', () => {
    it('should request permission on first press if not granted', async () => {
      mockHookValues.hasPermission = false;

      const { getByTestId } = render(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      const button = getByTestId('voice-button');

      fireEvent(button, 'pressIn');

      await waitFor(() => {
        expect(mockRequestPermission).toHaveBeenCalled();
      });
    });

    it('should show error message when permission denied', async () => {
      mockHookValues.hasPermission = false;
      mockRequestPermission.mockResolvedValue(false);

      const { getByTestId, findByText } = render(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      const button = getByTestId('voice-button');

      fireEvent(button, 'pressIn');

      await findByText(/permission/i);
    });
  });

  describe('press and hold gesture', () => {
    it('should start recording on pressIn', async () => {
      const { getByTestId } = render(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      const button = getByTestId('voice-button');

      fireEvent(button, 'pressIn');

      await waitFor(() => {
        expect(mockStartRecording).toHaveBeenCalled();
      });
    });

    it('should stop recording and send command on pressOut', async () => {
      // Start with recording active
      mockHookValues.isRecording = true;
      
      const { getByTestId } = render(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      const button = getByTestId('voice-button');

      fireEvent(button, 'pressOut');

      await waitFor(() => {
        expect(mockStopRecording).toHaveBeenCalled();
        expect(mockOnVoiceCommand).toHaveBeenCalledWith('base64AudioData');
      });
    });

    it('should cancel recording if drag gesture moves too far', async () => {
      mockHookValues.isRecording = true;
      
      const { getByTestId } = render(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
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

      const { getByText } = render(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      expect(getByText('0:05')).toBeTruthy();
    });

    it('should disable button while processing', () => {
      const { getByTestId } = render(<VoiceButton onVoiceCommand={mockOnVoiceCommand} processing />);
      const button = getByTestId('voice-button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('should show processing indicator when processing prop is true', () => {
      const { getByTestId } = render(<VoiceButton onVoiceCommand={mockOnVoiceCommand} processing />);
      expect(getByTestId('processing-indicator')).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should display error message from hook', () => {
      mockHookValues.error = 'Recording failed';

      const { getByText } = render(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      expect(getByText('Recording failed')).toBeTruthy();
    });

    it('should clear error when user taps error message', () => {
      mockHookValues.error = 'Recording failed';

      const { getByText } = render(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      const errorMessage = getByText('Recording failed');
      
      fireEvent.press(errorMessage);
      
      expect(mockClearError).toHaveBeenCalled();
    });

    it('should not send command if stopRecording returns null', async () => {
      mockStopRecording.mockResolvedValue(null);
      // Start with recording active
      mockHookValues.isRecording = true;

      const { getByTestId } = render(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
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
      const { getByTestId } = render(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      const button = getByTestId('voice-button');
      expect(button.props.accessibilityLabel.toLowerCase()).toContain('voice');
    });

    it('should have proper accessibility hint for press and hold', () => {
      const { getByTestId } = render(<VoiceButton onVoiceCommand={mockOnVoiceCommand} />);
      const button = getByTestId('voice-button');
      expect(button.props.accessibilityHint).toContain('hold');
    });
  });
});
