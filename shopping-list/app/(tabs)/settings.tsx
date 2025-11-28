/**
 * Settings Screen (TDD - GREEN Phase)
 * Voice features configuration
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { useWakeWordContext } from '@/contexts/wake-word-context';

// Try to get wake word context, return null if not available
function useTryWakeWordContext() {
  try {
    return useWakeWordContext();
  } catch {
    return null;
  }
}

export default function SettingsScreen() {
  const wakeWord = useTryWakeWordContext();
  const [voiceButtonsEnabled] = React.useState(true);

  // Use wake word context if available, otherwise fall back to stub behavior
  const voiceActivationEnabled = wakeWord?.enabled ?? false;
  const isWakeWordAvailable = wakeWord !== null;

  const handleVoiceActivationToggle = (value: boolean) => {
    if (wakeWord) {
      wakeWord.setEnabled(value);
    } else {
      Alert.alert(
        'Coming in Task 4',
        'Voice activation with "Hey Shoppy" wake word will be available when we integrate OpenAI Whisper and GPT-4.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleVoiceButtonToggle = (value: boolean) => {
    Alert.alert(
      'Coming Soon',
      'Voice button functionality will be available in the next update. We\'re building the voice recognition features!',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Voice Features</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Enable Voice Activation</Text>
            <Text style={styles.settingDescription}>
              Say &ldquo;Hey Shoppy&rdquo; to activate
            </Text>
            {isWakeWordAvailable ? (
              <Text style={voiceActivationEnabled ? styles.statusEnabled : styles.statusDisabled}>
                {voiceActivationEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            ) : (
              <Text style={styles.comingSoon}>(Coming in Task 4)</Text>
            )}
          </View>
          <Switch
            testID="voice-activation-toggle"
            value={voiceActivationEnabled}
            onValueChange={handleVoiceActivationToggle}
            disabled={!isWakeWordAvailable}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Voice Button on Lists</Text>
            <Text style={styles.settingDescription}>
              Tap microphone button
            </Text>
            <Text style={styles.comingSoon}>(Coming Soon)</Text>
          </View>
          <Switch
            testID="voice-button-toggle"
            value={voiceButtonsEnabled}
            onValueChange={handleVoiceButtonToggle}
            disabled={true}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  comingSoon: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  statusEnabled: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  statusDisabled: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '500',
  },
});
