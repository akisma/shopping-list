/**
 * WakeWordProvider Component
 * Manages wake word detection lifecycle based on persisted settings
 */

import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWakeWordManager } from '@/hooks/use-wake-word-manager';
import { BuiltInKeywords } from '@picovoice/porcupine-react-native';

interface WakeWordProviderProps {
  children: React.ReactNode;
}

export function WakeWordProvider({ children }: WakeWordProviderProps) {
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false);
  const [sensitivity, setSensitivity] = useState(0.5);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [enabledValue, sensitivityValue] = await Promise.all([
          AsyncStorage.getItem('wakeWordEnabled'),
          AsyncStorage.getItem('wakeWordSensitivity'),
        ]);

        if (enabledValue !== null) {
          setWakeWordEnabled(enabledValue === 'true');
        }
        if (sensitivityValue !== null) {
          setSensitivity(parseFloat(sensitivityValue));
        }
      } catch (error) {
        console.error('Failed to load wake word settings:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  // Listen for changes to settings (from Settings screen)
  useEffect(() => {
    if (!isLoaded) return;

    const interval = setInterval(async () => {
      try {
        const [enabledValue, sensitivityValue] = await Promise.all([
          AsyncStorage.getItem('wakeWordEnabled'),
          AsyncStorage.getItem('wakeWordSensitivity'),
        ]);

        if (enabledValue !== null) {
          const newEnabled = enabledValue === 'true';
          if (newEnabled !== wakeWordEnabled) {
            setWakeWordEnabled(newEnabled);
          }
        }
        if (sensitivityValue !== null) {
          const newSensitivity = parseFloat(sensitivityValue);
          if (newSensitivity !== sensitivity) {
            setSensitivity(newSensitivity);
          }
        }
      } catch (error) {
        console.error('Failed to reload wake word settings:', error);
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [isLoaded, wakeWordEnabled, sensitivity]);

  // Get access key from environment
  const accessKey = process.env.EXPO_PUBLIC_PICOVOICE_ACCESS_KEY || '';

  // Initialize wake word manager
  const { isActive, error } = useWakeWordManager({
    accessKey,
    enabled: wakeWordEnabled && accessKey.length > 0,
    keyword: BuiltInKeywords.PICOVOICE,
    sensitivity,
    onWakeWordDetected: () => {
      console.log('[WakeWordProvider] Wake word detected - user can now speak');
      // The wake word detection automatically transitions the context to inactive
      // User can then press and hold the voice button to record
    },
  });

  // Log state changes for debugging
  useEffect(() => {
    if (isLoaded) {
      console.log('[WakeWordProvider] Wake word state:', {
        enabled: wakeWordEnabled,
        hasAccessKey: accessKey.length > 0,
        isActive,
        sensitivity,
      });
    }
  }, [wakeWordEnabled, accessKey, isActive, sensitivity, isLoaded]);

  // Log errors
  useEffect(() => {
    if (error) {
      console.error('[WakeWordProvider] Wake word error:', error);
    }
  }, [error]);

  return <>{children}</>;
}
