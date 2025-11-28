import { useState, useEffect } from 'react';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TTS_ENABLED_KEY = '@voice_tts_enabled';

interface UseTextToSpeechResult {
  speak: (text: string) => Promise<void>;
  isSpeaking: boolean;
  stop: () => void;
  isTtsEnabled: boolean;
  setTtsEnabled: (enabled: boolean) => Promise<void>;
}

/**
 * Custom hook for text-to-speech functionality
 * Provides spoken confirmations for voice commands with settings control
 */
export function useTextToSpeech(): UseTextToSpeechResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTtsEnabled, setIsTtsEnabledState] = useState(true);

  // Load TTS preference from storage on mount
  useEffect(() => {
    loadTtsPreference();
  }, []);

  const loadTtsPreference = async () => {
    try {
      const value = await AsyncStorage.getItem(TTS_ENABLED_KEY);
      if (value !== null) {
        setIsTtsEnabledState(value === 'true');
      }
    } catch (error) {
      console.error('Failed to load TTS preference:', error);
    }
  };

  const setTtsEnabled = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(TTS_ENABLED_KEY, enabled.toString());
      setIsTtsEnabledState(enabled);
      
      // Stop any ongoing speech when disabling
      if (!enabled && isSpeaking) {
        Speech.stop();
      }
    } catch (error) {
      console.error('Failed to save TTS preference:', error);
    }
  };

  const speak = async (text: string) => {
    // Don't speak if TTS is disabled
    if (!isTtsEnabled) {
      return;
    }

    try {
      // Stop any ongoing speech
      if (isSpeaking) {
        await Speech.stop();
      }

      setIsSpeaking(true);

      await Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9, // Slightly slower for clarity in kitchen
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
    }
  };

  const stop = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  return {
    speak,
    isSpeaking,
    stop,
    isTtsEnabled,
    setTtsEnabled,
  };
}
