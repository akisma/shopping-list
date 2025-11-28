import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAudioRecorder } from '../use-audio-recorder';

// Mock expo-audio
const mockAudioRecorder = {
  prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
  record: jest.fn(),
  stop: jest.fn().mockResolvedValue(undefined),
  getStatus: jest.fn().mockResolvedValue({
    canRecord: true,
    isRecording: false,
    durationMillis: 5000,
    mediaServicesDidReset: false,
    url: 'file:///path/to/recording.m4a',
  }),
  isRecording: false,
};

jest.mock('expo-audio', () => ({
  useAudioRecorder: jest.fn(() => mockAudioRecorder),
  RecordingPresets: {
    HIGH_QUALITY: {
      android: {},
      ios: {},
    },
  },
  AudioModule: {
    requestRecordingPermissionsAsync: jest.fn().mockResolvedValue({ granted: true, status: 'granted' }),
  },
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-file-system
const mockFile = {
  base64: jest.fn().mockResolvedValue('base64AudioData'),
};

jest.mock('expo-file-system', () => ({
  File: jest.fn(() => mockFile),
}));

describe('useAudioRecorder', () => {
  let mockRecording: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock recording instance
    mockRecording = {
      prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
      startAsync: jest.fn().mockResolvedValue(undefined),
      stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
      getURI: jest.fn().mockReturnValue('file:///path/to/recording.m4a'),
      getStatusAsync: jest.fn().mockResolvedValue({
        isRecording: false,
        durationMillis: 5000,
      }),
    };

    (Audio.Recording as jest.Mock).mockImplementation(() => mockRecording);
    (Audio.requestPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true, status: 'granted' });
    (Audio.setAudioModeAsync as jest.Mock).mockResolvedValue(undefined);
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('base64AudioData');
  });

  describe('requestPermission', () => {
    it('should request microphone permission', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        const granted = await result.current.requestPermission();
        expect(granted).toBe(true);
      });

      expect(Audio.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should return false when permission denied', async () => {
      (Audio.requestPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false, status: 'denied' });

      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        const granted = await result.current.requestPermission();
        expect(granted).toBe(false);
      });
    });

    it('should update hasPermission state when granted', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      expect(result.current.hasPermission).toBe(false);

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(result.current.hasPermission).toBe(true);
    });

    it('should handle permission request errors', async () => {
      (Audio.requestPermissionsAsync as jest.Mock).mockRejectedValue(new Error('Permission error'));

      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        const granted = await result.current.requestPermission();
        expect(granted).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('startRecording', () => {
    it('should start recording when permission granted', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.requestPermission();
      });

      await act(async () => {
        await result.current.startRecording();
      });

      expect(Audio.setAudioModeAsync).toHaveBeenCalledWith({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      expect(mockRecording.prepareToRecordAsync).toHaveBeenCalled();
      expect(mockRecording.startAsync).toHaveBeenCalled();
      expect(result.current.isRecording).toBe(true);
    });

    it('should not start recording without permission', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(mockRecording.startAsync).not.toHaveBeenCalled();
      expect(result.current.error).toBeTruthy();
    });

    it('should handle recording start errors', async () => {
      mockRecording.startAsync.mockRejectedValue(new Error('Recording failed'));

      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.requestPermission();
      });

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.isRecording).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('stopRecording', () => {
    it('should stop recording and return base64 audio', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.requestPermission();
      });

      await act(async () => {
        await result.current.startRecording();
      });

      let audioData: string | null = null;
      await act(async () => {
        audioData = await result.current.stopRecording();
      });

      expect(mockRecording.stopAndUnloadAsync).toHaveBeenCalled();
      expect(FileSystem.readAsStringAsync).toHaveBeenCalledWith(
        'file:///path/to/recording.m4a',
        { encoding: 'base64' }
      );
      expect(audioData).toBe('base64AudioData');
      expect(result.current.isRecording).toBe(false);
    });

    it('should return null when not recording', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      let audioData: string | null = null;
      await act(async () => {
        audioData = await result.current.stopRecording();
      });

      expect(audioData).toBeNull();
      expect(mockRecording.stopAndUnloadAsync).not.toHaveBeenCalled();
    });

    it('should handle stop recording errors', async () => {
      mockRecording.stopAndUnloadAsync.mockRejectedValue(new Error('Stop failed'));

      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.requestPermission();
        await result.current.startRecording();
      });

      let audioData: string | null = null;
      await act(async () => {
        audioData = await result.current.stopRecording();
      });

      expect(audioData).toBeNull();
      expect(result.current.error).toBeTruthy();
    });

    it('should reset recording state after stop', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.requestPermission();
      });

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.isRecording).toBe(true);

      await act(async () => {
        await result.current.stopRecording();
      });

      expect(result.current.isRecording).toBe(false);
    });
  });

  describe('cancelRecording', () => {
    it('should cancel recording without returning audio', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.requestPermission();
      });

      await act(async () => {
        await result.current.startRecording();
      });

      await act(async () => {
        await result.current.cancelRecording();
      });

      expect(mockRecording.stopAndUnloadAsync).toHaveBeenCalled();
      expect(FileSystem.readAsStringAsync).not.toHaveBeenCalled();
      expect(result.current.isRecording).toBe(false);
    });

    it('should not error when canceling without active recording', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.cancelRecording();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      (Audio.requestPermissionsAsync as jest.Mock).mockRejectedValue(new Error('Permission error'));

      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(result.current.error).toBeTruthy();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('recordingDuration', () => {
    it('should return recording duration in seconds', async () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.requestPermission();
      });

      await act(async () => {
        await result.current.startRecording();
      });

      // Advance time by 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.recordingDuration).toBeGreaterThanOrEqual(1);

      jest.useRealTimers();
    });

    it('should reset duration after stop', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.requestPermission();
        await result.current.startRecording();
      });

      await act(async () => {
        await result.current.stopRecording();
      });

      expect(result.current.recordingDuration).toBe(0);
    });
  });
});
