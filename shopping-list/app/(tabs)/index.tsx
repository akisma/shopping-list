/**
 * Shopping Lists Screen (TDD - GREEN Phase)
 * Main screen displaying all shopping lists
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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useShoppingLists, useCreateShoppingList, useDeleteShoppingList } from '@/hooks/use-shopping-lists';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { VoiceStatusIndicator, VoiceStatus } from '@/components/VoiceStatusIndicator';
import { VoiceActivationBanner } from '@/components/VoiceActivationBanner';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWakeWordContext } from '@/contexts/wake-word-context';
import type { ShoppingListWithCount } from '@/types/api';

// Try to get wake word context, return null if not available
function useTryWakeWordContext() {
  try {
    return useWakeWordContext();
  } catch {
    return null;
  }
}

export default function ShoppingListsScreen() {
  const router = useRouter();
  const { data: lists, isLoading, isError, error, refetch } = useShoppingLists();
  const createMutation = useCreateShoppingList();
  const deleteMutation = useDeleteShoppingList();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const wakeWord = useTryWakeWordContext();
  
  // Create modal state
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [validationError, setValidationError] = useState('');
  
  // Delete confirmation state
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [listToDelete, setListToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState('');

  // Voice activation state - use wake word context if available
  const voiceActivationEnabled = wakeWord?.enabled ?? false;

  // Get voice status based on wake word context
  const getVoiceStatus = (): VoiceStatus => {
    if (!wakeWord) return 'coming-soon';
    switch (wakeWord.status) {
      case 'listening':
        return 'listening';
      case 'detected':
        return 'processing';
      default:
        return 'ready';
    }
  };

  // Handle voice button press
  const handleVoicePress = () => {
    if (wakeWord) {
      if (wakeWord.isListening) {
        wakeWord.stopListening();
      } else {
        wakeWord.startListening();
      }
    } else {
      Alert.alert(
        'Voice Commands Coming Soon',
        'Voice-powered list creation will be available in the next update. Say "Hey Shoppy" to get started!',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle create list
  const handleCreateList = () => {
    // Validation
    if (!newListName.trim()) {
      setValidationError('List name is required');
      return;
    }

    // Create list
    createMutation.mutate(
      { name: newListName.trim() },
      {
        onSuccess: () => {
          // Close modal and reset form
          setIsCreateModalVisible(false);
          setNewListName('');
          setValidationError('');
        },
        onError: () => {
          setValidationError('Failed to create list. Please try again.');
        },
      }
    );
  };

  const openCreateModal = () => {
    setIsCreateModalVisible(true);
    setNewListName('');
    setValidationError('');
    createMutation.reset();
  };

  // Handle delete list
  const openDeleteConfirm = (id: string, name: string) => {
    setListToDelete({ id, name });
    setDeleteConfirmVisible(true);
    setDeleteError('');
  };

  const handleDeleteList = () => {
    if (!listToDelete) return;

    deleteMutation.mutate(listToDelete.id, {
      onSuccess: () => {
        setDeleteConfirmVisible(false);
        setListToDelete(null);
        setDeleteError('');
      },
      onError: () => {
        setDeleteError('Failed to delete list. Please try again.');
      },
    });
  };

  const cancelDelete = () => {
    setDeleteConfirmVisible(false);
    setListToDelete(null);
    setDeleteError('');
  };

  // Check if error is a network/backend connectivity issue
  const isBackendDown = isError && (
    error?.message?.includes('ECONNREFUSED') ||
    error?.message?.includes('Network Error') ||
    error?.message?.includes('timeout')
  );

  // Loading State
  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator
          testID="loading-indicator"
          size="large"
          color={colors.tint}
        />
        <ThemedText style={styles.loadingText}>Loading lists...</ThemedText>
      </ThemedView>
    );
  }

  // Backend Down - Show warning but allow UI exploration
  if (isBackendDown) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={styles.warningTitle}>⚠️ Backend Unavailable</ThemedText>
        <ThemedText style={styles.warningMessage}>
          Warning: Cannot communicate with backend.{'\n'}
          All functionality is currently unavailable.
        </ThemedText>
        <ThemedText style={styles.warningDetail}>
          Make sure the backend server is running on localhost:3001
        </ThemedText>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={() => refetch()}
        >
          <Text style={styles.buttonText}>Retry Connection</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // Other Error State
  if (isError) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={styles.errorTitle}>Something went wrong</ThemedText>
        <ThemedText style={styles.errorMessage}>
          {error?.message || 'Failed to load shopping lists'}
        </ThemedText>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={() => refetch()}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // Empty State
  if (!lists || lists.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <VoiceActivationBanner visible={voiceActivationEnabled} isListening={wakeWord?.isListening} />
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Shopping Lists
          </ThemedText>
          <View style={styles.headerActions}>
            <VoiceStatusIndicator status={getVoiceStatus()} onPress={handleVoicePress} />
            <TouchableOpacity
              testID="create-list-button"
              style={[styles.createButton, { backgroundColor: colors.tint }]}
              onPress={openCreateModal}
            >
              <Text style={styles.createButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.centerContainer}>
          <ThemedText style={styles.emptyTitle}>No Shopping Lists</ThemedText>
          <ThemedText style={styles.emptyMessage}>
            Create your first list to get started
          </ThemedText>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={openCreateModal}
          >
            <Text style={styles.buttonText}>Create List</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  // Data Display
  const renderItem = ({ item }: { item: ShoppingListWithCount }) => (
    <View style={[styles.listCard, { borderColor: colors.icon }]}>
      <TouchableOpacity
        style={styles.listCardTouchable}
        onPress={() => {
          router.push({
            pathname: '/(tabs)/list-detail',
            params: { id: item.id },
          } as any);
        }}
      >
        <View style={styles.listCardContent}>
          <ThemedText style={styles.listName}>{item.name}</ThemedText>
          <ThemedText style={styles.listItemCount}>
            {item.itemCount} {item.itemCount === 1 ? 'item' : 'items'}
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status, colorScheme ?? 'light') }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        testID={`delete-list-${item.id}`}
        style={styles.deleteButton}
        onPress={() => openDeleteConfirm(item.id, item.name)}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <VoiceActivationBanner visible={voiceActivationEnabled} isListening={wakeWord?.isListening} />
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Shopping Lists
        </ThemedText>
        <View style={styles.headerActions}>
          <VoiceStatusIndicator status={getVoiceStatus()} onPress={handleVoicePress} />
          <TouchableOpacity
            testID="create-list-button"
            style={[styles.createButton, { backgroundColor: colors.tint }]}
            onPress={openCreateModal}
          >
            <Text style={styles.createButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={lists}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Create List Modal */}
      <Modal
        testID="create-list-modal"
        visible={isCreateModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <ThemedText style={styles.modalTitle}>Create New List</ThemedText>
            
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: validationError ? '#f44336' : colors.icon,
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                }
              ]}
              placeholder="Enter list name"
              placeholderTextColor={colors.icon}
              value={newListName}
              onChangeText={(text) => {
                setNewListName(text);
                if (validationError) setValidationError('');
              }}
              autoFocus
            />
            
            {validationError ? (
              <Text style={styles.errorText}>{validationError}</Text>
            ) : null}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsCreateModalVisible(false)}
                disabled={createMutation.isPending}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.createModalButton,
                  { backgroundColor: colors.tint }
                ]}
                onPress={handleCreateList}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.createModalButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={deleteConfirmVisible}
        title="Delete List"
        message={`Are you sure you want to delete "${listToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteList}
        onCancel={cancelDelete}
        isLoading={deleteMutation.isPending}
        error={deleteError}
      />
    </ThemedView>
  );
}

function getStatusColor(status: string, colorScheme: 'light' | 'dark' | null): string {
  const baseColors = {
    active: '#4CAF50',
    sent: '#2196F3',
    completed: '#9E9E9E',
  };
  return baseColors[status as keyof typeof baseColors] || baseColors.active;
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
    padding: 16,
    paddingTop: 60, // Account for status bar
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  listCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listCardTouchable: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  listCardContent: {
    flex: 1,
  },
  listName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  listItemCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#f44336',
  },
  errorMessage: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
    textAlign: 'center',
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ff9800',
  },
  warningMessage: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  warningDetail: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44, // Accessibility - minimum touch target
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44, // Accessibility - minimum touch target
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  createModalButton: {
    // backgroundColor set dynamically from colors.tint
  },
  createModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
