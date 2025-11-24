/**
 * VoiceStatusIndicator Component (TDD - GREEN Phase)
 * Reusable voice button with multiple visual states
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

export type VoiceStatus = 'coming-soon' | 'ready' | 'listening' | 'processing';

interface VoiceStatusIndicatorProps {
  status: VoiceStatus;
  onPress?: () => void;
}

export function VoiceStatusIndicator({ status, onPress }: VoiceStatusIndicatorProps) {
  const getBackgroundColor = (): string => {
    switch (status) {
      case 'coming-soon':
        return '#E0E0E0'; // Gray
      case 'ready':
        return '#4CAF50'; // Green
      case 'listening':
        return '#f44336'; // Red
      case 'processing':
        return '#FFC107'; // Yellow
      default:
        return '#E0E0E0';
    }
  };

  const buttonStyle: ViewStyle = {
    ...styles.button,
    backgroundColor: getBackgroundColor(),
  };

  return (
    <TouchableOpacity
      testID="voice-status-indicator"
      style={buttonStyle}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>🎤</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
});
