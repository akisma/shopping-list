/**
 * Wake Word Service Tests (TDD - RED Phase)
 * Tests for "Hey Shoppy" wake word detection service
 */

import { WakeWordService, WakeWordStatus } from './wake-word-service';

describe('WakeWordService', () => {
  let service: WakeWordService;
  let mockOnWakeWordDetected: jest.Mock;
  let mockOnStatusChange: jest.Mock;

  beforeEach(() => {
    mockOnWakeWordDetected = jest.fn();
    mockOnStatusChange = jest.fn();
    service = new WakeWordService({
      onWakeWordDetected: mockOnWakeWordDetected,
      onStatusChange: mockOnStatusChange,
    });
  });

  afterEach(() => {
    service.stop();
  });

  describe('initialization', () => {
    it('should initialize with idle status', () => {
      expect(service.getStatus()).toBe('idle');
    });

    it('should have the correct wake phrase', () => {
      expect(service.getWakePhrase()).toBe('hey shoppy');
    });

    it('should not be listening initially', () => {
      expect(service.isListening()).toBe(false);
    });
  });

  describe('start/stop', () => {
    it('should change status to listening when started', () => {
      service.start();
      expect(service.getStatus()).toBe('listening');
    });

    it('should call onStatusChange when started', () => {
      service.start();
      expect(mockOnStatusChange).toHaveBeenCalledWith('listening');
    });

    it('should change status to idle when stopped', () => {
      service.start();
      service.stop();
      expect(service.getStatus()).toBe('idle');
    });

    it('should call onStatusChange when stopped', () => {
      service.start();
      mockOnStatusChange.mockClear();
      service.stop();
      expect(mockOnStatusChange).toHaveBeenCalledWith('idle');
    });

    it('should report isListening correctly when started', () => {
      service.start();
      expect(service.isListening()).toBe(true);
    });

    it('should report isListening correctly when stopped', () => {
      service.start();
      service.stop();
      expect(service.isListening()).toBe(false);
    });
  });

  describe('wake word detection', () => {
    it('should detect exact "hey shoppy" phrase', () => {
      service.start();
      const detected = service.processTranscript('hey shoppy');
      expect(detected).toBe(true);
      expect(mockOnWakeWordDetected).toHaveBeenCalled();
    });

    it('should detect "hey shoppy" case-insensitively', () => {
      service.start();
      const detected = service.processTranscript('HEY SHOPPY');
      expect(detected).toBe(true);
      expect(mockOnWakeWordDetected).toHaveBeenCalled();
    });

    it('should detect "hey shoppy" with mixed case', () => {
      service.start();
      const detected = service.processTranscript('Hey Shoppy');
      expect(detected).toBe(true);
      expect(mockOnWakeWordDetected).toHaveBeenCalled();
    });

    it('should detect wake phrase at start of sentence', () => {
      service.start();
      const detected = service.processTranscript('hey shoppy add milk');
      expect(detected).toBe(true);
      expect(mockOnWakeWordDetected).toHaveBeenCalledWith('add milk');
    });

    it('should not detect unrelated phrases', () => {
      service.start();
      const detected = service.processTranscript('hello world');
      expect(detected).toBe(false);
      expect(mockOnWakeWordDetected).not.toHaveBeenCalled();
    });

    it('should not detect similar but incorrect phrases', () => {
      service.start();
      const detected = service.processTranscript('hey shop');
      expect(detected).toBe(false);
      expect(mockOnWakeWordDetected).not.toHaveBeenCalled();
    });

    it('should not detect when not listening', () => {
      const detected = service.processTranscript('hey shoppy');
      expect(detected).toBe(false);
      expect(mockOnWakeWordDetected).not.toHaveBeenCalled();
    });

    it('should handle empty transcript', () => {
      service.start();
      const detected = service.processTranscript('');
      expect(detected).toBe(false);
      expect(mockOnWakeWordDetected).not.toHaveBeenCalled();
    });

    it('should handle whitespace-only transcript', () => {
      service.start();
      const detected = service.processTranscript('   ');
      expect(detected).toBe(false);
      expect(mockOnWakeWordDetected).not.toHaveBeenCalled();
    });

    it('should trim and normalize transcript', () => {
      service.start();
      const detected = service.processTranscript('  hey shoppy  ');
      expect(detected).toBe(true);
      expect(mockOnWakeWordDetected).toHaveBeenCalled();
    });
  });

  describe('status management', () => {
    it('should change status to detected when wake word is found', () => {
      service.start();
      service.processTranscript('hey shoppy');
      expect(service.getStatus()).toBe('detected');
    });

    it('should call onStatusChange with detected status', () => {
      service.start();
      mockOnStatusChange.mockClear();
      service.processTranscript('hey shoppy');
      expect(mockOnStatusChange).toHaveBeenCalledWith('detected');
    });

    it('should return to listening status after reset', () => {
      service.start();
      service.processTranscript('hey shoppy');
      service.resetAfterDetection();
      expect(service.getStatus()).toBe('listening');
    });
  });

  describe('callbacks', () => {
    it('should pass remaining transcript after wake phrase to callback', () => {
      service.start();
      service.processTranscript('hey shoppy add eggs to the list');
      expect(mockOnWakeWordDetected).toHaveBeenCalledWith('add eggs to the list');
    });

    it('should pass empty string if only wake phrase', () => {
      service.start();
      service.processTranscript('hey shoppy');
      expect(mockOnWakeWordDetected).toHaveBeenCalledWith('');
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      const errorService = new WakeWordService({
        onWakeWordDetected: errorCallback,
        onStatusChange: mockOnStatusChange,
      });
      
      errorService.start();
      // Should not throw
      expect(() => errorService.processTranscript('hey shoppy')).not.toThrow();
    });
  });

  describe('enable/disable', () => {
    it('should be enabled by default', () => {
      expect(service.isEnabled()).toBe(true);
    });

    it('should not detect when disabled', () => {
      service.setEnabled(false);
      service.start();
      const detected = service.processTranscript('hey shoppy');
      expect(detected).toBe(false);
    });

    it('should report disabled status', () => {
      service.setEnabled(false);
      expect(service.isEnabled()).toBe(false);
    });

    it('should re-enable and work again', () => {
      service.setEnabled(false);
      service.setEnabled(true);
      service.start();
      const detected = service.processTranscript('hey shoppy');
      expect(detected).toBe(true);
    });
  });
});
