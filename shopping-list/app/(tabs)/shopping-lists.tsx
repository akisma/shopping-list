/**
 * Shopping Lists Screen (TDD - GREEN Phase)
 * Main screen displaying all shopping lists
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useShoppingLists } from '@/hooks/use-shopping-lists';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ShoppingListWithCount } from '@/types/api';

export default function ShoppingListsScreen() {
  const { data: lists, isLoading, isError, error, refetch } = useShoppingLists();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={styles.emptyTitle}>No Shopping Lists</ThemedText>
        <ThemedText style={styles.emptyMessage}>
          Create your first list to get started
        </ThemedText>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={() => {
            // TODO: Open create modal
            console.log('Create list');
          }}
        >
          <Text style={styles.buttonText}>Create Your First List</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // Data Display
  const renderItem = ({ item }: { item: ShoppingListWithCount }) => (
    <TouchableOpacity
      style={[styles.listCard, { borderColor: colors.icon }]}
      onPress={() => {
        // TODO: Navigate to detail
        console.log('Navigate to', item.id);
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
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Shopping Lists
        </ThemedText>
        <TouchableOpacity
          testID="create-list-button"
          style={[styles.createButton, { backgroundColor: colors.tint }]}
          onPress={() => {
            // TODO: Open create modal
            console.log('Create list');
          }}
        >
          <Text style={styles.createButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={lists}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
});
