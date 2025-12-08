import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

export type ListeningMode = 'inactive' | 'waiting-for-clarification' | 'background-wake-word';

export interface PendingActionData {
  type: string;
  data: Record<string, any>;
  question: string;
  sessionId: string;
}

interface VoiceListeningContextValue {
  listeningMode: ListeningMode;
  pendingAction: PendingActionData | null;
  isWakeWordActive: boolean;
  setWakeWordActive: (active: boolean) => void;
  wakeWordCallbackRef: React.MutableRefObject<(() => void) | null>;
  startListeningForClarification: (pendingAction: PendingActionData) => void;
  clearPendingAction: () => void;
  setBackgroundWakeWord: (enabled: boolean) => void;
}

const VoiceListeningContext = createContext<VoiceListeningContextValue | undefined>(undefined);

const CLARIFICATION_TIMEOUT_MS = 15000; // 15 seconds

interface VoiceListeningProviderProps {
  children: ReactNode;
}

export function VoiceListeningProvider({ children }: VoiceListeningProviderProps) {
  const [listeningMode, setListeningMode] = useState<ListeningMode>('inactive');
  const [pendingAction, setPendingAction] = useState<PendingActionData | null>(null);
  const [isWakeWordActive, setIsWakeWordActive] = useState(false);
  const wakeWordCallbackRef = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingAction = useCallback(() => {
    setPendingAction(null);
    setListeningMode('inactive');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startListeningForClarification = useCallback((action: PendingActionData) => {
    setPendingAction(action);
    setListeningMode('waiting-for-clarification');

    // Set timeout to auto-clear after 15 seconds
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      console.log('[VoiceListeningContext] Clarification timeout - clearing pending action');
      clearPendingAction();
    }, CLARIFICATION_TIMEOUT_MS);
  }, [clearPendingAction]);

  const setBackgroundWakeWord = useCallback((enabled: boolean) => {
    if (enabled) {
      setListeningMode('background-wake-word');
    } else if (listeningMode === 'background-wake-word') {
      setListeningMode('inactive');
    }
  }, [listeningMode]);

  const setWakeWordActive = useCallback((active: boolean) => {
    setIsWakeWordActive(active);
    // Auto-clear after 3 seconds
    if (active) {
      setTimeout(() => setIsWakeWordActive(false), 3000);
    }
  }, []);

  const value: VoiceListeningContextValue = {
    listeningMode,
    pendingAction,
    isWakeWordActive,
    setWakeWordActive,
    wakeWordCallbackRef,
    startListeningForClarification,
    clearPendingAction,
    setBackgroundWakeWord,
  };

  return (
    <VoiceListeningContext.Provider value={value}>
      {children}
    </VoiceListeningContext.Provider>
  );
}

export function useVoiceListeningContext() {
  const context = useContext(VoiceListeningContext);
  if (context === undefined) {
    throw new Error('useVoiceListeningContext must be used within a VoiceListeningProvider');
  }
  return context;
}
