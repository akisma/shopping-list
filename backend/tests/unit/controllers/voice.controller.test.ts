/**
 * Voice Controller Tests (TDD - RED Phase)
 * Tests Express endpoints for voice commands and session management
 */

import request from 'supertest';
import express from 'express';

// Mock SessionManager to return proper mock sessions
const mockSessionManager = {
  createSession: jest.fn(),
  getSession: jest.fn(),
  deleteSession: jest.fn(),
  updateContext: jest.fn(),
  setCurrentList: jest.fn(),
};

// Mock all dependencies before importing
jest.mock('../../../src/services/voice-service');
jest.mock('../../../src/services/intent-parser');
jest.mock('../../../src/services/session-manager', () => ({
  SessionManager: jest.fn().mockImplementation(() => mockSessionManager),
}));
jest.mock('../../../src/config/openai', () => ({
  getOpenAIClient: jest.fn(() => ({
    audio: { transcriptions: { create: jest.fn() } },
    chat: { completions: { create: jest.fn() } },
  })),
  OPENAI_CONFIG: { whisperModel: 'whisper-1', gptModel: 'gpt-4-turbo-preview' },
  INTENT_PARSING_SYSTEM_PROMPT: 'mock prompt',
}));

import { voiceRouter } from '../../../src/routes/voice.routes';
import { VoiceService } from '../../../src/services/voice-service';

