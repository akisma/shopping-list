/**
 * VoiceListeningContext Tests (TDD - RED Phase)
 * Tests for voice listening state management
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { VoiceListeningProvider, useVoiceListeningContext } from './use-voice-listening-context';
import React from 'react';

describe('useVoiceListeningContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <VoiceListeningProvider>{children}</VoiceListeningProvider>
  );

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    expect(() => {
      renderHook(() => useVoiceListeningContext());
    }).toThrow('useVoiceListeningContext must be used within a VoiceListeningProvider');
    
    consoleSpy.mockRestore();
  });

  it('should initialize with inactive mode', () => {
    const { result } = renderHook(() => useVoiceListeningContext(), { wrapper });
    
    expect(result.current.listeningMode).toBe('inactive');
    expect(result.current.pendingAction).toBeNull();
  });

  it('should transition to waiting-for-clarification mode', () => {
    const { result } = renderHook(() => useVoiceListeningContext(), { wrapper });
    
    const testPendingAction = {
      type: 'add_item_quantity_needed',
      data: { itemName: 'chicken' },
      question: 'How much chicken would you like to add?',
      sessionId: 'test-session-123',
    };

    act(() => {
      result.current.startListeningForClarification(testPendingAction);
    });

    expect(result.current.listeningMode).toBe('waiting-for-clarification');
    expect(result.current.pendingAction).toEqual(testPendingAction);
  });

  it('should clear pending action when clearPendingAction is called', () => {
    const { result } = renderHook(() => useVoiceListeningContext(), { wrapper });
    
    const testPendingAction = {
      type: 'add_item_quantity_needed',
      data: { itemName: 'chicken' },
      question: 'How much chicken would you like to add?',
      sessionId: 'test-session-123',
    };

    act(() => {
      result.current.startListeningForClarification(testPendingAction);
    });

    expect(result.current.listeningMode).toBe('waiting-for-clarification');

    act(() => {
      result.current.clearPendingAction();
    });

    expect(result.current.listeningMode).toBe('inactive');
    expect(result.current.pendingAction).toBeNull();
  });

  it('should auto-clear pending action after 15 seconds', async () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => useVoiceListeningContext(), { wrapper });
    
    const testPendingAction = {
      type: 'add_item_quantity_needed',
      data: { itemName: 'chicken' },
      question: 'How much chicken would you like to add?',
      sessionId: 'test-session-123',
    };

    act(() => {
      result.current.startListeningForClarification(testPendingAction);
    });

    expect(result.current.listeningMode).toBe('waiting-for-clarification');

    // Fast-forward 15 seconds
    act(() => {
      jest.advanceTimersByTime(15000);
    });

    await waitFor(() => {
      expect(result.current.listeningMode).toBe('inactive');
      expect(result.current.pendingAction).toBeNull();
    });

    jest.useRealTimers();
  });

  it('should cancel previous timeout when starting new clarification', () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => useVoiceListeningContext(), { wrapper });
    
    const firstAction = {
      type: 'add_item_quantity_needed',
      data: { itemName: 'chicken' },
      question: 'How much chicken?',
      sessionId: 'session-1',
    };

    const secondAction = {
      type: 'add_item_quantity_needed',
      data: { itemName: 'beef' },
      question: 'How much beef?',
      sessionId: 'session-2',
    };

    act(() => {
      result.current.startListeningForClarification(firstAction);
    });

    // Fast-forward 10 seconds (not enough to timeout)
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Start new clarification (should cancel first timeout)
    act(() => {
      result.current.startListeningForClarification(secondAction);
    });

    expect(result.current.pendingAction).toEqual(secondAction);

    // Fast-forward 10 more seconds (total 20, but second timeout only at 10)
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Should still be active (second timeout started fresh)
    expect(result.current.listeningMode).toBe('waiting-for-clarification');

    // Fast-forward remaining 5 seconds to complete second timeout
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Now should be cleared
    expect(result.current.listeningMode).toBe('inactive');

    jest.useRealTimers();
  });

  it('should transition to background-wake-word mode', () => {
    const { result } = renderHook(() => useVoiceListeningContext(), { wrapper });
    
    act(() => {
      result.current.setBackgroundWakeWord(true);
    });

    expect(result.current.listeningMode).toBe('background-wake-word');
  });

  it('should transition from background-wake-word to inactive', () => {
    const { result } = renderHook(() => useVoiceListeningContext(), { wrapper });
    
    act(() => {
      result.current.setBackgroundWakeWord(true);
    });

    expect(result.current.listeningMode).toBe('background-wake-word');

    act(() => {
      result.current.setBackgroundWakeWord(false);
    });

    expect(result.current.listeningMode).toBe('inactive');
  });

  it('should not transition away from waiting-for-clarification when disabling wake word', () => {
    const { result } = renderHook(() => useVoiceListeningContext(), { wrapper });
    
    const testPendingAction = {
      type: 'add_item_quantity_needed',
      data: { itemName: 'chicken' },
      question: 'How much chicken?',
      sessionId: 'test-session',
    };

    act(() => {
      result.current.startListeningForClarification(testPendingAction);
    });

    expect(result.current.listeningMode).toBe('waiting-for-clarification');

    // Try to disable wake word (should have no effect)
    act(() => {
      result.current.setBackgroundWakeWord(false);
    });

    // Should still be in clarification mode
    expect(result.current.listeningMode).toBe('waiting-for-clarification');
  });
});
