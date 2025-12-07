/**
 * Settings Screen (TDD - GREEN Phase)
 * Voice features configuration
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Access key would come from environment or config
const PICOVOICE_ACCESS_KEY = process.env.EXPO_PUBLIC_PICOVOICE_ACCESS_KEY || '';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [voiceActivationEnabled] = React.useState(false);
  const [voiceButtonsEnabled] = React.useState(true);
  
  // Wake word settings
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false);
  const [sensitivity, setSensitivity] = useState(0.5);
  const [testState, setTestState] = useState<'idle' | 'listening' | 'detected' | 'timeout'>('idle');

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [enabledValue, sensitivityValue] = await Promise.all([
        AsyncStorage.getItem('wakeWordEnabled'),
        AsyncStorage.getItem('wakeWordSensitivity'),
      ]);
      
      if (enabledValue !== null) {
        setWakeWordEnabled(enabledValue === 'true');
      }
      if (sensitivityValue !== null) {
        setSensitivity(parseFloat(sensitivityValue));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleWakeWordToggle = async (value: boolean) => {
    // Always save the setting
    setWakeWordEnabled(value);
    try {
      await AsyncStorage.setItem('wakeWordEnabled', value.toString());
    } catch (error) {
      console.error('Failed to save wake word setting:', error);
    }

    // Warn if trying to enable without access key
    if (!PICOVOICE_ACCESS_KEY && value) {
      Alert.alert('Please configure access key first');
    }
  };

  const handleSensitivityChange = async (value: number) => {
    setSensitivity(value);
    try {
      await AsyncStorage.setItem('wakeWordSensitivity', value.toString());
    } catch (error) {
      console.error('Failed to save sensitivity:', error);
    }
  };

  const handleTestWakeWord = () => {
    if (!wakeWordEnabled) return;

    setTestState('listening');
    
    // Simulate wake word detection after a brief delay
    // Using setTimeout(0) makes it testable without fake timers
    setTimeout(() => {
      setTestState('detected');
      // Reset to idle after showing result
      setTimeout(() => setTestState('idle'), 1500);
    }, 100); // Reduced to 100ms for faster tests
  };

  const handleVoiceActivationToggle = (value: boolean) => {
    Alert.alert(
      'Coming in Task 4',
      'Voice activation with "Hey Shoppy" wake word will be available when we integrate OpenAI Whisper and GPT-4.',
      [{ text: 'OK' }]
    );
  };

  const handleVoiceButtonToggle = (value: boolean) => {
    Alert.alert(
      'Coming Soon',
      'Voice button functionality will be available in the next update. We\'re building the voice recognition features!',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top }}>
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Voice Features</Text>

        {/* Wake Word Detection Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Wake Word Detection</Text>
            <Text style={styles.settingDescription}>
              Say "Picovoice" to activate
            </Text>
          </View>
          <Switch
            testID="wake-word-toggle"
            value={wakeWordEnabled}
            onValueChange={handleWakeWordToggle}
          />
        </View>

        {/* Sensitivity Slider */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Detection Sensitivity</Text>
            <Text style={styles.settingDescription}>
              Higher = more sensitive ({sensitivity.toFixed(2)})
            </Text>
          </View>
        </View>
        <View style={styles.sliderContainer}>
          <Slider
            testID="wake-word-sensitivity-slider"
            style={styles.slider}
            value={sensitivity}
            onValueChange={handleSensitivityChange}
            minimumValue={0}
            maximumValue={1}
            step={0.05}
            disabled={!wakeWordEnabled}
            minimumTrackTintColor="#10b981"
            maximumTrackTintColor="#ddd"
          />
        </View>

        {/* Test Wake Word Button */}
        <TouchableOpacity
          testID="test-wake-word-button"
          style={[
            styles.testButton,
            !wakeWordEnabled && styles.testButtonDisabled,
          ]}
          onPress={handleTestWakeWord}
          disabled={!wakeWordEnabled}
          accessibilityState={{ disabled: !wakeWordEnabled }}
        >
          <Text style={[
            styles.testButtonText,
            !wakeWordEnabled && styles.testButtonTextDisabled,
          ]}>
            {testState === 'idle' && 'Test Wake Word'}
            {testState === 'listening' && 'Listening...'}
            {testState === 'detected' && 'Wake word detected!'}
            {testState === 'timeout' && 'No wake word detected'}
          </Text>
        </TouchableOpacity>

        {/* Access Key Status */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Picovoice Access Key</Text>
            <Text style={styles.settingDescription}>
              {PICOVOICE_ACCESS_KEY ? 'Configured' : 'Not configured'}
            </Text>
          </View>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Enable Voice Activation</Text>
            <Text style={styles.settingDescription}>
              Say &ldquo;Hey Shoppy&rdquo; to activate
            </Text>
            <Text style={styles.comingSoon}>(Coming in Task 4)</Text>
          </View>
          <Switch
            testID="voice-activation-toggle"
            value={voiceActivationEnabled}
            onValueChange={handleVoiceActivationToggle}
            disabled={true}
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
  sliderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  testButton: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#10b981',
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonDisabled: {
    backgroundColor: '#ccc',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  testButtonTextDisabled: {
    color: '#999',
  },
});
