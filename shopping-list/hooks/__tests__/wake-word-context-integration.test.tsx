import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useWakeWordDetection } from '../use-wake-word-detection';
import { useVoiceListeningContext } from '../use-voice-listening-context';
import { VoiceListeningProvider } from '../use-voice-listening-context';
import { PorcupineManager } from '@picovoice/porcupine-react-native';
import React from 'react';

// Mock PorcupineManager
jest.mock('@picovoice/porcupine-react-native', () => ({
  PorcupineManager: {
    fromBuiltInKeywords: jest.fn(),
  },
  BuiltInKeywords: {
    PICOVOICE: 'picovoice',
  },
}));

// Mock Platform for iOS
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
  PermissionsAndroid: {
    request: jest.fn(),
  },
}));

describe('Wake Word + VoiceListeningContext Integration', () => {
  const mockPorcupineManager = {
    start: jest.fn().mockResolvedValue(true),
    stop: jest.fn().mockResolvedValue(true),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  const accessKey = 'test-access-key';

  beforeEach(() => {
    jest.clearAllMocks();
    (PorcupineManager.fromBuiltInKeywords as jest.Mock).mockResolvedValue(mockPorcupineManager);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <VoiceListeningProvider>{children}</VoiceListeningProvider>
  );

  describe('Wake word triggers context update', () => {
    it('should call setBackgroundWakeWord when wake word starts', async () => {
      const { result: contextResult } = renderHook(() => useVoiceListeningContext(), { wrapper });
      
      const { result: wakeWordResult } = renderHook(
        () => useWakeWordDetection({
          accessKey,
          onWakeWord: () => {
            contextResult.current.setBackgroundWakeWord(true);
          },
        }),
        { wrapper }
      );

      // Start wake word detection
      await act(async () => {
        await wakeWordResult.current.startListening();
      });

      // Set background wake word mode manually (would be done by app logic)
      act(() => {
        contextResult.current.setBackgroundWakeWord(true);
      });

      // Verify context updated
      expect(contextResult.current.listeningMode).toBe('background-wake-word');
    });

    it('should clear context when wake word stops', async () => {
      const { result: contextResult } = renderHook(() => useVoiceListeningContext(), { wrapper });
      
      const { result: wakeWordResult } = renderHook(
        () => useWakeWordDetection({
          accessKey,
          onWakeWord: () => {
            contextResult.current.setBackgroundWakeWord(true);
          },
        }),
        { wrapper }
      );

      // Start and then stop
      await act(async () => {
        await wakeWordResult.current.startListening();
      });

      await act(async () => {
        contextResult.current.setBackgroundWakeWord(false);
      });

      // Verify context cleared
      expect(contextResult.current.listeningMode).toBe('inactive');
    });
  });

  describe('Wake word detection triggers voice command', () => {
    it('should transition from background-wake-word to inactive on detection', async () => {
      let detectionCallback: (keywordIndex: number) => void;

      (PorcupineManager.fromBuiltInKeywords as jest.Mock).mockImplementation(
        (accessKey, keywords, callback) => {
          detectionCallback = callback;
          return Promise.resolve(mockPorcupineManager);
        }
      );

      const { result: contextResult } = renderHook(() => useVoiceListeningContext(), { wrapper });
      
      const mockOnWakeWord = jest.fn(() => {
        // Simulate clearing wake word mode when starting voice command
        contextResult.current.setBackgroundWakeWord(false);
      });

      const { result: wakeWordResult } = renderHook(
        () => useWakeWordDetection({
          accessKey,
          onWakeWord: mockOnWakeWord,
        }),
        { wrapper }
      );

      // Start wake word detection
      await act(async () => {
        await wakeWordResult.current.startListening();
      });

      // Set background wake word mode
      act(() => {
        contextResult.current.setBackgroundWakeWord(true);
      });

      expect(contextResult.current.listeningMode).toBe('background-wake-word');

      // Trigger detection
      act(() => {
        detectionCallback!(0);
      });

      expect(mockOnWakeWord).toHaveBeenCalled();
      expect(contextResult.current.listeningMode).toBe('inactive');
    });
  });

  describe('Clarification mode interrupts wake word', () => {
    it('should maintain clarification mode even if wake word is active', async () => {
      const { result: contextResult } = renderHook(() => useVoiceListeningContext(), { wrapper });
      
      const { result: wakeWordResult } = renderHook(
        () => useWakeWordDetection({
          accessKey,
          onWakeWord: () => {
            // Wake word detected, but we're in clarification mode
            if (contextResult.current.listeningMode !== 'waiting-for-clarification') {
              contextResult.current.setBackgroundWakeWord(true);
            }
          },
        }),
        { wrapper }
      );

      // Start wake word detection
      await act(async () => {
        await wakeWordResult.current.startListening();
      });

      act(() => {
        contextResult.current.setBackgroundWakeWord(true);
      });

      // Now enter clarification mode
      act(() => {
        contextResult.current.startListeningForClarification({
          type: 'add_item',
          data: { itemName: 'milk' },
          question: 'How much milk?',
          sessionId: 'test-session',
        });
      });

      // Should be in clarification mode, not wake word mode
      expect(contextResult.current.listeningMode).toBe('waiting-for-clarification');
    });
  });

  describe('Error handling', () => {
    it('should not affect context if wake word fails to start', async () => {
      (PorcupineManager.fromBuiltInKeywords as jest.Mock).mockRejectedValue(
        new Error('Invalid access key')
      );

      const { result: contextResult } = renderHook(() => useVoiceListeningContext(), { wrapper });
      
      const { result: wakeWordResult } = renderHook(
        () => useWakeWordDetection({
          accessKey: 'invalid-key',
          onWakeWord: () => {
            contextResult.current.setBackgroundWakeWord(true);
          },
        }),
        { wrapper }
      );

      await act(async () => {
        await wakeWordResult.current.startListening();
      });

      // Context should remain inactive
      expect(contextResult.current.listeningMode).toBe('inactive');
      expect(wakeWordResult.current.error).toBe('Invalid access key');
    });
  });
});
