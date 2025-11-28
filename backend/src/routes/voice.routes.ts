/**
 * Voice Routes
 * Express routes for voice command endpoints
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as voiceController from '../controllers/voice.controller';

export const voiceRouter = Router();

// Rate limiting middleware
const voiceCommandLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: { error: 'Too many voice commands, please try again later' },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

const sessionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 session operations per minute
  message: { error: 'Too many session requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Voice command endpoint
voiceRouter.post('/command', voiceCommandLimiter, voiceController.processVoiceCommand);

// Session management endpoints
voiceRouter.post('/session', sessionLimiter, voiceController.createSession);
voiceRouter.get('/session/:sessionId', sessionLimiter, voiceController.getSession);
voiceRouter.delete('/session/:sessionId', sessionLimiter, voiceController.deleteSession);
