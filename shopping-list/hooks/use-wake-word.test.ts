/**
 * useWakeWord Hook Tests (TDD - RED Phase)
 * Tests for custom hook that integrates wake word detection with React components
 */

import { renderHook, act } from '@testing-library/react-native';
import { useWakeWord } from './use-wake-word';

describe('useWakeWord', () => {
  describe('initialization', () => {
    it('should return initial state with status idle', () => {
      const { result } = renderHook(() => useWakeWord());
      expect(result.current.status).toBe('idle');
    });

    it('should return isListening as false initially', () => {
      const { result } = renderHook(() => useWakeWord());
      expect(result.current.isListening).toBe(false);
    });

    it('should return enabled as true by default', () => {
      const { result } = renderHook(() => useWakeWord());
      expect(result.current.enabled).toBe(true);
    });

    it('should return the wake phrase', () => {
      const { result } = renderHook(() => useWakeWord());
      expect(result.current.wakePhrase).toBe('hey shoppy');
    });
  });

  describe('start/stop listening', () => {
    it('should start listening when startListening is called', () => {
      const { result } = renderHook(() => useWakeWord());
      
      act(() => {
        result.current.startListening();
      });
      
      expect(result.current.status).toBe('listening');
      expect(result.current.isListening).toBe(true);
    });

    it('should stop listening when stopListening is called', () => {
      const { result } = renderHook(() => useWakeWord());
      
      act(() => {
        result.current.startListening();
      });
      
      act(() => {
        result.current.stopListening();
      });
      
      expect(result.current.status).toBe('idle');
      expect(result.current.isListening).toBe(false);
    });
  });

  describe('enable/disable', () => {
    it('should disable wake word detection', () => {
      const { result } = renderHook(() => useWakeWord());
      
      act(() => {
        result.current.setEnabled(false);
      });
      
      expect(result.current.enabled).toBe(false);
    });

    it('should re-enable wake word detection', () => {
      const { result } = renderHook(() => useWakeWord());
      
      act(() => {
        result.current.setEnabled(false);
      });
      
      act(() => {
        result.current.setEnabled(true);
      });
      
      expect(result.current.enabled).toBe(true);
    });

    it('should not start listening when disabled', () => {
      const { result } = renderHook(() => useWakeWord());
      
      act(() => {
        result.current.setEnabled(false);
      });
      
      act(() => {
        result.current.startListening();
      });
      
      expect(result.current.isListening).toBe(false);
    });
  });

  describe('wake word detection', () => {
    it('should detect wake word and update status', () => {
      const { result } = renderHook(() => useWakeWord());
      
      act(() => {
        result.current.startListening();
      });
      
      act(() => {
        result.current.processTranscript('hey shoppy');
      });
      
      expect(result.current.status).toBe('detected');
    });

    it('should not detect wake word when not listening', () => {
      const { result } = renderHook(() => useWakeWord());
      
      act(() => {
        result.current.processTranscript('hey shoppy');
      });
      
      expect(result.current.status).toBe('idle');
    });

    it('should return detected transcript without wake phrase', () => {
      const { result } = renderHook(() => useWakeWord());
      
      act(() => {
        result.current.startListening();
      });
      
      act(() => {
        result.current.processTranscript('hey shoppy add milk');
      });
      
      expect(result.current.detectedCommand).toBe('add milk');
    });

    it('should reset detectedCommand after resetDetection', () => {
      const { result } = renderHook(() => useWakeWord());
      
      act(() => {
        result.current.startListening();
      });
      
      act(() => {
        result.current.processTranscript('hey shoppy add milk');
      });
      
      act(() => {
        result.current.resetDetection();
      });
      
      expect(result.current.detectedCommand).toBe(null);
      expect(result.current.status).toBe('listening');
    });
  });

  describe('callback', () => {
    it('should call onWakeWordDetected when wake word is detected', () => {
      const mockCallback = jest.fn();
      const { result } = renderHook(() => useWakeWord({ onWakeWordDetected: mockCallback }));
      
      act(() => {
        result.current.startListening();
      });
      
      act(() => {
        result.current.processTranscript('hey shoppy add eggs');
      });
      
      expect(mockCallback).toHaveBeenCalledWith('add eggs');
    });

    it('should not call onWakeWordDetected when wake word is not detected', () => {
      const mockCallback = jest.fn();
      const { result } = renderHook(() => useWakeWord({ onWakeWordDetected: mockCallback }));
      
      act(() => {
        result.current.startListening();
      });
      
      act(() => {
        result.current.processTranscript('hello world');
      });
      
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should stop listening on unmount', () => {
      const { result, unmount } = renderHook(() => useWakeWord());
      
      act(() => {
        result.current.startListening();
      });
      
      expect(result.current.isListening).toBe(true);
      
      unmount();
      
      // After unmount, the service should be cleaned up
      // We can't check the state after unmount, but we verify no errors occur
    });
  });
});
