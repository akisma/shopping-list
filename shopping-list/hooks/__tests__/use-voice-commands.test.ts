/**
 * useVoiceCommands Hook Tests (TDD - RED Phase)
 * Testing voice command processing with TTS integration
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useVoiceCommands } from '../use-voice-commands';
import { VoiceCommandService } from '@/services/voice-command-service';
import * as Speech from 'expo-speech';

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock expo-speech
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn(() => Promise.resolve(false)),
  getAvailableVoicesAsync: jest.fn(() => Promise.resolve([])),
}));

// Mock AsyncStorage for TTS hook
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  },
}));

// Create shared mock functions for the service
let mockSendVoiceCommand = jest.fn();
let mockDeleteSession = jest.fn();

// Mock VoiceCommandService
jest.mock('@/services/voice-command-service', () => ({
  VoiceCommandService: jest.fn().mockImplementation(() => ({
    get sendVoiceCommand() { return mockSendVoiceCommand; },
    get deleteSession() { return mockDeleteSession; },
  })),
}));

describe('useVoiceCommands', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create fresh mocks for each test
    mockSendVoiceCommand = jest.fn();
    mockDeleteSession = jest.fn();
    
    // Reset Alert mock
    (Alert.alert as jest.Mock).mockClear();
  });

  describe('TTS Integration - Success Cases', () => {
    it('should speak success message when TTS enabled', async () => {
      mockSendVoiceCommand.mockResolvedValue({
        success: true,
        action: 'create_list',
        data: { listId: '123', listName: 'Groceries' },
        ttsText: "I've created a list called Groceries",
        sessionId: 'session-123',
      });

      const { result } = renderHook(() => useVoiceCommands());

      await act(async () => {
        await result.current.handleVoiceCommand('audio-blob-data');
      });

      // Should speak the success message
      await waitFor(() => {
        expect(Speech.speak).toHaveBeenCalledWith(
          "I've created a list called Groceries",
          expect.objectContaining({
            rate: 0.9,
            language: 'en-US',
          })
        );
      });

      // Should NOT show Alert when TTS is enabled
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('should speak clarification message when TTS enabled', async () => {
      mockSendVoiceCommand.mockResolvedValue({
        success: false,
        action: 'clarification',
        ttsText: 'Which list would you like to add apples to?',
        sessionId: 'session-123',
      });

      const { result } = renderHook(() => useVoiceCommands());

      await act(async () => {
        await result.current.handleVoiceCommand('audio-blob-data');
      });

      // Should speak the clarification
      await waitFor(() => {
        expect(Speech.speak).toHaveBeenCalledWith(
          'Which list would you like to add apples to?',
          expect.objectContaining({
            rate: 0.9,
            language: 'en-US',
          })
        );
      });

      expect(Alert.alert).not.toHaveBeenCalled();
    });
  });

  describe('TTS Integration - Error Cases', () => {
    it('should speak error message when command fails', async () => {
      mockSendVoiceCommand.mockResolvedValue({
        success: false,
        action: 'error',
        error: 'Failed to create list',
        ttsText: 'Sorry, I could not create that list',
        sessionId: 'session-123',
      });

      const { result } = renderHook(() => useVoiceCommands());

      await act(async () => {
        await result.current.handleVoiceCommand('audio-blob-data');
      });

      await waitFor(() => {
        expect(Speech.speak).toHaveBeenCalledWith(
          'Sorry, I could not create that list',
          expect.objectContaining({
            rate: 0.9,
            language: 'en-US',
          })
        );
      });

      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('should speak error message on exception', async () => {
      mockSendVoiceCommand.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useVoiceCommands());

      await act(async () => {
        await result.current.handleVoiceCommand('audio-blob-data');
      });

      await waitFor(() => {
        expect(Speech.speak).toHaveBeenCalledWith(
          'Network error',
          expect.objectContaining({
            rate: 0.9,
            language: 'en-US',
          })
        );
      });

      expect(Alert.alert).not.toHaveBeenCalled();
    });
  });

  describe('TTS Disabled Behavior', () => {
    it('should show Alert when TTS is disabled', async () => {
      mockSendVoiceCommand.mockResolvedValue({
        success: true,
        action: 'create_list',
        data: { listId: '123', listName: 'Groceries' },
        ttsText: "I've created a list called Groceries",
        sessionId: 'session-123',
      });

      const { result } = renderHook(() => useVoiceCommands());

      // Disable TTS first
      await act(async () => {
        await result.current.setTtsEnabled(false);
      });

      await act(async () => {
        await result.current.handleVoiceCommand('audio-blob-data');
      });

      // Should NOT speak when disabled
      expect(Speech.speak).not.toHaveBeenCalled();

      // Should fall back to Alert
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Voice Command',
          "I've created a list called Groceries",
          [{ text: 'OK' }]
        );
      });
    });

    it('should show Alert for errors when TTS disabled', async () => {
      mockSendVoiceCommand.mockResolvedValue({
        success: false,
        action: 'error',
        error: 'Failed to create list',
        ttsText: 'Sorry, I could not create that list',
        sessionId: 'session-123',
      });

      const { result } = renderHook(() => useVoiceCommands());

      // Disable TTS
      await act(async () => {
        await result.current.setTtsEnabled(false);
      });

      await act(async () => {
        await result.current.handleVoiceCommand('audio-blob-data');
      });

      expect(Speech.speak).not.toHaveBeenCalled();
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Sorry, I could not create that list',
          [{ text: 'OK' }]
        );
      });
    });
  });

  describe('TTS State Management', () => {
    it('should expose isTtsEnabled state', () => {
      const { result } = renderHook(() => useVoiceCommands());
      
      expect(typeof result.current.isTtsEnabled).toBe('boolean');
    });

    it('should expose setTtsEnabled function', () => {
      const { result } = renderHook(() => useVoiceCommands());
      
      expect(typeof result.current.setTtsEnabled).toBe('function');
    });

    it('should update TTS enabled state', async () => {
      const { result } = renderHook(() => useVoiceCommands());

      expect(result.current.isTtsEnabled).toBe(true);

      await act(async () => {
        await result.current.setTtsEnabled(false);
      });

      expect(result.current.isTtsEnabled).toBe(false);

      await act(async () => {
        await result.current.setTtsEnabled(true);
      });

      expect(result.current.isTtsEnabled).toBe(true);
    });
  });

  describe('Existing Functionality', () => {
    it('should maintain processing state', async () => {
      mockSendVoiceCommand.mockResolvedValue({
        success: true,
        action: 'create_list',
        ttsText: 'Done',
        sessionId: 'session-123',
      });

      const { result } = renderHook(() => useVoiceCommands());

      // Should start as not processing
      expect(result.current.processing).toBe(false);

      // Execute command
      await act(async () => {
        await result.current.handleVoiceCommand('audio-blob-data');
      });

      // Should not be processing after completion
      expect(result.current.processing).toBe(false);
    });

    it('should return action data for caller', async () => {
      mockSendVoiceCommand.mockResolvedValue({
        success: true,
        action: 'create_list',
        data: { listId: '123', listName: 'Groceries' },
        ttsText: "I've created a list called Groceries",
        sessionId: 'session-123',
      });

      const { result } = renderHook(() => useVoiceCommands());

      let response;
      await act(async () => {
        response = await result.current.handleVoiceCommand('audio-blob-data');
      });

      expect(response).toEqual({
        success: true,
        action: 'create_list',
        data: { listId: '123', listName: 'Groceries' },
        ttsText: "I've created a list called Groceries",
      });
    });

    it('should maintain session context', async () => {
      mockSendVoiceCommand.mockResolvedValue({
        success: true,
        action: 'create_list',
        ttsText: 'Done',
        sessionId: 'session-123',
      });

      const { result } = renderHook(() => useVoiceCommands());

      await act(async () => {
        await result.current.handleVoiceCommand('audio-blob-data');
      });

      expect(mockSendVoiceCommand).toHaveBeenCalledWith('audio-blob-data', undefined);

      // Second call should include session ID
      await act(async () => {
        await result.current.handleVoiceCommand('more-audio');
      });

      expect(mockSendVoiceCommand).toHaveBeenCalledWith('more-audio', 'session-123');
    });
  });
});
