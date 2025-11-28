/**
 * useTextToSpeech Hook Tests (TDD - RED Phase)
 * Testing text-to-speech functionality with expo-speech
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTextToSpeech } from './use-text-to-speech';

// Mock expo-speech
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn(() => Promise.resolve(false)),
  getAvailableVoicesAsync: jest.fn(() => Promise.resolve([])),
}));

// Mock AsyncStorage
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

// Mocks are already declared in jest.setup.js

describe('useTextToSpeech', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with isSpeaking false', () => {
      const { result } = renderHook(() => useTextToSpeech());
      
      expect(result.current.isSpeaking).toBe(false);
    });

    it('should initialize with TTS enabled by default', () => {
      const { result } = renderHook(() => useTextToSpeech());
      
      expect(result.current.isTtsEnabled).toBe(true);
    });
  });

  describe('speak() function', () => {
    it('should call Speech.speak with text and options', async () => {
      const { result } = renderHook(() => useTextToSpeech());
      
      await act(async () => {
        await result.current.speak('Hello world');
      });
      
      expect(Speech.speak).toHaveBeenCalledWith('Hello world', expect.objectContaining({
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
      }));
    });

    it('should set isSpeaking to true while speaking', async () => {
      const { result } = renderHook(() => useTextToSpeech());
      
      act(() => {
        result.current.speak('Hello world');
      });
      
      await waitFor(() => {
        expect(result.current.isSpeaking).toBe(true);
      });
    });

    it('should set isSpeaking to false when speech completes', async () => {
      let onDoneCallback: (() => void) | undefined;
      
      (Speech.speak as jest.Mock).mockImplementation((text, options) => {
        onDoneCallback = options?.onDone;
        return Promise.resolve();
      });
      
      const { result } = renderHook(() => useTextToSpeech());
      
      await act(async () => {
        await result.current.speak('Hello world');
      });
      
      expect(result.current.isSpeaking).toBe(true);
      
      // Simulate speech completion
      act(() => {
        onDoneCallback?.();
      });
      
      expect(result.current.isSpeaking).toBe(false);
    });

    it('should not speak if TTS is disabled', async () => {
      const { result } = renderHook(() => useTextToSpeech());
      
      // Disable TTS
      await act(async () => {
        await result.current.setTtsEnabled(false);
      });
      
      expect(result.current.isTtsEnabled).toBe(false);
      
      // Try to speak
      await act(async () => {
        await result.current.speak('Hello world');
      });
      
      expect(Speech.speak).not.toHaveBeenCalled();
      expect(result.current.isSpeaking).toBe(false);
    });

    it('should stop ongoing speech before starting new speech', async () => {
      const { result } = renderHook(() => useTextToSpeech());
      
      // Start first speech
      await act(async () => {
        await result.current.speak('First message');
      });
      
      expect(Speech.speak).toHaveBeenCalledTimes(1);
      
      // Start second speech (should stop first)
      await act(async () => {
        await result.current.speak('Second message');
      });
      
      expect(Speech.stop).toHaveBeenCalled();
      expect(Speech.speak).toHaveBeenCalledTimes(2);
    });

    it('should handle speech errors gracefully', async () => {
      let onErrorCallback: (() => void) | undefined;
      
      (Speech.speak as jest.Mock).mockImplementation((text, options) => {
        onErrorCallback = options?.onError;
        return Promise.resolve();
      });
      
      const { result } = renderHook(() => useTextToSpeech());
      
      await act(async () => {
        await result.current.speak('Hello world');
      });
      
      expect(result.current.isSpeaking).toBe(true);
      
      // Simulate error
      act(() => {
        onErrorCallback?.();
      });
      
      expect(result.current.isSpeaking).toBe(false);
    });
  });

  describe('stop() function', () => {
    it('should call Speech.stop', () => {
      const { result } = renderHook(() => useTextToSpeech());
      
      act(() => {
        result.current.stop();
      });
      
      expect(Speech.stop).toHaveBeenCalled();
    });

    it('should set isSpeaking to false', async () => {
      const { result } = renderHook(() => useTextToSpeech());
      
      // Start speaking
      await act(async () => {
        await result.current.speak('Hello world');
      });
      
      expect(result.current.isSpeaking).toBe(true);
      
      // Stop speaking
      act(() => {
        result.current.stop();
      });
      
      expect(result.current.isSpeaking).toBe(false);
    });
  });

  describe('setTtsEnabled() function', () => {
    it('should update isTtsEnabled state', async () => {
      const { result } = renderHook(() => useTextToSpeech());
      
      expect(result.current.isTtsEnabled).toBe(true);
      
      await act(async () => {
        await result.current.setTtsEnabled(false);
      });
      
      expect(result.current.isTtsEnabled).toBe(false);
      
      // Can re-enable
      await act(async () => {
        await result.current.setTtsEnabled(true);
      });
      
      expect(result.current.isTtsEnabled).toBe(true);
    });

    it('should stop ongoing speech when disabling TTS', async () => {
      const { result } = renderHook(() => useTextToSpeech());
      
      // Start speaking
      await act(async () => {
        await result.current.speak('Hello world');
      });
      
      expect(result.current.isSpeaking).toBe(true);
      
      // Disable TTS
      await act(async () => {
        await result.current.setTtsEnabled(false);
      });
      
      expect(Speech.stop).toHaveBeenCalled();
    });
  });

  describe('Speech Rate Configuration', () => {
    it('should use rate of 0.9 for kitchen clarity', async () => {
      const { result } = renderHook(() => useTextToSpeech());
      
      await act(async () => {
        await result.current.speak('Test message');
      });
      
      expect(Speech.speak).toHaveBeenCalledWith(
        'Test message',
        expect.objectContaining({
          rate: 0.9, // Slightly slower for clarity in kitchen
        })
      );
    });

    it('should use en-US language', async () => {
      const { result } = renderHook(() => useTextToSpeech());
      
      await act(async () => {
        await result.current.speak('Test message');
      });
      
      expect(Speech.speak).toHaveBeenCalledWith(
        'Test message',
        expect.objectContaining({
          language: 'en-US',
        })
      );
    });
  });
});
