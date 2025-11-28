/**
 * useWakeWord Hook (TDD - GREEN Phase)
 * Custom hook for integrating wake word detection with React components
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { WakeWordService, WakeWordStatus } from '@/services/wake-word-service';

export interface UseWakeWordOptions {
  onWakeWordDetected?: (command: string) => void;
}

export interface UseWakeWordResult {
  status: WakeWordStatus;
  isListening: boolean;
  enabled: boolean;
  wakePhrase: string;
  detectedCommand: string | null;
  startListening: () => void;
  stopListening: () => void;
  setEnabled: (enabled: boolean) => void;
  processTranscript: (transcript: string) => boolean;
  resetDetection: () => void;
}

export function useWakeWord(options: UseWakeWordOptions = {}): UseWakeWordResult {
  const { onWakeWordDetected } = options;
  
  const [status, setStatus] = useState<WakeWordStatus>('idle');
  const [enabled, setEnabledState] = useState(true);
  const [detectedCommand, setDetectedCommand] = useState<string | null>(null);
  
  const serviceRef = useRef<WakeWordService | null>(null);
  const onWakeWordDetectedRef = useRef(onWakeWordDetected);
  
  // Keep callback ref up to date
  useEffect(() => {
    onWakeWordDetectedRef.current = onWakeWordDetected;
  }, [onWakeWordDetected]);
  
  // Initialize service lazily
  const getService = useCallback(() => {
    if (!serviceRef.current) {
      serviceRef.current = new WakeWordService({
        onWakeWordDetected: (command) => {
          setDetectedCommand(command);
          onWakeWordDetectedRef.current?.(command);
        },
        onStatusChange: (newStatus) => {
          setStatus(newStatus);
        },
      });
    }
    return serviceRef.current;
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      serviceRef.current?.stop();
    };
  }, []);
  
  const startListening = useCallback(() => {
    if (enabled) {
      getService().start();
    }
  }, [enabled, getService]);
  
  const stopListening = useCallback(() => {
    getService().stop();
  }, [getService]);
  
  const setEnabled = useCallback((newEnabled: boolean) => {
    setEnabledState(newEnabled);
    getService().setEnabled(newEnabled);
  }, [getService]);
  
  const processTranscript = useCallback((transcript: string): boolean => {
    return getService().processTranscript(transcript);
  }, [getService]);
  
  const resetDetection = useCallback(() => {
    setDetectedCommand(null);
    getService().resetAfterDetection();
  }, [getService]);
  
  return {
    status,
    isListening: status === 'listening',
    enabled,
    wakePhrase: getService().getWakePhrase(),
    detectedCommand,
    startListening,
    stopListening,
    setEnabled,
    processTranscript,
    resetDetection,
  };
}
