/**
 * WakeWordContext (TDD - GREEN Phase)
 * Context provider for sharing wake word state across the app
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useWakeWord, UseWakeWordResult } from '@/hooks/use-wake-word';

interface WakeWordProviderProps {
  children: ReactNode;
  onWakeWordDetected?: (command: string) => void;
}

const WakeWordContext = createContext<UseWakeWordResult | null>(null);

export function WakeWordProvider({ children, onWakeWordDetected }: WakeWordProviderProps) {
  const wakeWord = useWakeWord({ onWakeWordDetected });

  return (
    <WakeWordContext.Provider value={wakeWord}>
      {children}
    </WakeWordContext.Provider>
  );
}

export function useWakeWordContext(): UseWakeWordResult {
  const context = useContext(WakeWordContext);
  if (!context) {
    throw new Error('useWakeWordContext must be used within a WakeWordProvider');
  }
  return context;
}
