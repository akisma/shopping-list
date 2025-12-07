import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { PorcupineManager, BuiltInKeywords } from '@picovoice/porcupine-react-native';

export interface UseWakeWordDetectionOptions {
  accessKey: string;
  onWakeWord: () => void;
  keyword?: BuiltInKeywords;
  sensitivity?: number;
}

export interface UseWakeWordDetectionReturn {
  isListening: boolean;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
}

/**
 * Hook for wake word detection using Picovoice Porcupine.
 * Handles audio recording, permission requests, and wake word callbacks.
 * 
 * @example
 * ```tsx
 * const { isListening, startListening, stopListening } = useWakeWordDetection({
 *   accessKey: 'YOUR_ACCESS_KEY',
 *   onWakeWord: () => console.log('Wake word detected!'),
 * });
 * ```
 */
export function useWakeWordDetection({
  accessKey,
  onWakeWord,
  keyword = BuiltInKeywords.PICOVOICE,
  sensitivity = 0.5,
}: UseWakeWordDetectionOptions): UseWakeWordDetectionReturn {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const porcupineManagerRef = useRef<PorcupineManager | null>(null);

  /**
   * Detection callback - called when wake word is detected
   */
  const handleDetection = useCallback((keywordIndex: number) => {
    console.log('[WakeWord] Detected at index:', keywordIndex);
    onWakeWord();
  }, [onWakeWord]);

  /**
   * Error callback - called when processing error occurs
   */
  const handleError = useCallback((err: Error) => {
    console.error('[WakeWord] Processing error:', err);
    setError(err.message);
    setIsListening(false);
  }, []);

  /**
   * Request microphone permission on Android
   */
  const requestPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    // iOS handles permission automatically
    return true;
  };

  /**
   * Start wake word detection
   */
  const startListening = useCallback(async () => {
    // Don't start if already listening
    if (isListening || porcupineManagerRef.current) {
      return;
    }

    try {
      setError(null);

      // Request permission
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setError('Microphone permission denied');
        return;
      }

      // Initialize PorcupineManager
      const manager = await PorcupineManager.fromBuiltInKeywords(
        accessKey,
        [keyword],
        handleDetection,
        handleError
      );

      porcupineManagerRef.current = manager;

      // Start listening
      await manager.start();
      setIsListening(true);
      console.log('[WakeWord] Started listening for:', keyword);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[WakeWord] Failed to start:', errorMessage);
      setError(errorMessage);
      setIsListening(false);
    }
  }, [isListening, accessKey, keyword, handleDetection, handleError]);

  /**
   * Stop wake word detection
   */
  const stopListening = useCallback(async () => {
    const manager = porcupineManagerRef.current;
    if (!manager) {
      return;
    }

    try {
      await manager.stop();
      if (porcupineManagerRef.current) {
        await porcupineManagerRef.current.delete();
      }
      porcupineManagerRef.current = null;
      setIsListening(false);
      console.log('[WakeWord] Stopped listening');
    } catch (err) {
      console.error('[WakeWord] Failed to stop:', err);
      porcupineManagerRef.current = null;
    }
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (porcupineManagerRef.current) {
        try {
          porcupineManagerRef.current.stop();
          porcupineManagerRef.current.delete();
        } catch (err) {
          console.error('[WakeWord] Cleanup error:', err);
        }
        porcupineManagerRef.current = null;
      }
    };
  }, []);

  return {
    isListening,
    error,
    startListening,
    stopListening,
  };
}
