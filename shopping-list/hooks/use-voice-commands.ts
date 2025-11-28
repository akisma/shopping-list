import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { VoiceCommandService } from '@/services/voice-command-service';
import { API_BASE_URL } from '@/constants/api';

const voiceService = new VoiceCommandService(`${API_BASE_URL}/api/voice`);

export function useVoiceCommands() {
  const [processing, setProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  const handleVoiceCommand = useCallback(async (audioBlob: string) => {
    setProcessing(true);
    setLastResponse(null);

    try {
      // Send voice command to backend
      const response = await voiceService.sendVoiceCommand(audioBlob, sessionId || undefined);

      // Store session ID for context
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }

      // Store TTS text for display
      setLastResponse(response.ttsText);

      // Show result to user
      if (response.success) {
        Alert.alert('Voice Command', response.ttsText, [{ text: 'OK' }]);
        
        // Return action for caller to handle
        return {
          success: true,
          action: response.action,
          data: response.data,
          ttsText: response.ttsText,
        };
      } else {
        // Check if it's a clarification request (not an actual error)
        if (response.action === 'clarification') {
          Alert.alert('Voice Command', response.ttsText || 'Could you please clarify?', [{ text: 'OK' }]);
          return {
            success: false,
            action: response.action,
            ttsText: response.ttsText,
          };
        }
        
        // Actual error
        Alert.alert('Error', response.error || response.ttsText || 'Command failed', [{ text: 'OK' }]);
        return {
          success: false,
          error: response.error || response.ttsText,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process voice command';
      Alert.alert('Voice Command Error', errorMessage, [{ text: 'OK' }]);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setProcessing(false);
    }
  }, [sessionId]);

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
  };
}
