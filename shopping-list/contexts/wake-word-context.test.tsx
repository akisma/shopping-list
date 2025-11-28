/**
 * WakeWordProvider Tests
 * Tests for context provider that shares wake word state across the app
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { WakeWordProvider, useWakeWordContext } from './wake-word-context';

// Test component to interact with the context
function TestConsumer() {
  const {
    status,
    isListening,
    enabled,
    detectedCommand,
    startListening,
    stopListening,
    setEnabled,
    processTranscript,
  } = useWakeWordContext();

  return (
    <View testID="test-consumer">
      <Text testID="status">{status}</Text>
      <Text testID="is-listening">{isListening ? 'listening' : 'not-listening'}</Text>
      <Text testID="enabled">{enabled ? 'enabled' : 'disabled'}</Text>
      <Text testID="detected-command">{detectedCommand ?? 'none'}</Text>
      <TouchableOpacity testID="start-btn" onPress={startListening}>
        <Text>Start</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="stop-btn" onPress={stopListening}>
        <Text>Stop</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="disable-btn" onPress={() => setEnabled(false)}>
        <Text>Disable</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="process-btn" onPress={() => processTranscript('hey shoppy add milk')}>
        <Text>Process</Text>
      </TouchableOpacity>
    </View>
  );
}

describe('WakeWordProvider', () => {
  describe('context availability', () => {
    it('provides context to children', () => {
      render(
        <WakeWordProvider>
          <TestConsumer />
        </WakeWordProvider>
      );

      expect(screen.getByTestId('test-consumer')).toBeTruthy();
    });

    it('throws error when used outside provider', () => {
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => render(<TestConsumer />)).toThrow(
        'useWakeWordContext must be used within a WakeWordProvider'
      );

      console.error = originalError;
    });
  });

  describe('state sharing', () => {
    it('shares listening state changes across consumers', () => {
      render(
        <WakeWordProvider>
          <TestConsumer />
        </WakeWordProvider>
      );

      fireEvent.press(screen.getByTestId('start-btn'));
      expect(screen.getByTestId('status')).toHaveTextContent('listening');

      fireEvent.press(screen.getByTestId('stop-btn'));
      expect(screen.getByTestId('status')).toHaveTextContent('idle');
    });

    it('processes wake word and updates detected command', () => {
      render(
        <WakeWordProvider>
          <TestConsumer />
        </WakeWordProvider>
      );

      fireEvent.press(screen.getByTestId('start-btn'));
      fireEvent.press(screen.getByTestId('process-btn'));

      expect(screen.getByTestId('detected-command')).toHaveTextContent('add milk');
    });
  });

  describe('callback integration', () => {
    it('calls onWakeWordDetected prop when wake word is detected', () => {
      const mockCallback = jest.fn();

      render(
        <WakeWordProvider onWakeWordDetected={mockCallback}>
          <TestConsumer />
        </WakeWordProvider>
      );

      fireEvent.press(screen.getByTestId('start-btn'));
      fireEvent.press(screen.getByTestId('process-btn'));

      expect(mockCallback).toHaveBeenCalledWith('add milk');
    });
  });
});
