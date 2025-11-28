import { useState, useRef, useEffect } from 'react';
import { 
  useAudioRecorder as useExpoAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  AudioModule,
  setAudioModeAsync,
} from 'expo-audio';
import { File } from 'expo-file-system';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  hasPermission: boolean;
  error: string | null;
  recordingDuration: number;
  requestPermission: () => Promise<boolean>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  cancelRecording: () => Promise<void>;
  clearError: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const audioRecorder = useExpoAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const recordingUriRef = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    try {
      setError(null);
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      setHasPermission(granted);
      return granted;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request permission');
      return false;
    }
  };

  const startDurationTracking = () => {
    recordingStartTimeRef.current = Date.now();
    setRecordingDuration(0);
    
    durationIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
      setRecordingDuration(elapsed);
    }, 100);
  };

  const stopDurationTracking = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    setRecordingDuration(0);
  };

  const startRecording = async (): Promise<void> => {
    try {
      setError(null);

      if (!hasPermission) {
        setError('Microphone permission not granted');
        return;
      }

      // Configure audio mode for recording
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      // Prepare and start recording
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      startDurationTracking();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      stopDurationTracking();
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    try {
      setError(null);

      // Capture the state BEFORE stopping - getStatus() returns stale data after stop()
      const recordingDurationMs = recorderState.durationMillis;
      const uri = recorderState.url;

      // Stop recording
      await audioRecorder.stop();
      stopDurationTracking();

      // Check recording duration - need at least 0.3 seconds for meaningful audio
      if (recordingDurationMs < 300) {
        setError('Recording too short - please hold the button longer');
        return null;
      }

      if (!uri) {
        setError('No recording URI available - recording may not have captured any audio');
        return null;
      }

      // Read file as base64 using new File API
      const file = new File(uri);
      const base64Audio = await file.base64();
      return base64Audio;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to stop recording';
      console.error('[useAudioRecorder] Stop recording error:', errorMsg, err);
      setError(errorMsg);
      stopDurationTracking();
      return null;
    }
  };

  const cancelRecording = async (): Promise<void> => {
    try {
      await audioRecorder.stop();
      stopDurationTracking();
      recordingUriRef.current = null;
    } catch (err) {
      // Silently handle cancellation errors
      stopDurationTracking();
      recordingUriRef.current = null;
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  // Get isRecording state from the audioRecorder
  const isRecording = audioRecorder.isRecording || false;

  return {
    isRecording,
    hasPermission,
    error,
    recordingDuration,
    requestPermission,
    startRecording,
    stopRecording,
    cancelRecording,
    clearError,
  };
}
