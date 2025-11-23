/**
 * List Detail Screen (TDD - GREEN Phase)
 * Shows items in a shopping list
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShoppingListDetail, useCreateItem, useDeleteItem } from '@/hooks/use-shopping-lists';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ShoppingListItem } from '@/types/api';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const { data: list, isLoading, isError, error, refetch } = useShoppingListDetail(id!);
  const createItem = useCreateItem(id!);
  const deleteItem = useDeleteItem(id!);

  // Create item modal state
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [itemNotes, setItemNotes] = useState('');
  const [validationError, setValidationError] = useState('');

  // Delete item modal state
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ShoppingListItem | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const openCreateModal = () => {
    setIsCreateModalVisible(true);
    setItemName('');
    setItemQuantity('');
    setItemNotes('');
    setValidationError('');
    createItem.reset();
  };

  const closeCreateModal = () => {
    setIsCreateModalVisible(false);
    setItemName('');
    setItemQuantity('');
    setItemNotes('');
    setValidationError('');
    createItem.reset();
  };

  const handleCreateItem = () => {
    // Validate name
    if (!itemName.trim()) {
      setValidationError('Item name is required');
      return;
    }

    // Create item
    createItem.mutate(
      {
        name: itemName.trim(),
        quantity: itemQuantity.trim() || undefined,
        notes: itemNotes.trim() || undefined,
      },
      {
        onSuccess: () => {
          closeCreateModal();
        },
      }
    );
  };

  const openDeleteModal = (item: ShoppingListItem) => {
    setItemToDelete(item);
    setIsDeleteModalVisible(true);
    setDeleteError('');
  };

  const closeDeleteModal = () => {
    setIsDeleteModalVisible(false);
    setItemToDelete(null);
    setDeleteError('');
  };

  const handleDeleteItem = () => {
    if (!itemToDelete) return;

    deleteItem.mutate(itemToDelete.id, {
      onSuccess: () => {
        closeDeleteModal();
      },
      onError: () => {
        setDeleteError('Failed to delete item. Please try again.');
      },
    });
  };

  // Loading State
  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View style={styles.centerContainer} testID="loading-indicator">
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText style={styles.loadingText}>Loading list details...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Error State
  if (isError) {
    const is404 = (error as any)?.response?.status === 404;
    const errorMessage = is404
      ? 'List not found'
      : 'Something went wrong';
    const errorDetail = is404
      ? 'This shopping list may have been deleted.'
      : 'Please try again later.';

    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Error' }} />
        <View style={styles.centerContainer}>
          <ThemedText style={styles.errorTitle}>⚠️</ThemedText>
          <ThemedText style={styles.errorMessage}>{errorMessage}</ThemedText>
          <ThemedText style={styles.errorDetail}>{errorDetail}</ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.tint }]}
            onPress={() => refetch()}
            testID="retry-button"
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  // Empty State
  if (!list || list.items.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: list?.name || 'List' }} />
        <View style={styles.centerContainer}>
          <ThemedText style={styles.emptyTitle}>📝</ThemedText>
          <ThemedText style={styles.emptyMessage}>No items yet</ThemedText>
          <ThemedText style={styles.emptyDetail}>Add items to get started</ThemedText>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.tint }]}
            onPress={openCreateModal}
            testID="add-item-button"
          >
            <Text style={styles.addButtonText}>+ Add Item</Text>
          </TouchableOpacity>
        </View>

        {/* Create Item Modal */}
        <Modal
          visible={isCreateModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeCreateModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <ThemedText style={styles.modalTitle}>Add Item</ThemedText>

              <TextInput
                style={[
                  styles.input,
                  { 
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.background,
                  },
                ]}
                placeholder="Item name *"
                placeholderTextColor={colors.tabIconDefault}
                value={itemName}
                onChangeText={(text) => {
                  setItemName(text);
                  setValidationError('');
                }}
                testID="item-name-input"
                autoFocus
              />

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
                value={itemQuantity}
                onChangeText={setItemQuantity}
                testID="item-quantity-input"
              />

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
                value={itemNotes}
                onChangeText={setItemNotes}
                testID="item-notes-input"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              {validationError && (
                <Text style={styles.errorText} testID="validation-error">
                  {validationError}
                </Text>
              )}

              {createItem.isError && (
                <Text style={styles.errorText} testID="create-error">
                  Failed to add item. Please try again.
                </Text>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                  onPress={closeCreateModal}
                  testID="cancel-item-button"
                  disabled={createItem.isPending}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.createButton,
                    { backgroundColor: colors.tint },
                    createItem.isPending && styles.disabledButton,
                  ]}
                  onPress={handleCreateItem}
                  testID="save-item-button"
                  disabled={createItem.isPending}
                >
                  {createItem.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.createButtonText}>Add Item</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </ThemedView>
    );
  }

  // Data Display
  const renderItem = ({ item }: { item: ShoppingListItem }) => (
    <View
      style={[styles.itemCard, { borderColor: colors.border }]}
      testID={`item-${item.id}`}
    >
      <View style={styles.itemContent}>
        <ThemedText style={styles.itemName}>{item.name}</ThemedText>
        {item.quantity && (
          <ThemedText style={styles.itemQuantity}>{item.quantity}</ThemedText>
        )}
        {item.notes && (
          <ThemedText style={styles.itemNotes}>{item.notes}</ThemedText>
        )}
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => openDeleteModal(item)}
        testID={`delete-item-button-${item.id}`}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: list.name }} />
      <FlatList
        data={list.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingTop: insets.top }]}
      />
      <TouchableOpacity
        style={[styles.fabButton, { backgroundColor: colors.tint }]}
        onPress={openCreateModal}
        activeOpacity={0.7}
        testID="add-item-button"
      >
        <Text style={styles.fabButtonText}>+</Text>
      </TouchableOpacity>

      {/* Create Item Modal */}
      <Modal
        visible={isCreateModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeCreateModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <ThemedText style={styles.modalTitle}>Add Item</ThemedText>

            <TextInput
              style={[
                styles.input,
                { 
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="Item name *"
              placeholderTextColor={colors.tabIconDefault}
              value={itemName}
              onChangeText={(text) => {
                setItemName(text);
                setValidationError('');
              }}
              testID="item-name-input"
              autoFocus
            />

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
              value={itemQuantity}
              onChangeText={setItemQuantity}
              testID="item-quantity-input"
            />

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
              value={itemNotes}
              onChangeText={setItemNotes}
              testID="item-notes-input"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {validationError && (
              <Text style={styles.errorText} testID="validation-error">
                {validationError}
              </Text>
            )}

            {createItem.isError && (
              <Text style={styles.errorText} testID="create-error">
                Failed to add item. Please try again.
              </Text>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={closeCreateModal}
                testID="cancel-item-button"
                disabled={createItem.isPending}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.createButton,
                  { backgroundColor: colors.tint },
                  createItem.isPending && styles.disabledButton,
                ]}
                onPress={handleCreateItem}
                testID="save-item-button"
                disabled={createItem.isPending}
              >
                {createItem.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Add Item</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Item Confirmation Modal */}
      <Modal
        visible={isDeleteModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeDeleteModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.confirmationModal, { backgroundColor: colors.background }]}>
            <ThemedText style={styles.confirmationTitle}>Delete Item</ThemedText>
            <ThemedText style={styles.confirmationMessage}>
              Are you sure you want to delete "{itemToDelete?.name}"?
            </ThemedText>

            {deleteError && (
              <Text style={styles.errorText} testID="delete-error">
                {deleteError}
              </Text>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={closeDeleteModal}
                testID="cancel-delete-button"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteConfirmButton]}
                onPress={handleDeleteItem}
                testID="confirm-delete-button"
                disabled={deleteItem.isPending}
              >
                {deleteItem.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.deleteConfirmButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minHeight: 44,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDetail: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
    textAlign: 'center',
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minHeight: 44,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  itemCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  itemNotes: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  fabButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabButtonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
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
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  confirmationModal: {
    margin: 20,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  confirmationMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  deleteConfirmButton: {
    backgroundColor: '#ff3b30',
  },
  deleteConfirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
