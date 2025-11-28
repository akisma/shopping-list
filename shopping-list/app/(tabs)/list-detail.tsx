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
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShoppingListDetail, useCreateItem, useDeleteItem, useUpdateItem, useSendShoppingList } from '@/hooks/use-shopping-lists';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { ItemFormModal, type ItemFormData } from '@/components/ui/item-form-modal';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ShoppingListItem } from '@/types/api';
import { VoiceStatusIndicator } from '@/components/VoiceStatusIndicator';
import { VoiceActivationBanner } from '@/components/VoiceActivationBanner';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const { data: list, isLoading, isError, error, refetch, isRefetching } = useShoppingListDetail(id!);
  const createItem = useCreateItem(id!);
  const deleteItem = useDeleteItem(id!);
  const updateItem = useUpdateItem(id!);
  const sendShoppingList = useSendShoppingList();

  // Create item modal state
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Send list modal state
  const [isSendModalVisible, setIsSendModalVisible] = useState(false);

  // Edit item modal state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ShoppingListItem | null>(null);

  // Delete item modal state
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ShoppingListItem | null>(null);
  const [deleteError, setDeleteError] = useState('');

  // Voice activation state (stub - will be functional in Task 4)
  const [voiceActivationEnabled] = useState(false);

  const handleVoicePress = () => {
    Alert.alert(
      'Voice Commands Coming Soon',
      'Voice-powered item adding will be available in the next update. Say "Hey Shoppy, add tomatoes" to get started!',
      [{ text: 'OK' }]
    );
  };

  // Get status badge details
  const getStatusBadgeInfo = () => {
    if (!list) return { text: 'Active', color: '#2196F3' };
    
    switch (list.status) {
      case 'sent':
        return { text: 'Sent to Manager', color: '#4CAF50' };
      case 'completed':
        return { text: 'Completed', color: '#9E9E9E' };
      case 'active':
      default:
        return { text: 'Active', color: '#2196F3' };
    }
  };

  const openCreateModal = () => {
    setIsCreateModalVisible(true);
    setValidationError('');
    createItem.reset();
  };

  const closeCreateModal = () => {
    setIsCreateModalVisible(false);
    setValidationError('');
    createItem.reset();
  };

  const handleCreateItem = (data: ItemFormData) => {
    // Validate name
    if (!data.name.trim()) {
      setValidationError('Item name is required');
      return;
    }

    // Create item
    createItem.mutate(data, {
      onSuccess: () => {
        closeCreateModal();
      },
    });
  };

  const openEditModal = (item: ShoppingListItem) => {
    setItemToEdit(item);
    setIsEditModalVisible(true);
    setValidationError('');
    updateItem.reset();
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setItemToEdit(null);
    setValidationError('');
    updateItem.reset();
  };

  const handleUpdateItem = (data: ItemFormData) => {
    // Validate name
    if (!data.name.trim()) {
      setValidationError('Item name is required');
      return;
    }

    if (!itemToEdit) return;

    // Update item
    updateItem.mutate(
      {
        itemId: itemToEdit.id,
        data,
      },
      {
        onSuccess: () => {
          closeEditModal();
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

  const openSendModal = () => {
    setIsSendModalVisible(true);
    sendShoppingList.reset();
  };

  const closeSendModal = () => {
    setIsSendModalVisible(false);
    sendShoppingList.reset();
  };

  const handleSendList = () => {
    sendShoppingList.mutate(
      { id: id!, status: 'sent' },
      {
        onSuccess: () => {
          closeSendModal();
          Alert.alert(
            'List Sent!',
            'Your shopping list has been sent to the manager.'
          );
        },
      }
    );
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
        
        {/* Voice Activation Banner */}
        <VoiceActivationBanner visible={voiceActivationEnabled} />
        
        {/* Header with Voice Button and Status Badge */}
        {list && (
          <View style={styles.header}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeInfo().color }]} testID="status-badge">
              <Text style={styles.statusBadgeText}>{getStatusBadgeInfo().text}</Text>
            </View>
            <VoiceStatusIndicator status="coming-soon" onPress={handleVoicePress} />
          </View>
        )}
        
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
        <ItemFormModal
          visible={isCreateModalVisible}
          mode="create"
          onSave={handleCreateItem}
          onCancel={closeCreateModal}
          isLoading={createItem.isPending}
          error={createItem.isError ? 'Failed to add item. Please try again.' : null}
          validationError={validationError}
        />
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
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
          testID={`edit-item-button-${item.id}`}
        >
          <Text style={styles.editButtonText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => openDeleteModal(item)}
          testID={`delete-item-button-${item.id}`}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Determine if send button should be shown
  const canSendList = list.items.length > 0 && list.status === 'active';

  const statusBadgeInfo = getStatusBadgeInfo();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: list.name }} />
      
      {/* Voice Activation Banner */}
      <VoiceActivationBanner visible={voiceActivationEnabled} />
      
      {/* Header with Voice Button and Status Badge */}
      <View style={styles.header}>
        <View style={[styles.statusBadge, { backgroundColor: statusBadgeInfo.color }]} testID="status-badge">
          <Text style={styles.statusBadgeText}>{statusBadgeInfo.text}</Text>
        </View>
        <VoiceStatusIndicator status="coming-soon" onPress={handleVoicePress} />
      </View>

      {/* Error message for send */}
      {sendShoppingList.isError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to send list. Please try again.</Text>
        </View>
      )}

      <FlatList
        testID="list-items-flatlist"
        data={list.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingTop: insets.top + 50 }]}
        refreshing={isRefetching ?? false}
        onRefresh={refetch}
      />
      
      {/* Send to Manager Button (only show if list has items and is active) */}
      {canSendList && (
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: '#4CAF50' }]}
          onPress={openSendModal}
          activeOpacity={0.7}
          testID="send-to-manager-button"
        >
          <Text style={styles.sendButtonText}>📤 Send to Manager</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.fabButton, { backgroundColor: colors.tint }]}
        onPress={openCreateModal}
        activeOpacity={0.7}
        testID="add-item-button"
      >
        <Text style={styles.fabButtonText}>+</Text>
      </TouchableOpacity>

      {/* Create Item Modal */}
      <ItemFormModal
        visible={isCreateModalVisible}
        mode="create"
        onSave={handleCreateItem}
        onCancel={closeCreateModal}
        isLoading={createItem.isPending}
        error={createItem.isError ? 'Failed to add item. Please try again.' : null}
        validationError={validationError}
      />

      {/* Edit Item Modal */}
      <ItemFormModal
        visible={isEditModalVisible}
        mode="edit"
        initialData={itemToEdit ? {
          name: itemToEdit.name,
          quantity: itemToEdit.quantity || '',
          notes: itemToEdit.notes || '',
        } : undefined}
        onSave={handleUpdateItem}
        onCancel={closeEditModal}
        isLoading={updateItem.isPending}
        error={updateItem.isError ? 'Failed to update item. Please try again.' : null}
        validationError={validationError}
      />

      {/* Delete Item Confirmation Modal */}
      <ConfirmationModal
        visible={isDeleteModalVisible}
        title="Delete Item"
        message={`Are you sure you want to delete "${itemToDelete?.name}"?`}
        confirmText="Delete"
        onConfirm={handleDeleteItem}
        onCancel={closeDeleteModal}
        isLoading={deleteItem.isPending}
        error={deleteError}
        confirmTestID="confirm-delete-button"
        cancelTestID="cancel-delete-button"
        errorTestID="delete-error"
      />

      {/* Send List Confirmation Modal */}
      <ConfirmationModal
        visible={isSendModalVisible}
        title="Send to Manager?"
        message={`Send "${list.name}" to the manager for ordering?`}
        confirmText="Send"
        onConfirm={handleSendList}
        onCancel={closeSendModal}
        isLoading={sendShoppingList.isPending}
        error={sendShoppingList.isError ? 'Failed to send list. Please try again.' : null}
        confirmTestID="confirm-send-button"
        cancelTestID="cancel-send-button"
      />
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
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
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
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 4,
  },
  editButtonText: {
    fontSize: 20,
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
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    zIndex: 100,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 50,
    borderRadius: 8,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
  sendButton: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    elevation: 4,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    minHeight: 44,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
