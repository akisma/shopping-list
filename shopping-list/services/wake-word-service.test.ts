/**
 * Wake Word Service Tests
 * Tests for "Hey Shoppy" wake word detection service
 */

import { WakeWordService } from './wake-word-service';

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
    it('should initialize with correct defaults', () => {
      expect(service.getStatus()).toBe('idle');
      expect(service.getWakePhrase()).toBe('hey shoppy');
      expect(service.isListening()).toBe(false);
      expect(service.isEnabled()).toBe(true);
    });
  });

  describe('start/stop listening', () => {
    it('should transition status when starting and stopping', () => {
      service.start();
      expect(service.getStatus()).toBe('listening');
      expect(service.isListening()).toBe(true);
      expect(mockOnStatusChange).toHaveBeenCalledWith('listening');

      mockOnStatusChange.mockClear();
      service.stop();
      expect(service.getStatus()).toBe('idle');
      expect(service.isListening()).toBe(false);
      expect(mockOnStatusChange).toHaveBeenCalledWith('idle');
    });
  });

  describe('wake word detection', () => {
    it('should detect "hey shoppy" case-insensitively', () => {
      service.start();
      expect(service.processTranscript('hey shoppy')).toBe(true);
      
      service.resetAfterDetection();
      expect(service.processTranscript('HEY SHOPPY')).toBe(true);
      
      service.resetAfterDetection();
      expect(service.processTranscript('  Hey Shoppy  ')).toBe(true);
    });

    it('should extract command after wake phrase', () => {
      service.start();
      service.processTranscript('hey shoppy add eggs to the list');
      expect(mockOnWakeWordDetected).toHaveBeenCalledWith('add eggs to the list');
    });

    it('should not detect when not listening or disabled', () => {
      expect(service.processTranscript('hey shoppy')).toBe(false);
      
      service.setEnabled(false);
      service.start();
      expect(service.processTranscript('hey shoppy')).toBe(false);
    });

    it('should reject invalid inputs', () => {
      service.start();
      expect(service.processTranscript('')).toBe(false);
      expect(service.processTranscript('   ')).toBe(false);
      expect(service.processTranscript('hello world')).toBe(false);
      expect(service.processTranscript('hey shop')).toBe(false);
    });
  });

  describe('status management', () => {
    it('should update status to detected and reset correctly', () => {
      service.start();
      service.processTranscript('hey shoppy');
      expect(service.getStatus()).toBe('detected');

      service.resetAfterDetection();
      expect(service.getStatus()).toBe('listening');
    });
  });

  describe('error handling', () => {
    it('should handle callback errors gracefully', () => {
      const errorService = new WakeWordService({
        onWakeWordDetected: () => { throw new Error('Callback error'); },
        onStatusChange: mockOnStatusChange,
      });
      
      errorService.start();
      expect(() => errorService.processTranscript('hey shoppy')).not.toThrow();
    });
  });

  describe('enable/disable', () => {
    it('should toggle enabled state and resume working after re-enable', () => {
      service.setEnabled(false);
      expect(service.isEnabled()).toBe(false);
      
      service.setEnabled(true);
      service.start();
      expect(service.processTranscript('hey shoppy')).toBe(true);
    });
  });
});
