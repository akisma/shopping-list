import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { VoiceCommandService } from '@/services/voice-command-service';
import { API_BASE_URL } from '@/constants/api';
import { useTextToSpeech } from './use-text-to-speech';

const voiceService = new VoiceCommandService(`${API_BASE_URL}/api/voice`);

export function useVoiceCommands() {
  const [processing, setProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  
  // TTS integration
  const { speak, isTtsEnabled, setTtsEnabled } = useTextToSpeech();

  /**
   * Display message to user via TTS or Alert
   */
  const announceToUser = useCallback(async (message: string, title: string = 'Voice Command') => {
    if (isTtsEnabled) {
      await speak(message);
    } else {
      Alert.alert(title, message, [{ text: 'OK' }]);
    }
  }, [isTtsEnabled, speak]);

  const handleVoiceCommand = useCallback(async (audioBlob: string) => {
    setProcessing(true);
    setLastResponse(null);

    try {
      const response = await voiceService.sendVoiceCommand(audioBlob, sessionId || undefined);

      // Update session context
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }

      // Store response text for display
      setLastResponse(response.ttsText);

      if (response.success) {
        await announceToUser(response.ttsText);
        
        return {
          success: true,
          action: response.action,
          data: response.data,
          ttsText: response.ttsText,
        };
      }

      // Handle clarification requests
      if (response.action === 'clarification') {
        const clarificationMessage = response.ttsText || 'Could you please clarify?';
        await announceToUser(clarificationMessage);
        
        return {
          success: false,
          action: response.action,
          ttsText: response.ttsText,
        };
      }

      // Handle errors
      const errorMessage = response.ttsText || response.error || 'Command failed';
      await announceToUser(errorMessage, 'Error');
      
      return {
        success: false,
        error: response.error || response.ttsText,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process voice command';
      await announceToUser(errorMessage, 'Voice Command Error');
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setProcessing(false);
    }
  }, [sessionId, announceToUser]);

  const clearSession = useCallback(async () => {
    if (sessionId) {
      try {
        await voiceService.deleteSession(sessionId);
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
      setSessionId(null);
    }
  }, [sessionId]);

  return {
    handleVoiceCommand,
    clearSession,
    processing,
    sessionId,
    lastResponse,
    isTtsEnabled,
    setTtsEnabled,
  };
}
