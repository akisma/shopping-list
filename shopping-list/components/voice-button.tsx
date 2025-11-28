import React, { useState } from 'react';
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

  const iconColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const errorColor = '#ef4444';
  const recordingColor = '#ef4444';

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

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          testID="voice-button"
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
          accessibilityLabel="Voice command button"
          accessibilityHint="Press and hold to record a voice command"
          accessibilityState={{ disabled: isDisabled }}
          style={[
            styles.button,
            { backgroundColor: backgroundColor },
            isRecording && { backgroundColor: recordingColor },
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
