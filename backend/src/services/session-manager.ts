/**
 * Session Manager Service
 * Manages voice conversation sessions with context retention and timeout
 */

import { VoiceSession, VoiceCommand } from '../types';
import { randomUUID } from 'crypto';

export class SessionManager {
  private sessions: Map<string, VoiceSession> = new Map();
  private readonly sessionTimeoutMinutes = 5;
  private readonly maxContextCommands = 5;

  /**
   * Create a new voice session
   * @param userId - Optional user ID to associate with session
   * @returns New session object
   */
  createSession(userId?: string): VoiceSession {
    const session: VoiceSession = {
      id: randomUUID(),
      userId,
      context: [],
      createdAt: new Date(),
      lastActivityAt: new Date(),
    };

    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Get session by ID
   * @param sessionId - Session ID to retrieve
   * @returns Session object or undefined if not found/expired
   */
  getSession(sessionId: string): VoiceSession | undefined {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return undefined;
    }

    // Check if session has expired
    if (this.isExpired(session)) {
      this.sessions.delete(sessionId);
      return undefined;
    }

    return session;
  }

  /**
   * Update session context with new command
   * @param sessionId - Session ID to update
   * @param command - Voice command to add to context
   */
  updateContext(sessionId: string, command: VoiceCommand): void {
    const session = this.getSession(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    // Add command to context
    session.context.push(command);

    // Keep only last N commands
    if (session.context.length > this.maxContextCommands) {
      session.context = session.context.slice(-this.maxContextCommands);
    }

    // Update last activity timestamp
    session.lastActivityAt = new Date();

    this.sessions.set(sessionId, session);
  }

  /**
   * Set current list ID for session
   * @param sessionId - Session ID to update
   * @param listId - List ID to set as current
   */
  setCurrentList(sessionId: string, listId: string): void {
    const session = this.getSession(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    session.currentListId = listId;
    session.lastActivityAt = new Date();

    this.sessions.set(sessionId, session);
  }

  /**
   * Set pending action for session (for multi-turn interactions)
   * @param sessionId - Session ID to update
   * @param action - Action name
   * @param entities - Partial entities from the incomplete request
   */
  setPendingAction(sessionId: string, action: string, entities: Record<string, any>): void {
    const session = this.getSession(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    session.pendingAction = { action, entities };
    session.lastActivityAt = new Date();

    this.sessions.set(sessionId, session);
  }

  /**
   * Get pending action for session
   * @param sessionId - Session ID to check
   * @returns Pending action or undefined
   */
  getPendingAction(sessionId: string): { action: string; entities: Record<string, any> } | undefined {
    const session = this.getSession(sessionId);
    return session?.pendingAction;
  }

  /**
   * Clear pending action for session
   * @param sessionId - Session ID to update
   */
  clearPendingAction(sessionId: string): void {
    const session = this.getSession(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    session.pendingAction = undefined;
    session.lastActivityAt = new Date();

    this.sessions.set(sessionId, session);
  }

  /**
   * Delete a session
   * @param sessionId - Session ID to delete
   * @returns True if deleted, false if not found
   */
  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Remove expired sessions
   * @returns Number of sessions cleaned up
   */
  cleanupExpiredSessions(): number {
    let cleaned = 0;

    for (const [id, session] of this.sessions.entries()) {
      if (this.isExpired(session)) {
        this.sessions.delete(id);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get number of active sessions
   * @returns Session count
   */
  getSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Check if session has expired
   * @param session - Session to check
   * @returns True if expired, false otherwise
   */
  private isExpired(session: VoiceSession): boolean {
    const now = Date.now();
    const lastActivity = session.lastActivityAt.getTime();
    const timeoutMs = this.sessionTimeoutMinutes * 60 * 1000;

    return (now - lastActivity) > timeoutMs;
  }
}
