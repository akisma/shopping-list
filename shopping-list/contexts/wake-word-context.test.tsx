/**
 * WakeWordProvider Tests (TDD - RED Phase)
 * Tests for the context provider that manages wake word state across the app
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
    wakePhrase,
    detectedCommand,
    startListening,
    stopListening,
    setEnabled,
    processTranscript,
    resetDetection,
  } = useWakeWordContext();

  return (
    <View testID="test-consumer">
      <Text testID="status">{status}</Text>
      <Text testID="is-listening">{isListening ? 'listening' : 'not-listening'}</Text>
      <Text testID="enabled">{enabled ? 'enabled' : 'disabled'}</Text>
      <Text testID="wake-phrase">{wakePhrase}</Text>
      <Text testID="detected-command">{detectedCommand ?? 'none'}</Text>
      <TouchableOpacity testID="start-btn" onPress={startListening}>
        <Text>Start</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="stop-btn" onPress={stopListening}>
        <Text>Stop</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="enable-btn" onPress={() => setEnabled(true)}>
        <Text>Enable</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="disable-btn" onPress={() => setEnabled(false)}>
        <Text>Disable</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="process-btn" onPress={() => processTranscript('hey shoppy add milk')}>
        <Text>Process</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="reset-btn" onPress={resetDetection}>
        <Text>Reset</Text>
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
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => render(<TestConsumer />)).toThrow(
        'useWakeWordContext must be used within a WakeWordProvider'
      );

      console.error = originalError;
    });
  });

  describe('initial state', () => {
    it('has idle status initially', () => {
      render(
        <WakeWordProvider>
          <TestConsumer />
        </WakeWordProvider>
      );

      expect(screen.getByTestId('status')).toHaveTextContent('idle');
    });

    it('is not listening initially', () => {
      render(
        <WakeWordProvider>
          <TestConsumer />
        </WakeWordProvider>
      );

      expect(screen.getByTestId('is-listening')).toHaveTextContent('not-listening');
    });

    it('is enabled by default', () => {
      render(
        <WakeWordProvider>
          <TestConsumer />
        </WakeWordProvider>
      );

      expect(screen.getByTestId('enabled')).toHaveTextContent('enabled');
    });

    it('has correct wake phrase', () => {
      render(
        <WakeWordProvider>
          <TestConsumer />
        </WakeWordProvider>
      );

      expect(screen.getByTestId('wake-phrase')).toHaveTextContent('hey shoppy');
    });

    it('has no detected command initially', () => {
      render(
        <WakeWordProvider>
          <TestConsumer />
        </WakeWordProvider>
      );

      expect(screen.getByTestId('detected-command')).toHaveTextContent('none');
    });
  });

  describe('start/stop listening', () => {
    it('starts listening when startListening is called', () => {
      render(
        <WakeWordProvider>
          <TestConsumer />
        </WakeWordProvider>
      );

      fireEvent.press(screen.getByTestId('start-btn'));

      expect(screen.getByTestId('status')).toHaveTextContent('listening');
      expect(screen.getByTestId('is-listening')).toHaveTextContent('listening');
    });

    it('stops listening when stopListening is called', () => {
      render(
        <WakeWordProvider>
          <TestConsumer />
        </WakeWordProvider>
      );

      fireEvent.press(screen.getByTestId('start-btn'));
      fireEvent.press(screen.getByTestId('stop-btn'));

      expect(screen.getByTestId('status')).toHaveTextContent('idle');
      expect(screen.getByTestId('is-listening')).toHaveTextContent('not-listening');
    });
  });

  describe('enable/disable', () => {
    it('disables wake word detection', () => {
      render(
        <WakeWordProvider>
          <TestConsumer />
        </WakeWordProvider>
      );

      fireEvent.press(screen.getByTestId('disable-btn'));

      expect(screen.getByTestId('enabled')).toHaveTextContent('disabled');
    });

    it('re-enables wake word detection', () => {
      render(
        <WakeWordProvider>
          <TestConsumer />
        </WakeWordProvider>
      );

      fireEvent.press(screen.getByTestId('disable-btn'));
      fireEvent.press(screen.getByTestId('enable-btn'));

      expect(screen.getByTestId('enabled')).toHaveTextContent('enabled');
    });
  });

  describe('wake word detection', () => {
    it('detects wake word and updates detected command', () => {
      render(
        <WakeWordProvider>
          <TestConsumer />
        </WakeWordProvider>
      );

      fireEvent.press(screen.getByTestId('start-btn'));
      fireEvent.press(screen.getByTestId('process-btn'));

      expect(screen.getByTestId('status')).toHaveTextContent('detected');
      expect(screen.getByTestId('detected-command')).toHaveTextContent('add milk');
    });

    it('resets detection state', () => {
      render(
        <WakeWordProvider>
          <TestConsumer />
        </WakeWordProvider>
      );

      fireEvent.press(screen.getByTestId('start-btn'));
      fireEvent.press(screen.getByTestId('process-btn'));
      fireEvent.press(screen.getByTestId('reset-btn'));

      expect(screen.getByTestId('status')).toHaveTextContent('listening');
      expect(screen.getByTestId('detected-command')).toHaveTextContent('none');
    });
  });

  describe('onWakeWordDetected callback', () => {
    it('calls onWakeWordDetected when wake word is detected', () => {
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
