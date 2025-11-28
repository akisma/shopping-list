/**
 * Session Manager Tests (TDD - RED Phase)
 * Tests voice session management (context retention, timeouts, cleanup)
 */

import { SessionManager } from '../../../src/services/session-manager';
import { VoiceCommand } from '../../../src/types';

describe('SessionManager', () => {
  let manager: SessionManager;

  beforeEach(() => {
    manager = new SessionManager();
  });

  describe('createSession', () => {
    it('creates a new session with unique ID', () => {
      const session1 = manager.createSession();
      const session2 = manager.createSession();

      expect(session1.id).toBeTruthy();
      expect(session2.id).toBeTruthy();
      expect(session1.id).not.toBe(session2.id);
    });

    it('creates session with optional userId', () => {
      const session = manager.createSession('user-123');

      expect(session.userId).toBe('user-123');
    });

    it('creates session with empty context', () => {
      const session = manager.createSession();

      expect(session.context).toEqual([]);
      expect(session.currentListId).toBeUndefined();
    });

    it('creates session with timestamps', () => {
      const now = Date.now();
      const session = manager.createSession();

      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.lastActivityAt).toBeInstanceOf(Date);
      expect(session.createdAt.getTime()).toBeGreaterThanOrEqual(now);
      expect(session.lastActivityAt.getTime()).toBeGreaterThanOrEqual(now);
    });
  });

  describe('getSession', () => {
    it('retrieves existing session by ID', () => {
      const session = manager.createSession();
      const retrieved = manager.getSession(session.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(session.id);
    });

    it('returns undefined for non-existent session', () => {
      const retrieved = manager.getSession('non-existent-id');

      expect(retrieved).toBeUndefined();
    });

    it('returns undefined for expired session', () => {
      const session = manager.createSession();
      
      // Fast-forward time to expire the session (5+ minutes)
      jest.useFakeTimers();
      jest.advanceTimersByTime(6 * 60 * 1000);

      const retrieved = manager.getSession(session.id);

      expect(retrieved).toBeUndefined();

      jest.useRealTimers();
    });
  });

  describe('updateContext', () => {
    it('adds command to session context', () => {
      const session = manager.createSession();
      const command: VoiceCommand = {
        timestamp: new Date(),
        transcript: 'create list produce',
        intent: 'create_list',
        action: 'create_list',
      };

      manager.updateContext(session.id, command);

      const updated = manager.getSession(session.id);
      expect(updated?.context).toHaveLength(1);
      expect(updated?.context[0]).toEqual(command);
    });

    it('retains last 5 commands only', () => {
      const session = manager.createSession();

      // Add 7 commands
      for (let i = 0; i < 7; i++) {
        const command: VoiceCommand = {
          timestamp: new Date(),
          transcript: `command ${i}`,
          intent: 'add_item',
          action: 'add_item',
        };
        manager.updateContext(session.id, command);
      }

      const updated = manager.getSession(session.id);
      expect(updated?.context).toHaveLength(5);
      expect(updated?.context[0].transcript).toBe('command 2');
      expect(updated?.context[4].transcript).toBe('command 6');
    });

    it('updates lastActivityAt timestamp', () => {
      const session = manager.createSession();
      const originalTime = session.lastActivityAt.getTime();

      // Wait a bit before updating
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      const command: VoiceCommand = {
        timestamp: new Date(),
        transcript: 'add tomatoes',
        intent: 'add_item',
        action: 'add_item',
      };
      manager.updateContext(session.id, command);

      const updated = manager.getSession(session.id);
      expect(updated?.lastActivityAt.getTime()).toBeGreaterThan(originalTime);

      jest.useRealTimers();
    });

    it('throws error for non-existent session', () => {
      const command: VoiceCommand = {
        timestamp: new Date(),
        transcript: 'add tomatoes',
        intent: 'add_item',
        action: 'add_item',
      };

      expect(() => {
        manager.updateContext('non-existent-id', command);
      }).toThrow('Session not found');
    });
  });

  describe('setCurrentList', () => {
    it('sets current list ID for session', () => {
      const session = manager.createSession();
      manager.setCurrentList(session.id, 'list-123');

      const updated = manager.getSession(session.id);
      expect(updated?.currentListId).toBe('list-123');
    });

    it('updates lastActivityAt timestamp', () => {
      const session = manager.createSession();
      const originalTime = session.lastActivityAt.getTime();

      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      manager.setCurrentList(session.id, 'list-123');

      const updated = manager.getSession(session.id);
      expect(updated?.lastActivityAt.getTime()).toBeGreaterThan(originalTime);

      jest.useRealTimers();
    });

    it('throws error for non-existent session', () => {
      expect(() => {
        manager.setCurrentList('non-existent-id', 'list-123');
      }).toThrow('Session not found');
    });
  });

  describe('deleteSession', () => {
    it('deletes existing session', () => {
      const session = manager.createSession();
      manager.deleteSession(session.id);

      const retrieved = manager.getSession(session.id);
      expect(retrieved).toBeUndefined();
    });

    it('returns true for successfully deleted session', () => {
      const session = manager.createSession();
      const result = manager.deleteSession(session.id);

      expect(result).toBe(true);
    });

    it('returns false for non-existent session', () => {
      const result = manager.deleteSession('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('cleanupExpiredSessions', () => {
    it('removes sessions older than timeout', () => {
      jest.useFakeTimers();
      const now = Date.now();
      jest.setSystemTime(now);

      const session1 = manager.createSession();
      
      // Advance time past session1 expiry (6 minutes)
      jest.setSystemTime(now + 6 * 60 * 1000);
      
      // Create session2 AFTER advancing time (will be recent)
      const session2 = manager.createSession();

      const cleaned = manager.cleanupExpiredSessions();

      expect(cleaned).toBe(1);
      expect(manager.getSession(session1.id)).toBeUndefined();
      expect(manager.getSession(session2.id)).toBeDefined();

      jest.useRealTimers();
    });

    it('returns 0 when no sessions expired', () => {
      manager.createSession();
      manager.createSession();

      const cleaned = manager.cleanupExpiredSessions();

      expect(cleaned).toBe(0);
    });
  });

  describe('getSessionCount', () => {
    it('returns correct number of active sessions', () => {
      expect(manager.getSessionCount()).toBe(0);

      manager.createSession();
      expect(manager.getSessionCount()).toBe(1);

      manager.createSession();
      expect(manager.getSessionCount()).toBe(2);
    });

    it('excludes deleted sessions', () => {
      const session = manager.createSession();
      expect(manager.getSessionCount()).toBe(1);

      manager.deleteSession(session.id);
      expect(manager.getSessionCount()).toBe(0);
    });
  });
});
