import React, { useState, useEffect } from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useAudioRecorder } from '../hooks/use-audio-recorder';
import { useThemeColor } from '../hooks/use-theme-color';
import { useVoiceListeningContext } from '../hooks/use-voice-listening-context';

interface VoiceButtonProps {
  onVoiceCommand: (audioBlob: string) => void;
  disabled?: boolean;
  processing?: boolean;
}

export function VoiceButton({ onVoiceCommand, disabled = false, processing = false }: VoiceButtonProps) {
  const {
    isRecording,
    hasPermission,
    error,
    recordingDuration,
    requestPermission,
    startRecording,
    stopRecording,
    cancelRecording,
    clearError,
  } = useAudioRecorder();

  const [permissionError, setPermissionError] = useState<string | null>(null);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  const iconColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const errorColor = '#ef4444';
  const recordingColor = '#ef4444';
  const clarificationColor = '#10b981'; // Green for waiting-for-clarification
  const wakeWordColor = '#3B82F6'; // Blue for background-wake-word
  
  // Get listening context
  const { 
    listeningMode, 
    isWakeWordActive, 
    wakeWordCallbackRef,
    startListeningForClarification,
    clearPendingAction,
    setBackgroundWakeWord,
  } = useVoiceListeningContext();

  // Auto-recording timeout ref
  const autoRecordTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track if callback is in progress to prevent double triggers
  const callbackInProgressRef = React.useRef(false);

  // Register wake word callback for auto-recording
  useEffect(() => {
    wakeWordCallbackRef.current = async () => {
      // Prevent multiple triggers if callback already in progress
      if (callbackInProgressRef.current) {
        console.log('[VoiceButton] Callback already in progress, ignoring wake word');
        return;
      }

      callbackInProgressRef.current = true;
      const wakeWordTime = Date.now();
      console.log('[VoiceButton] Wake word callback triggered at', wakeWordTime);
      
      try {
        // Request permission if needed and wait for it
        if (!hasPermission) {
          console.log('[VoiceButton] Requesting microphone permission...');
          const granted = await requestPermission();
          if (!granted) {
            console.log('[VoiceButton] Permission denied');
            setPermissionError('Tap here to enable microphone');
            callbackInProgressRef.current = false;
            return;
          }
        console.log('[VoiceButton] Permission granted');
      }

      // CRITICAL: Set waiting-for-clarification mode to prevent Porcupine from restarting
      // Use a dummy pending action just to keep the mode set
      console.log('[VoiceButton] Setting clarification mode to prevent Porcupine restart');
      startListeningForClarification({
        type: 'recording',
        data: {},
        question: 'Recording in progress...',
        sessionId: `recording-${Date.now()}`,
      });

      // Start recording IMMEDIATELY to capture as much as possible
      // Note: We still can't capture audio spoken before this point
      // Porcupine has stopped by now (stopped in wake word manager)
        const beforeRecordTime = Date.now();
        console.log(`[VoiceButton] Starting recording ${beforeRecordTime - wakeWordTime}ms after wake word`);
        await startRecording();
      const afterRecordTime = Date.now();
      console.log(`[VoiceButton] Recording started ${afterRecordTime - wakeWordTime}ms after wake word - listening for 10 seconds`);        // Clear any existing timeout
        if (autoRecordTimeoutRef.current) {
          clearTimeout(autoRecordTimeoutRef.current);
        }
        
        // Auto-stop after 6 seconds (enough for full command)
        autoRecordTimeoutRef.current = setTimeout(async () => {
          console.log('[VoiceButton] Recording complete - processing command');
          try {
            const audioBlob = await stopRecording();
            console.log('[VoiceButton] Audio captured:', audioBlob ? 'yes' : 'no');
            if (audioBlob) {
              const audioBlobLength = audioBlob.length;
              const audioSizeKB = (audioBlobLength / 1024).toFixed(2);
              console.log(`[VoiceButton] Audio blob size: ${audioSizeKB} KB (${audioBlobLength} chars base64)`);
              console.log('[VoiceButton] Sending to voice command handler');
              onVoiceCommand(audioBlob);
              
              // Keep clarification mode active while processing command
              // It will be cleared by the command handler or timeout
            } else {
              console.log('[VoiceButton] No audio captured - recording too short');
              // Clear clarification mode and re-enable wake word
              console.log('[VoiceButton] Re-enabling wake word detection');
              clearPendingAction();
              setBackgroundWakeWord(true);
            }
          } catch (err) {
            console.error('[VoiceButton] Error stopping recording:', err);
            // Clear clarification mode and re-enable wake word on error
            console.log('[VoiceButton] Re-enabling wake word detection after error');
            clearPendingAction();
            setBackgroundWakeWord(true);
          } finally {
            callbackInProgressRef.current = false;
          }
        }, 10000); // 10 seconds to capture command
      } catch (err) {
        console.error('[VoiceButton] Error in wake word callback:', err);
        // Clear clarification mode and re-enable wake word on error
        console.log('[VoiceButton] Re-enabling wake word detection after callback error');
        clearPendingAction();
        setBackgroundWakeWord(true);
        callbackInProgressRef.current = false;
      }
    };

    return () => {
      wakeWordCallbackRef.current = null;
      callbackInProgressRef.current = false;
      if (autoRecordTimeoutRef.current) {
        clearTimeout(autoRecordTimeoutRef.current);
      }
    };
  }, [
    hasPermission, 
    requestPermission, 
    startRecording, 
    stopRecording, 
    onVoiceCommand,
    startListeningForClarification,
    clearPendingAction,
    setBackgroundWakeWord,
  ]);

  // Pulsing animation for waiting-for-clarification mode
  useEffect(() => {
    if (listeningMode === 'waiting-for-clarification' && !isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [listeningMode, isRecording, pulseAnim]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePressIn = async () => {
    if (disabled || processing) return;

    // Animate press
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();

    // Request permission if needed
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        setPermissionError('Microphone permission required');
        return;
      }
    }

    // Start recording
    await startRecording();
  };

  const handlePressOut = async () => {
    if (disabled || processing) return;

    // Animate release
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    if (!isRecording) return;

    // Stop recording and get audio
    const audioBlob = await stopRecording();
    
    if (audioBlob) {
      onVoiceCommand(audioBlob);
    }
  };

  const handleCancel = async () => {
    await cancelRecording();
    
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleErrorDismiss = () => {
    clearError();
    setPermissionError(null);
  };

  const displayError = error || permissionError;
  const isDisabled = disabled || processing;

  return (
    <View style={styles.container}>
      {displayError && (
        <Pressable onPress={handleErrorDismiss} style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: errorColor }]}>{displayError}</Text>
        </Pressable>
      )}

      <Animated.View style={{ transform: [{ scale: scaleAnim }, { scale: pulseAnim }] }}>
        <Pressable
          testID="voice-button"
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
          accessibilityLabel={
            listeningMode === 'waiting-for-clarification'
              ? 'Tap to answer clarification question'
              : listeningMode === 'background-wake-word'
              ? 'Voice command button - Wake word detection active'
              : 'Voice command button'
          }
          accessibilityHint={
            listeningMode === 'waiting-for-clarification'
              ? 'Tap to record your answer'
              : 'Press and hold to record a voice command'
          }
          accessibilityState={{ disabled: isDisabled }}
          style={[
            styles.button,
            { backgroundColor: backgroundColor },
            isRecording && { backgroundColor: recordingColor },
            listeningMode === 'waiting-for-clarification' &&
              !isRecording && { backgroundColor: clarificationColor },
            (listeningMode === 'background-wake-word' || isWakeWordActive) &&
              !isRecording && { borderWidth: 3, borderColor: wakeWordColor },
            isDisabled && styles.buttonDisabled,
          ]}
        >
          {processing ? (
            <ActivityIndicator testID="processing-indicator" color={iconColor} size="large" />
          ) : isRecording ? (
            <View testID="recording-indicator" style={styles.recordingContainer}>
              <View style={[styles.recordingDot, { backgroundColor: '#fff' }]} />
              <Text style={[styles.durationText, { color: '#fff' }]}>
                {formatDuration(recordingDuration)}
              </Text>
            </View>
          ) : (
            <View style={styles.micIcon}>
              <View style={[styles.micBody, { borderColor: iconColor }]} />
              <View style={[styles.micBase, { backgroundColor: iconColor }]} />
            </View>
          )}
        </Pressable>
      </Animated.View>

      <View style={styles.feedbackContainer}>
        {isRecording && recordingDuration < 300 && (
          <Text style={[styles.holdHint, { color: iconColor }]}>Keep holding...</Text>
        )}
        {!isRecording && listeningMode === 'waiting-for-clarification' && (
          <Text style={[styles.holdHint, { color: clarificationColor }]}>
            Tap to answer...
          </Text>
        )}
        {!isRecording && listeningMode === 'background-wake-word' && (
          <Text style={[styles.holdHint, { color: wakeWordColor }]}>
            Listening for wake word...
          </Text>
        )}
      </View>

      {isRecording && (
        <Pressable testID="cancel-button" onPress={handleCancel} style={styles.cancelButton}>
          <Text style={[styles.cancelText, { color: iconColor }]}>Cancel</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  micIcon: {
    alignItems: 'center',
    gap: 4,
  },
  micBody: {
    width: 24,
    height: 32,
    borderWidth: 3,
    borderRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  micBase: {
    width: 24,
    height: 3,
    borderRadius: 1.5,
  },
  recordingContainer: {
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackContainer: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  holdHint: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
