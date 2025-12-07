/**
 * VoiceActivationBanner Component (TDD - GREEN Phase)
 * Persistent banner showing voice activation status or clarification questions
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useVoiceListeningContext } from '../hooks/use-voice-listening-context';

interface VoiceActivationBannerProps {
  visible: boolean;
}

export function VoiceActivationBanner({ visible }: VoiceActivationBannerProps) {
  const { listeningMode, pendingAction, clearPendingAction, isWakeWordActive } = useVoiceListeningContext();

  if (!visible) {
    return null;
  }

  // Show clarification mode banner when waiting for clarification
  if (listeningMode === 'waiting-for-clarification' && pendingAction) {
    return (
      <View testID="voice-activation-banner" style={styles.clarificationBanner}>
        <Text style={styles.clarificationText}>
          {pendingAction.question}
        </Text>
        <TouchableOpacity 
          onPress={clearPendingAction}
          style={styles.cancelButton}
          accessibilityRole="button"
          accessibilityLabel="Cancel clarification"
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show wake word detected banner (3-second flash)
  if (isWakeWordActive) {
    return (
      <View testID="voice-activation-banner" style={styles.wakeWordBanner}>
        <Text style={styles.wakeWordText}>
          🎤 Ready! Speak your command now
        </Text>
      </View>
    );
  }

  // Show active wake word banner when in background-wake-word mode
  if (listeningMode === 'background-wake-word') {
    return (
      <View testID="voice-activation-banner" style={styles.wakeWordBanner}>
        <Text style={styles.wakeWordText}>
          🎤 Say "Picovoice" + your command
        </Text>
      </View>
    );
  }

  // Show inactive banner (coming soon)
  return (
    <View testID="voice-activation-banner" style={styles.banner}>
      <Text style={styles.text}>
        🎤 Voice Activation On - Say &ldquo;Hey Shoppy&rdquo; to start (Coming Soon)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4CAF50',
  },
  text: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
  },
  wakeWordBanner: {
    backgroundColor: '#E3F2FD', // Light blue for active wake word
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2196F3',
  },
  wakeWordText: {
    fontSize: 14,
    color: '#1565C0',
    textAlign: 'center',
    fontWeight: '500',
  },
  clarificationBanner: {
    backgroundColor: '#FFF3CD', // Amber/yellow for attention
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFC107',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clarificationText: {
    fontSize: 15,
    color: '#856404',
    flex: 1,
    fontWeight: '500',
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#856404',
    marginLeft: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '600',
  },
});
