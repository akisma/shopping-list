/**
 * Reusable Item Form Modal Component
 * 
 * Handles both creating new items and editing existing items.
 * Consolidates validation, error handling, and loading states.
 * Follows React Native composition patterns for maintainable code.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface ItemFormData {
  name: string;
  quantity?: string;
  notes?: string;
}

interface ItemFormModalProps {
  /** Controls modal visibility */
  visible: boolean;
  /** Mode: 'create' for new items, 'edit' for existing items */
  mode: 'create' | 'edit';
  /** Initial data for edit mode (pre-fills form fields) */
  initialData?: ItemFormData;
  /** Callback when form is submitted with valid data */
  onSave: (data: ItemFormData) => void;
  /** Callback when cancel is pressed or modal is dismissed */
  onCancel: () => void;
  /** Whether the save operation is in progress */
  isLoading?: boolean;
  /** Error message to display (e.g., from failed API call) */
  error?: string | null;
  /** Validation error for name field */
  validationError?: string;
  /** TestID for the save button */
  saveTestID?: string;
  /** TestID for the cancel button */
  cancelTestID?: string;
  /** TestID for name input */
  nameInputTestID?: string;
  /** TestID for quantity input */
  quantityInputTestID?: string;
  /** TestID for notes input */
  notesInputTestID?: string;
  /** TestID for validation error */
  validationErrorTestID?: string;
  /** TestID for API error */
  errorTestID?: string;
}

export function ItemFormModal({
  visible,
  mode,
  initialData,
  onSave,
  onCancel,
  isLoading = false,
  error,
  validationError,
  saveTestID = 'save-item-button',
  cancelTestID = 'cancel-item-button',
  nameInputTestID = 'item-name-input',
  quantityInputTestID = 'item-quantity-input',
  notesInputTestID = 'item-notes-input',
  validationErrorTestID = 'validation-error',
  errorTestID = 'create-error',
}: ItemFormModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const nameInputRef = useRef<TextInput>(null);

  // Form state
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  // Reset form when modal opens/closes or when initialData changes
  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialData) {
        setName(initialData.name);
        setQuantity(initialData.quantity || '');
        setNotes(initialData.notes || '');
      } else {
        setName('');
        setQuantity('');
        setNotes('');
      }
    }
  }, [visible, mode, initialData]);

  // Auto-focus name input when modal opens
  useEffect(() => {
    if (visible) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [visible]);

  const handleSave = () => {
    onSave({
      name: name.trim(),
      quantity: quantity.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const title = mode === 'create' ? 'Add Item' : 'Edit Item';
  const saveButtonText = mode === 'create' ? 'Add Item' : 'Save Changes';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <ThemedText style={styles.title}>{title}</ThemedText>

          {/* Name Input */}
          <TextInput
            ref={nameInputRef}
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="Item name"
            placeholderTextColor={colors.tabIconDefault}
            value={name}
            onChangeText={setName}
            testID={nameInputTestID}
            autoCapitalize="sentences"
            returnKeyType="next"
          />

          {/* Quantity Input */}
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="Quantity (optional)"
            placeholderTextColor={colors.tabIconDefault}
            value={quantity}
            onChangeText={setQuantity}
            testID={quantityInputTestID}
            autoCapitalize="none"
            returnKeyType="next"
          />

          {/* Notes Input */}
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="Notes (optional)"
            placeholderTextColor={colors.tabIconDefault}
            value={notes}
            onChangeText={setNotes}
            testID={notesInputTestID}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Validation Error */}
          {validationError && (
            <Text style={styles.errorText} testID={validationErrorTestID}>
              {validationError}
            </Text>
          )}

          {/* API Error */}
          {error && (
            <Text style={styles.errorText} testID={errorTestID}>
              {error}
            </Text>
          )}

          {/* Action Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
              onPress={onCancel}
              testID={cancelTestID}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                { backgroundColor: colors.tint },
                isLoading && styles.disabledButton,
              ]}
              onPress={handleSave}
              testID={saveTestID}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>{saveButtonText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    minHeight: 44,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
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
  saveButton: {
    // backgroundColor set dynamically from colors.tint
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
