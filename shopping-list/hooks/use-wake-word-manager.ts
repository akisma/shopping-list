import { useEffect, useCallback, useRef, useState } from 'react';
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

  // Track last wake word detection time for debouncing
  const lastDetectionTimeRef = useRef(0);
  // Track if we're currently processing a wake word (prevent auto-restart)
  const [processingWakeWord, setProcessingWakeWord] = useState(false);
  
  /**
   * Handle wake word detection
   * - Debounces multiple detections (ignore if within 8 seconds)
   * - IMMEDIATELY stops Porcupine to free up audio
   * - Clears background wake word mode
   * - Calls optional callback
   */
  const handleWakeWord = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastDetection = now - lastDetectionTimeRef.current;
    
    // Debounce: ignore detection if less than 12 seconds since last one
    // (enough time for 10s recording + command processing cycle)
    if (lastDetectionTimeRef.current > 0 && timeSinceLastDetection < 12000) {
      console.log(`[WakeWordManager] Ignoring duplicate wake word (${timeSinceLastDetection}ms since last)`);
      return;
    }
    
    lastDetectionTimeRef.current = now;
    setProcessingWakeWord(true);
    console.log(`[WakeWordManager] Wake word detected at ${now}! Setting processing flag and stopping Porcupine`);
    
    // CRITICAL: Stop Porcupine immediately to release audio input
    await stopListening();
    
    // Give audio system 100ms to fully release the microphone
    console.log('[WakeWordManager] Waiting 100ms for audio system to release');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // NOTE: Do NOT clear wake word mode here! 
    // The callback (voice-button) will handle transitioning to the proper mode
    // If we clear it now, Porcupine will immediately restart and interfere with recording
    
    console.log('[WakeWordManager] Audio system released, triggering callback');
    // Trigger callback (e.g., start recording)
    onWakeWordDetected?.();
    
    // Clear processing flag after callback completes
    // Give it 500ms to let the clarification mode get set
    setTimeout(() => {
      console.log('[WakeWordManager] Clearing processing flag');
      setProcessingWakeWord(false);
    }, 500);
  }, [stopListening, setBackgroundWakeWord, onWakeWordDetected]);

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
   * 3. Processing flag (don't restart while processing wake word)
   */
  useEffect(() => {
    const shouldBeActive = 
      enabled && 
      listeningMode !== 'waiting-for-clarification' &&
      !processingWakeWord;

    if (shouldBeActive && !isListening) {
      // Start wake word detection
      console.log('[WakeWordManager] Starting Porcupine - conditions met');
      startListening().then(() => {
        setBackgroundWakeWord(true);
      });
    } else if (!shouldBeActive && isListening) {
      // Stop wake word detection
      const reason = !enabled ? 'disabled' : 
                     listeningMode === 'waiting-for-clarification' ? 'clarification mode' :
                     processingWakeWord ? 'processing wake word' : 'unknown';
      console.log(`[WakeWordManager] Stopping Porcupine - reason: ${reason}`);
      stopListening().then(() => {
        setBackgroundWakeWord(false);
      });
    }
  }, [enabled, listeningMode, isListening, processingWakeWord, startListening, stopListening, setBackgroundWakeWord]);

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
