import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useWakeWordDetection } from '../use-wake-word-detection';
import { PorcupineManager, BuiltInKeywords } from '@picovoice/porcupine-react-native';
import { PermissionsAndroid, Platform } from 'react-native';

// Mock PorcupineManager
jest.mock('@picovoice/porcupine-react-native', () => ({
  PorcupineManager: {
    fromBuiltInKeywords: jest.fn(),
  },
  BuiltInKeywords: {
    PICOVOICE: 'picovoice',
    BUMBLEBEE: 'bumblebee',
  },
}));

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
  PermissionsAndroid: {
    PERMISSIONS: {
      RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
    },
    request: jest.fn(),
  },
}));

describe('useWakeWordDetection', () => {
  const mockPorcupineManager = {
    start: jest.fn().mockResolvedValue(true),
    stop: jest.fn().mockResolvedValue(true),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  const mockOnWakeWord = jest.fn();
  const accessKey = 'test-access-key';

  beforeEach(() => {
    jest.clearAllMocks();
    (PorcupineManager.fromBuiltInKeywords as jest.Mock).mockResolvedValue(mockPorcupineManager);
  });

  describe('Initialization', () => {
    it('should initialize with isListening false and no error', () => {
      const { result } = renderHook(() =>
        useWakeWordDetection({
          accessKey,
          onWakeWord: mockOnWakeWord,
        })
      );

      expect(result.current.isListening).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should not start listening automatically', () => {
      renderHook(() =>
        useWakeWordDetection({
          accessKey,
          onWakeWord: mockOnWakeWord,
        })
      );

      expect(PorcupineManager.fromBuiltInKeywords).not.toHaveBeenCalled();
    });
  });

  describe('Permission handling', () => {
    it('should request permission on Android when starting', async () => {
      (Platform.OS as any) = 'android';
      (PermissionsAndroid.request as jest.Mock).mockResolvedValue(
        PermissionsAndroid.RESULTS.GRANTED
      );

      const { result } = renderHook(() =>
        useWakeWordDetection({
          accessKey,
          onWakeWord: mockOnWakeWord,
        })
      );

      await act(async () => {
        await result.current.startListening();
      });

      expect(PermissionsAndroid.request).toHaveBeenCalledWith(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
    });

    it('should set error when Android permission denied', async () => {
      (Platform.OS as any) = 'android';
      (PermissionsAndroid.request as jest.Mock).mockResolvedValue(
        PermissionsAndroid.RESULTS.DENIED
      );

      const { result } = renderHook(() =>
        useWakeWordDetection({
          accessKey,
          onWakeWord: mockOnWakeWord,
        })
      );

      await act(async () => {
        await result.current.startListening();
      });

      expect(result.current.isListening).toBe(false);
      expect(result.current.error).toBe('Microphone permission denied');
    });

    it('should not request permission on iOS', async () => {
      (Platform.OS as any) = 'ios';

      const { result } = renderHook(() =>
        useWakeWordDetection({
          accessKey,
          onWakeWord: mockOnWakeWord,
        })
      );

      await act(async () => {
        await result.current.startListening();
      });

      expect(PermissionsAndroid.request).not.toHaveBeenCalled();
    });
  });

  describe('Start listening', () => {
    it('should initialize PorcupineManager with default keyword PICOVOICE', async () => {
      const { result } = renderHook(() =>
        useWakeWordDetection({
          accessKey,
          onWakeWord: mockOnWakeWord,
        })
      );

      await act(async () => {
        await result.current.startListening();
      });

      expect(PorcupineManager.fromBuiltInKeywords).toHaveBeenCalledWith(
        accessKey,
        [BuiltInKeywords.PICOVOICE],
        expect.any(Function), // detectionCallback
        expect.any(Function)  // errorCallback
      );
    });

    it('should start PorcupineManager and set isListening to true', async () => {
      const { result } = renderHook(() =>
        useWakeWordDetection({
          accessKey,
          onWakeWord: mockOnWakeWord,
        })
      );

      await act(async () => {
        await result.current.startListening();
      });

      await waitFor(() => {
        expect(result.current.isListening).toBe(true);
      });
      expect(mockPorcupineManager.start).toHaveBeenCalled();
    });

    it('should handle initialization errors', async () => {
      (PorcupineManager.fromBuiltInKeywords as jest.Mock).mockRejectedValue(
        new Error('Invalid access key')
      );

      const { result } = renderHook(() =>
        useWakeWordDetection({
          accessKey,
          onWakeWord: mockOnWakeWord,
        })
      );

      await act(async () => {
        await result.current.startListening();
      });

      expect(result.current.isListening).toBe(false);
      expect(result.current.error).toBe('Invalid access key');
    });

    it('should not start if already listening', async () => {
      const { result } = renderHook(() =>
        useWakeWordDetection({
          accessKey,
          onWakeWord: mockOnWakeWord,
        })
      );

      await act(async () => {
        await result.current.startListening();
      });

      (PorcupineManager.fromBuiltInKeywords as jest.Mock).mockClear();

      await act(async () => {
        await result.current.startListening();
      });

      expect(PorcupineManager.fromBuiltInKeywords).not.toHaveBeenCalled();
    });
  });

  describe('Stop listening', () => {
    it('should stop PorcupineManager and set isListening to false', async () => {
      const { result } = renderHook(() =>
        useWakeWordDetection({
          accessKey,
          onWakeWord: mockOnWakeWord,
        })
      );

      await act(async () => {
        await result.current.startListening();
      });

      await act(async () => {
        await result.current.stopListening();
      });

      expect(mockPorcupineManager.stop).toHaveBeenCalled();
      expect(mockPorcupineManager.delete).toHaveBeenCalled();
      expect(result.current.isListening).toBe(false);
    });

    it('should do nothing if not listening', async () => {
      const { result } = renderHook(() =>
        useWakeWordDetection({
          accessKey,
          onWakeWord: mockOnWakeWord,
        })
      );

      await act(async () => {
        await result.current.stopListening();
      });

      expect(mockPorcupineManager.stop).not.toHaveBeenCalled();
    });
  });

  describe('Wake word detection', () => {
    it('should call onWakeWord callback when wake word detected', async () => {
      let detectionCallback: (keywordIndex: number) => void;

      (PorcupineManager.fromBuiltInKeywords as jest.Mock).mockImplementation(
        (accessKey, keywords, callback) => {
          detectionCallback = callback;
          return Promise.resolve(mockPorcupineManager);
        }
      );

      const { result } = renderHook(() =>
        useWakeWordDetection({
          accessKey,
          onWakeWord: mockOnWakeWord,
        })
      );

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        detectionCallback!(0); // Trigger PICOVOICE
      });

      expect(mockOnWakeWord).toHaveBeenCalledWith();
    });
  });

  describe('Cleanup', () => {
    it('should stop and cleanup on unmount', async () => {
      const { result, unmount } = renderHook(() =>
        useWakeWordDetection({
          accessKey,
          onWakeWord: mockOnWakeWord,
        })
      );

      await act(async () => {
        await result.current.startListening();
      });

      unmount();

      expect(mockPorcupineManager.stop).toHaveBeenCalled();
      expect(mockPorcupineManager.delete).toHaveBeenCalled();
    });

    it('should not error on cleanup if not listening', () => {
      const { unmount } = renderHook(() =>
        useWakeWordDetection({
          accessKey,
          onWakeWord: mockOnWakeWord,
        })
      );

      expect(() => unmount()).not.toThrow();
    });
  });
});
