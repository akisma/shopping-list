import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAudioRecorder } from '../use-audio-recorder';
import { AudioModule } from 'expo-audio';

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
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock recorder state
    mockAudioRecorder.isRecording = false;
    mockAudioRecorder.prepareToRecordAsync.mockResolvedValue(undefined);
    mockAudioRecorder.record.mockReturnValue(undefined);
    mockAudioRecorder.stop.mockResolvedValue(undefined);
    mockAudioRecorder.getStatus.mockResolvedValue({
      canRecord: true,
      isRecording: false,
      durationMillis: 5000,
      mediaServicesDidReset: false,
      url: 'file:///path/to/recording.m4a',
    });
    mockFile.base64.mockResolvedValue('base64AudioData');
    (AudioModule.requestRecordingPermissionsAsync as jest.Mock).mockResolvedValue({ 
      granted: true, 
      status: 'granted' 
    });
  });

  describe('requestPermission', () => {
    it('should request microphone permission', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        const granted = await result.current.requestPermission();
        expect(granted).toBe(true);
      });

      expect(AudioModule.requestRecordingPermissionsAsync).toHaveBeenCalled();
    });

    it('should return false when permission denied', async () => {
      (AudioModule.requestRecordingPermissionsAsync as jest.Mock).mockResolvedValue({ 
        granted: false, 
        status: 'denied' 
      });

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
      (AudioModule.requestRecordingPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Permission error')
      );

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
      const { useAudioRecorder: mockUseAudioRecorder, setAudioModeAsync } = require('expo-audio');
      
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.requestPermission();
      });

      await act(async () => {
        await result.current.startRecording();
      });

      expect(setAudioModeAsync).toHaveBeenCalledWith({
        playsInSilentMode: true,
        allowsRecording: true,
      });
      expect(mockAudioRecorder.prepareToRecordAsync).toHaveBeenCalled();
      expect(mockAudioRecorder.record).toHaveBeenCalled();
    });

    it('should not start recording without permission', async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(mockAudioRecorder.record).not.toHaveBeenCalled();
      expect(result.current.error).toBeTruthy();
    });

    it('should handle recording start errors', async () => {
      mockAudioRecorder.prepareToRecordAsync.mockRejectedValue(new Error('Recording failed'));

      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.requestPermission();
      });

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('stopRecording', () => {
    it('should stop recording and return base64 audio', async () => {
      const { File } = require('expo-file-system');
      
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

      expect(mockAudioRecorder.stop).toHaveBeenCalled();
      expect(mockAudioRecorder.getStatus).toHaveBeenCalled();
      expect(File).toHaveBeenCalledWith('file:///path/to/recording.m4a');
      expect(mockFile.base64).toHaveBeenCalled();
      expect(audioData).toBe('base64AudioData');
    });

    it('should return null when recording URI is not available', async () => {
      mockAudioRecorder.getStatus.mockResolvedValue({
        canRecord: true,
        isRecording: false,
        durationMillis: 5000,
        mediaServicesDidReset: false,
        url: null,
      });

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

      expect(audioData).toBeNull();
      expect(result.current.error).toBeTruthy();
    });

    it('should handle stop recording errors', async () => {
      mockAudioRecorder.stop.mockRejectedValue(new Error('Stop failed'));

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

      await act(async () => {
        await result.current.stopRecording();
      });

      expect(result.current.recordingDuration).toBe(0);
    });
  });

  describe('cancelRecording', () => {
    it('should cancel recording', async () => {
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

      expect(mockAudioRecorder.stop).toHaveBeenCalled();
      expect(result.current.recordingDuration).toBe(0);
    });

    it('should handle cancel errors silently', async () => {
      mockAudioRecorder.stop.mockRejectedValue(new Error('Cancel failed'));

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

      expect(result.current.recordingDuration).toBe(0);
      // Error should be handled silently, not set
      expect(result.current.error).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      (AudioModule.requestRecordingPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Permission error')
      );

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
    it('should track recording duration', async () => {
      jest.useFakeTimers();

      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.requestPermission();
      });

      await act(async () => {
        await result.current.startRecording();
      });

      // Fast-forward 2 seconds
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(result.current.recordingDuration).toBeGreaterThan(0);
      });

      jest.useRealTimers();
    });
  });
});