describe('Voice Controller', () => {
  let app: express.Application;
  let mockVoiceService: jest.Mocked<VoiceService>;

  beforeEach(() => {
    app = express();
    app.use(express.json({ limit: '10mb' }));
    app.use('/api/voice', voiceRouter);

    mockVoiceService = VoiceService.prototype as jest.Mocked<VoiceService>;
    jest.clearAllMocks();

    // Setup default session manager mocks
    mockSessionManager.createSession.mockReturnValue({
      id: 'session-123',
      context: [],
      createdAt: new Date(),
      lastActivityAt: new Date(),
    });
    mockSessionManager.getSession.mockReturnValue({
      id: 'session-123',
      context: [],
      createdAt: new Date(),
      lastActivityAt: new Date(),
    });
    mockSessionManager.deleteSession.mockReturnValue(true);
  });

  describe('POST /api/voice/command', () => {
    it('processes voice command successfully', async () => {
      mockVoiceService.processVoiceCommand = jest.fn().mockResolvedValue({
        success: true,
        action: 'create_list',
        ttsText: "I've created a list called produce.",
        sessionId: 'session-123',
        data: { listId: 'list-123', listName: 'produce' },
      });

      const response = await request(app)
        .post('/api/voice/command')
        .send({ audioBlob: 'base64encodedaudio' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.action).toBe('create_list');
      expect(response.body.sessionId).toBe('session-123');
      expect(response.body.ttsText).toContain('created');
      expect(mockVoiceService.processVoiceCommand).toHaveBeenCalledWith({
        audioBlob: 'base64encodedaudio',
      });
    });

    it('processes voice command with existing session', async () => {
      mockVoiceService.processVoiceCommand = jest.fn().mockResolvedValue({
        success: true,
        action: 'add_item',
        ttsText: "I've added tomatoes to your list.",
        sessionId: 'session-123',
        data: { itemId: 'item-456', itemName: 'tomatoes' },
      });

      const response = await request(app)
        .post('/api/voice/command')
        .send({
          audioBlob: 'base64encodedaudio',
          sessionId: 'session-123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.action).toBe('add_item');
      expect(mockVoiceService.processVoiceCommand).toHaveBeenCalledWith({
        audioBlob: 'base64encodedaudio',
        sessionId: 'session-123',
      });
    });

    it('returns clarification response', async () => {
      mockVoiceService.processVoiceCommand = jest.fn().mockResolvedValue({
        success: false,
        action: 'clarification',
        ttsText: 'Which list would you like to add that to?',
        sessionId: 'session-123',
      });

      const response = await request(app)
        .post('/api/voice/command')
        .send({ audioBlob: 'base64encodedaudio' })
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.action).toBe('clarification');
      expect(response.body.ttsText).toContain('Which list');
    });

    it('returns 400 for missing audioBlob', async () => {
      const response = await request(app)
        .post('/api/voice/command')
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(mockVoiceService.processVoiceCommand).not.toHaveBeenCalled();
    });

    it('returns 400 for invalid audioBlob type', async () => {
      const response = await request(app)
        .post('/api/voice/command')
        .send({ audioBlob: 12345 })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('returns 400 for empty audioBlob', async () => {
      const response = await request(app)
        .post('/api/voice/command')
        .send({ audioBlob: '' })
        .expect(400);

      expect(response.body.error).toContain('audioBlob');
    });

    it('returns 400 for audioBlob too large', async () => {
      // Simulate large audio (> 5MB base64 encoded)
      const largeAudio = 'a'.repeat(7 * 1024 * 1024);

      const response = await request(app)
        .post('/api/voice/command')
        .send({ audioBlob: largeAudio })
        .expect(413);

      expect(response.body.error).toBeDefined();
    });

    it('returns 500 for service errors', async () => {
      mockVoiceService.processVoiceCommand = jest.fn().mockRejectedValue(
        new Error('Service error')
      );

      const response = await request(app)
        .post('/api/voice/command')
        .send({ audioBlob: 'base64encodedaudio' })
        .expect(500);

      expect(response.body.error).toBeDefined();
    });

    it('handles timeout errors gracefully', async () => {
      mockVoiceService.processVoiceCommand = jest.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 35000)) // 35 seconds
      );

      const response = await request(app)
        .post('/api/voice/command')
        .send({ audioBlob: 'base64encodedaudio' })
        .timeout(1000);

      // Request should timeout or return error
      expect([408, 500, 504]).toContain(response.status);
    });
  });

  describe('POST /api/voice/session', () => {
    it('creates a new session', async () => {
      // SessionManager will create session internally
      const response = await request(app)
        .post('/api/voice/session')
        .expect(201);

      expect(response.body.sessionId).toBeDefined();
      expect(response.body.expiresAt).toBeDefined();
    });

    it('creates session with userId', async () => {
      const response = await request(app)
        .post('/api/voice/session')
        .send({ userId: 'user-123' })
        .expect(201);

      expect(response.body.sessionId).toBeDefined();
    });
  });

  describe('GET /api/voice/session/:sessionId', () => {
    it('retrieves existing session', async () => {
      const response = await request(app)
        .get('/api/voice/session/session-123')
        .expect(200);

      expect(response.body.id).toBe('session-123');
      expect(response.body.context).toBeDefined();
    });

    it('returns 404 for non-existent session', async () => {
      const response = await request(app)
        .get('/api/voice/session/non-existent')
        .expect(404);

      expect(response.body.error).toContain('not found');
    });

    it('returns 400 for invalid session ID format', async () => {
      const response = await request(app)
        .get('/api/voice/session/invalid-id-format')
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/voice/session/:sessionId', () => {
    it('deletes existing session', async () => {
      const response = await request(app)
        .delete('/api/voice/session/session-123')
        .expect(204);

      expect(response.body).toEqual({});
    });

    it('returns 404 for non-existent session', async () => {
      const response = await request(app)
        .delete('/api/voice/session/non-existent')
        .expect(404);

      expect(response.body.error).toContain('not found');
    });
  });

  describe('Rate Limiting', () => {
    it('allows requests within rate limit', async () => {
      mockVoiceService.processVoiceCommand = jest.fn().mockResolvedValue({
        success: true,
        action: 'create_list',
        ttsText: 'Success',
        sessionId: 'session-123',
      });

      // Make 5 requests quickly (under limit of 30/min)
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post('/api/voice/command')
          .send({ audioBlob: 'base64encodedaudio' });

        expect(response.status).toBe(200);
      }
    });

    it('blocks requests exceeding rate limit', async () => {
      mockVoiceService.processVoiceCommand = jest.fn().mockResolvedValue({
        success: true,
        action: 'create_list',
        ttsText: 'Success',
        sessionId: 'session-123',
      });

      // Make 31 requests quickly (over limit of 30/min)
      const responses = [];
      for (let i = 0; i < 31; i++) {
        const response = await request(app)
          .post('/api/voice/command')
          .send({ audioBlob: 'base64encodedaudio' });
        responses.push(response);
      }

      // Last request should be rate limited
      const lastResponse = responses[responses.length - 1];
      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body.error).toContain('rate limit');
    });

    it('includes rate limit headers', async () => {
      mockVoiceService.processVoiceCommand = jest.fn().mockResolvedValue({
        success: true,
        action: 'create_list',
        ttsText: 'Success',
        sessionId: 'session-123',
      });

      const response = await request(app)
        .post('/api/voice/command')
        .send({ audioBlob: 'base64encodedaudio' });

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
    });
  });

  describe('CORS and Security Headers', () => {
    it('includes CORS headers', async () => {
      mockVoiceService.processVoiceCommand = jest.fn().mockResolvedValue({
        success: true,
        action: 'create_list',
        ttsText: 'Success',
        sessionId: 'session-123',
      });

      const response = await request(app)
        .post('/api/voice/command')
        .send({ audioBlob: 'base64encodedaudio' });

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('handles OPTIONS preflight requests', async () => {
      const response = await request(app)
        .options('/api/voice/command')
        .expect(204);

      expect(response.headers['access-control-allow-methods']).toContain('POST');
    });
  });
});
