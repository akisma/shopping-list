/**
 * useWakeWord Hook Tests
 * Tests for React hook integration with WakeWordService
 */

import { renderHook, act } from '@testing-library/react-native';
import { useWakeWord } from './use-wake-word';

describe('useWakeWord', () => {
  describe('initialization', () => {
    it('should return correct initial state', () => {
      const { result } = renderHook(() => useWakeWord());
      
      expect(result.current.status).toBe('idle');
      expect(result.current.isListening).toBe(false);
      expect(result.current.enabled).toBe(true);
      expect(result.current.wakePhrase).toBe('hey shoppy');
    });
  });

  describe('listening controls', () => {
    it('should toggle listening state', () => {
      const { result } = renderHook(() => useWakeWord());
      
      act(() => {
        result.current.startListening();
      });
      expect(result.current.isListening).toBe(true);
      
      act(() => {
        result.current.stopListening();
      });
      expect(result.current.isListening).toBe(false);
    });

    it('should not start listening when disabled', () => {
      const { result } = renderHook(() => useWakeWord());
      
      act(() => {
        result.current.setEnabled(false);
        result.current.startListening();
      });
      
      expect(result.current.isListening).toBe(false);
    });
  });

  describe('wake word detection callback', () => {
    it('should call onWakeWordDetected with command text', () => {
      const mockCallback = jest.fn();
      const { result } = renderHook(() => useWakeWord({ onWakeWordDetected: mockCallback }));
      
      act(() => {
        result.current.startListening();
        result.current.processTranscript('hey shoppy add eggs');
      });
      
      expect(mockCallback).toHaveBeenCalledWith('add eggs');
      expect(result.current.detectedCommand).toBe('add eggs');
    });
  });

  describe('cleanup', () => {
    it('should stop listening on unmount without errors', () => {
      const { result, unmount } = renderHook(() => useWakeWord());
      
      act(() => {
        result.current.startListening();
      });
      
      expect(() => unmount()).not.toThrow();
    });
  });
});
