/**
 * List Detail Screen (TDD - GREEN Phase)
 * Shows items in a shopping list
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
import { Stack, useLocalSearchParams } from 'expo-router';
import { useShoppingListDetail } from '@/hooks/use-shopping-lists';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ShoppingListItem } from '@/types/api';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { data: list, isLoading, isError, error, refetch } = useShoppingListDetail(id!);

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
            onPress={() => {
              // TODO: Open add item modal
              console.log('Add item');
            }}
            testID="add-item-button"
          >
            <Text style={styles.addButtonText}>+ Add Item</Text>
          </TouchableOpacity>
        </View>
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
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: list.name }} />
      <FlatList
        data={list.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        style={[styles.fabButton, { backgroundColor: colors.tint }]}
        onPress={() => {
          // TODO: Open add item modal
          console.log('Add item');
        }}
        testID="add-item-button"
      >
        <Text style={styles.fabButtonText}>+</Text>
      </TouchableOpacity>
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
});
