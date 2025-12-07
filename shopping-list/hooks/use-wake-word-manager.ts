import { useEffect, useCallback } from 'react';
import { useWakeWordDetection } from './use-wake-word-detection';
import { useVoiceListeningContext } from './use-voice-listening-context';
import { BuiltInKeywords } from '@picovoice/porcupine-react-native';

export interface UseWakeWordManagerOptions {
  accessKey: string;
  enabled: boolean;
  onWakeWordDetected?: () => void;
  keyword?: BuiltInKeywords;
  sensitivity?: number;
}

/**
 * Manager hook that coordinates wake word detection with VoiceListeningContext.
 * Automatically starts/stops wake word detection based on enabled flag and context state.
 * 
 * @example
 * ```tsx
 * const { isActive, error } = useWakeWordManager({
 *   accessKey: 'YOUR_ACCESS_KEY',
 *   enabled: wakeWordEnabled,
 *   onWakeWordDetected: () => {
 *     // Start voice recording
 *     startRecording();
 *   },
 * });
 * ```
 */
export function useWakeWordManager({
  accessKey,
  enabled,
  onWakeWordDetected,
  keyword,
  sensitivity,
}: UseWakeWordManagerOptions) {
  const { listeningMode, setBackgroundWakeWord } = useVoiceListeningContext();

  /**
   * Handle wake word detection
   * - Clears background wake word mode
   * - Calls optional callback
   */
  const handleWakeWord = useCallback(() => {
    console.log('[WakeWordManager] Wake word detected!');
    
    // Clear wake word mode (will be handled by voice command flow)
    setBackgroundWakeWord(false);
    
    // Trigger callback (e.g., start recording)
    onWakeWordDetected?.();
  }, [setBackgroundWakeWord, onWakeWordDetected]);

  // Initialize wake word detection
  const { 
    isListening, 
    error, 
    startListening, 
    stopListening 
  } = useWakeWordDetection({
    accessKey,
    onWakeWord: handleWakeWord,
    keyword,
    sensitivity,
  });

  /**
   * Manage wake word detection lifecycle based on:
   * 1. Enabled flag (user setting)
   * 2. Listening mode (don't interfere with clarification)
   */
  useEffect(() => {
    const shouldBeActive = 
      enabled && 
      listeningMode !== 'waiting-for-clarification';

    if (shouldBeActive && !isListening) {
      // Start wake word detection
      startListening().then(() => {
        setBackgroundWakeWord(true);
      });
    } else if (!shouldBeActive && isListening) {
      // Stop wake word detection
      stopListening().then(() => {
        setBackgroundWakeWord(false);
      });
    }
  }, [enabled, listeningMode, isListening, startListening, stopListening, setBackgroundWakeWord]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (isListening) {
        stopListening();
        setBackgroundWakeWord(false);
      }
    };
  }, [isListening, stopListening, setBackgroundWakeWord]);

  return {
    isActive: isListening && listeningMode === 'background-wake-word',
    isListening,
    error,
  };
}
