/**
 * Reusable Confirmation Modal Component
 * 
 * A modal for confirming destructive actions with customizable messaging.
 * Follows React Native best practices for component composition and reusability.
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ConfirmationModalProps {
  /** Controls modal visibility */
  visible: boolean;
  /** Modal title (e.g., "Delete Item") */
  title: string;
  /** Confirmation message to display */
  message: string;
  /** Text for the confirm button (e.g., "Delete", "Remove") */
  confirmText: string;
  /** Text for the cancel button (default: "Cancel") */
  cancelText?: string;
  /** Callback when confirm button is pressed */
  onConfirm: () => void;
  /** Callback when cancel button is pressed or modal is dismissed */
  onCancel: () => void;
  /** Whether the action is in progress (shows spinner) */
  isLoading?: boolean;
  /** Error message to display below the confirmation message */
  error?: string | null;
  /** TestID for the confirm button */
  confirmTestID?: string;
  /** TestID for the cancel button */
  cancelTestID?: string;
  /** TestID for the error message */
  errorTestID?: string;
}

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  error,
  confirmTestID = 'confirm-button',
  cancelTestID = 'cancel-button',
  errorTestID = 'error-message',
}: ConfirmationModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.message}>{message}</ThemedText>

          {error && (
            <Text style={styles.errorText} testID={errorTestID}>
              {error}
            </Text>
          )}

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
              onPress={onCancel}
              testID={cancelTestID}
              disabled={isLoading}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                isLoading && styles.disabledButton,
              ]}
              onPress={onConfirm}
              testID={confirmTestID}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    margin: 20,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 280,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#ff3b30',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
