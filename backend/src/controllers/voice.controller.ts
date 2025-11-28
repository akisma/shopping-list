/**
 * Voice Controller
 * Handles HTTP requests for voice commands and session management
 */

import { Request, Response } from 'express';
import { VoiceService } from '../services/voice-service';
import { IntentParser } from '../services/intent-parser';
import { SessionManager } from '../services/session-manager';
import { ShoppingListService } from '../services/shopping-list.service';
import { ShoppingListItemService } from '../services/shopping-list-item.service';

// Services will be injected
let voiceService: VoiceService;
let sessionManager: SessionManager;

export function initializeVoiceController(
  listService: ShoppingListService,
  itemService: ShoppingListItemService
) {
  const intentParser = new IntentParser();
  sessionManager = new SessionManager();
  
  voiceService = new VoiceService(
    intentParser,
    sessionManager,
    listService,
    itemService
  );
}

/**
 * POST /api/voice/command
 * Process a voice command
 */
export async function processVoiceCommand(req: Request, res: Response): Promise<void> {
  try {
    const { audioBlob, sessionId } = req.body;

    // Validate audioBlob
    if (!audioBlob || typeof audioBlob !== 'string') {
      res.status(400).json({ error: 'audioBlob is required and must be a string' });
      return;
    }

    if (audioBlob.trim() === '') {
      res.status(400).json({ error: 'audioBlob cannot be empty' });
      return;
    }

    // Check size (base64 encoded, roughly 5MB limit)
    if (audioBlob.length > 7 * 1024 * 1024) {
      res.status(413).json({ error: 'Audio file too large (max 5MB)' });
      return;
    }

    // Process command
    const result = await voiceService.processVoiceCommand({
      audioBlob,
      sessionId,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('[Voice Controller] Error processing command:', error);
    console.error('[Voice Controller] Error stack:', error instanceof Error ? error.stack : 'no stack');
    res.status(500).json({
      error: 'Failed to process voice command',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/voice/session
 * Create a new voice session
 */
export function createSession(req: Request, res: Response): void {
  try {
    const { userId } = req.body;
    const session = sessionManager.createSession(userId);

    // Calculate expiration (5 minutes from now)
    const expiresAt = new Date(session.lastActivityAt.getTime() + 5 * 60 * 1000);

    res.status(201).json({
      sessionId: session.id,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      error: 'Failed to create session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/voice/session/:sessionId
 * Retrieve session details
 */
export function getSession(req: Request, res: Response): void {
  try {
    const { sessionId } = req.params;

    // Basic validation
    if (!sessionId || sessionId.length < 10) {
      res.status(400).json({ error: 'Invalid session ID format' });
      return;
    }

    const session = sessionManager.getSession(sessionId);

    if (!session) {
      res.status(404).json({ error: 'Session not found or expired' });
      return;
    }

    res.status(200).json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      error: 'Failed to retrieve session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * DELETE /api/voice/session/:sessionId
 * Delete a session
 */
export function deleteSession(req: Request, res: Response): void {
  try {
    const { sessionId } = req.params;

    const deleted = sessionManager.deleteSession(sessionId);

    if (!deleted) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      error: 'Failed to delete session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
