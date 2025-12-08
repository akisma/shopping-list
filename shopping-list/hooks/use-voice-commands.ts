import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { VoiceCommandService } from '@/services/voice-command-service';
import { API_BASE_URL } from '@/constants/api';
import { useTextToSpeech } from './use-text-to-speech';
import { useVoiceListeningContext } from './use-voice-listening-context';

const voiceService = new VoiceCommandService(`${API_BASE_URL}/api/voice`);

export function useVoiceCommands() {
  const [processing, setProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  
  // TTS integration
  const { speak, isTtsEnabled, setTtsEnabled } = useTextToSpeech();
  
  // Voice listening context for multi-turn conversations
  const { startListeningForClarification, clearPendingAction } = useVoiceListeningContext();

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
        // Success - clear any pending action
        clearPendingAction();
        await announceToUser(response.ttsText);
        
        return {
          success: true,
          action: response.action,
          data: response.data,
          ttsText: response.ttsText,
        };
      }

      // Handle clarification requests - set listening mode
      if (response.action === 'clarification') {
        const clarificationMessage = response.ttsText || 'Could you please clarify?';
        
        // Set up pending action in context
        startListeningForClarification({
          type: 'add_item_quantity_needed', // TODO: Get from response if available
          data: response.data || {},
          question: clarificationMessage,
          sessionId: response.sessionId || sessionId || '',
        });
        
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
      
      // Clear pending action on error
      clearPendingAction();
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setProcessing(false);
    }
  }, [sessionId, announceToUser, startListeningForClarification, clearPendingAction]);

  const clearSession = useCallback(async () => {
    if (sessionId) {
      try {
        await voiceService.deleteSession(sessionId);
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
      setSessionId(null);
    }
    // Also clear any pending actions
    clearPendingAction();
  }, [sessionId, clearPendingAction]);

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
