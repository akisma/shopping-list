/**
 * VoiceActivationBanner Component (TDD - GREEN Phase)
 * Persistent banner showing voice activation status
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface VoiceActivationBannerProps {
  visible: boolean;
  isListening?: boolean;
}

export function VoiceActivationBanner({ visible, isListening = false }: VoiceActivationBannerProps) {
  if (!visible) {
    return null;
  }

  return (
    <View testID="voice-activation-banner" style={styles.banner}>
      <Text style={styles.text}>
        🎤 Voice Activation On - {isListening ? 'Listening...' : 'Say "Hey Shoppy" to start'}
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
});
