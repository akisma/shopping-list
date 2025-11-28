/**
 * Voice Service Tests (TDD - RED Phase)
 * Tests main voice orchestration (Whisper STT → IntentParser → Action execution)
 */

import { VoiceService } from '../../../src/services/voice-service';
import { IntentParser } from '../../../src/services/intent-parser';
import { SessionManager } from '../../../src/services/session-manager';
import { ShoppingListService } from '../../../src/services/shopping-list.service';
import { ShoppingListItemService } from '../../../src/services/shopping-list-item.service';

// Mock OpenAI client for Whisper
const mockWhisperCreate = jest.fn();
const mockGetOpenAIClient = jest.fn(() => ({
  audio: {
    transcriptions: {
      create: mockWhisperCreate,
    },
  },
}));

jest.mock('../../../src/config/openai', () => ({
  getOpenAIClient: () => mockGetOpenAIClient(),
  OPENAI_CONFIG: {
    whisperModel: 'whisper-1',
  },
}));

// Mock services
jest.mock('../../../src/services/intent-parser');
jest.mock('../../../src/services/session-manager');
jest.mock('../../../src/services/shopping-list.service');
jest.mock('../../../src/services/shopping-list-item.service');

describe('VoiceService', () => {
  let voiceService: VoiceService;
  let mockIntentParser: jest.Mocked<IntentParser>;
  let mockSessionManager: jest.Mocked<SessionManager>;
  let mockListService: jest.Mocked<ShoppingListService>;
  let mockItemService: jest.Mocked<ShoppingListItemService>;

  beforeEach(() => {
    mockWhisperCreate.mockClear();
    
    // Setup mocked services
    mockIntentParser = new IntentParser() as jest.Mocked<IntentParser>;
    mockSessionManager = new SessionManager() as jest.Mocked<SessionManager>;
    mockListService = new ShoppingListService({} as any) as jest.Mocked<ShoppingListService>;
    mockItemService = new ShoppingListItemService({} as any) as jest.Mocked<ShoppingListItemService>;

    // Setup default mocks for pending action methods
    mockSessionManager.getPendingAction = jest.fn().mockReturnValue(undefined);
    mockSessionManager.setPendingAction = jest.fn();
    mockSessionManager.clearPendingAction = jest.fn();

    voiceService = new VoiceService(
      mockIntentParser,
      mockSessionManager,
      mockListService,
      mockItemService
    );
  });

  describe('processVoiceCommand', () => {
    const mockAudioBlob = 'base64encodedaudiodata';

    it('processes complete voice command flow without session', async () => {
      // Mock Whisper transcription
      mockWhisperCreate.mockResolvedValue({
        text: 'create a list called produce',
      });

      // Mock intent parsing
      mockIntentParser.parseIntent = jest.fn().mockResolvedValue({
        action: 'create_list',
        confidence: 0.95,
        entities: { listName: 'produce' },
        requiresClarification: false,
      });

      // Mock session creation
      const mockSession = {
        id: 'session-123',
        context: [],
        createdAt: new Date(),
        lastActivityAt: new Date(),
      };
      mockSessionManager.createSession = jest.fn().mockReturnValue(mockSession);

      // Mock list creation
      mockListService.create = jest.fn().mockReturnValue({
        id: 'list-123',
        name: 'produce',
        userId: null,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await voiceService.processVoiceCommand({
        audioBlob: mockAudioBlob,
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('create_list');
      expect(result.sessionId).toBe('session-123');
      expect(result.ttsText).toContain('created');
      expect(result.data).toEqual({ listId: 'list-123', listName: 'produce' });
      expect(mockWhisperCreate).toHaveBeenCalledTimes(1);
      expect(mockIntentParser.parseIntent).toHaveBeenCalledWith('create a list called produce', {
        currentListId: undefined,
        lastCommands: [],
      });
    });

    it('processes voice command with existing session', async () => {
      // Mock Whisper transcription
      mockWhisperCreate.mockResolvedValue({
        text: 'add tomatoes',
      });

      // Mock session retrieval
      const mockSession = {
        id: 'session-123',
        currentListId: 'list-123',
        context: [],
        createdAt: new Date(),
        lastActivityAt: new Date(),
      };
      mockSessionManager.getSession = jest.fn().mockReturnValue(mockSession);

      // Mock intent parsing with context
      mockIntentParser.parseIntent = jest.fn().mockResolvedValue({
        action: 'add_item',
        confidence: 0.9,
        entities: { itemName: 'tomatoes' },
        requiresClarification: false,
      });

      // Mock item creation
      mockItemService.add = jest.fn().mockReturnValue({
        id: 'item-123',
        name: 'tomatoes',
        quantity: '1',
        unit: null,
        notes: null,
        completed: false,
        shoppingListId: 'list-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await voiceService.processVoiceCommand({
        audioBlob: mockAudioBlob,
        sessionId: 'session-123',
      });

      // With the new quantity follow-up feature, adding without quantity asks for clarification
      expect(result.success).toBe(false);
      expect(result.action).toBe('clarification');
      expect(result.sessionId).toBe('session-123');
      expect(result.ttsText).toBe('How much would you like me to add?');
      expect(mockIntentParser.parseIntent).toHaveBeenCalledWith('add tomatoes', {
        currentListId: 'list-123',
        lastCommands: [],
      });
      // Verify pending action was set
      expect(mockSessionManager.setPendingAction).toHaveBeenCalledWith('session-123', 'add_item', {
        itemName: 'tomatoes',
        listId: 'list-123',
      });
    });

    it('handles "add item with quantity" command', async () => {
      mockWhisperCreate.mockResolvedValue({
        text: 'add three cases of tomatoes',
      });

      const mockSession = {
        id: 'session-123',
        currentListId: 'list-123',
        context: [],
        createdAt: new Date(),
        lastActivityAt: new Date(),
      };
      mockSessionManager.getSession = jest.fn().mockReturnValue(mockSession);

      mockIntentParser.parseIntent = jest.fn().mockResolvedValue({
        action: 'add_item',
        confidence: 0.9,
        entities: { itemName: 'tomatoes', quantity: '3 cases' },
        requiresClarification: false,
      });

      mockItemService.add = jest.fn().mockReturnValue({
        id: 'item-123',
        name: 'tomatoes',
        quantity: '3 cases',
        unit: null,
        notes: null,
        completed: false,
        shoppingListId: 'list-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await voiceService.processVoiceCommand({
        audioBlob: mockAudioBlob,
        sessionId: 'session-123',
      });

      expect(result.success).toBe(true);
      expect(result.ttsText).toContain('3 cases');
      expect(mockItemService.add).toHaveBeenCalledWith('list-123', {
        name: 'tomatoes',
        quantity: '3 cases',
      });
    });

    it('handles "remove item" command', async () => {
      mockWhisperCreate.mockResolvedValue({
        text: 'remove onions',
      });

      const mockSession = {
        id: 'session-123',
        currentListId: 'list-123',
        context: [],
        createdAt: new Date(),
        lastActivityAt: new Date(),
      };
      mockSessionManager.getSession = jest.fn().mockReturnValue(mockSession);

      mockIntentParser.parseIntent = jest.fn().mockResolvedValue({
        action: 'remove_item',
        confidence: 0.9,
        entities: { itemName: 'onions' },
        requiresClarification: false,
      });

      // Mock finding the item
      mockListService.getById = jest.fn().mockReturnValue({
        id: 'list-123',
        name: 'produce',
        items: [
          { id: 'item-456', name: 'onions', shoppingListId: 'list-123' },
          { id: 'item-789', name: 'tomatoes', shoppingListId: 'list-123' },
        ],
      });

      mockItemService.delete = jest.fn().mockReturnValue(true);

      const result = await voiceService.processVoiceCommand({
        audioBlob: mockAudioBlob,
        sessionId: 'session-123',
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('remove_item');
      expect(result.ttsText).toContain('removed onions');
      expect(mockItemService.delete).toHaveBeenCalledWith('list-123', 'item-456');
    });

    it('handles "query lists" command', async () => {
      mockWhisperCreate.mockResolvedValue({
        text: 'show my lists',
      });

      mockIntentParser.parseIntent = jest.fn().mockResolvedValue({
        action: 'query_lists',
        confidence: 0.9,
        entities: {},
        requiresClarification: false,
      });

      mockSessionManager.createSession = jest.fn().mockReturnValue({
        id: 'session-123',
        context: [],
        createdAt: new Date(),
        lastActivityAt: new Date(),
      });

      mockListService.getAll = jest.fn().mockReturnValue({
        lists: [
          { id: 'list-1', name: 'produce', itemCount: 0 },
          { id: 'list-2', name: 'dairy', itemCount: 0 },
        ],
        total: 2,
      });

      const result = await voiceService.processVoiceCommand({
        audioBlob: mockAudioBlob,
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('query_lists');
      expect(result.ttsText).toContain('2 lists');
      expect(result.data.lists).toHaveLength(2);
    });

    it('handles clarification needed response', async () => {
      mockWhisperCreate.mockResolvedValue({
        text: 'add tomatoes',
      });

      mockIntentParser.parseIntent = jest.fn().mockResolvedValue({
        action: 'clarification',
        confidence: 0.5,
        entities: { itemName: 'tomatoes' },
        requiresClarification: true,
        clarificationQuestion: 'Which list would you like to add tomatoes to?',
      });

      mockSessionManager.createSession = jest.fn().mockReturnValue({
        id: 'session-123',
        context: [],
        createdAt: new Date(),
        lastActivityAt: new Date(),
      });

      const result = await voiceService.processVoiceCommand({
        audioBlob: mockAudioBlob,
      });

      expect(result.success).toBe(false);
      expect(result.action).toBe('clarification');
      expect(result.ttsText).toContain('Which list');
      expect(result.data).toBeUndefined();
    });

    it('handles Whisper transcription errors', async () => {
      mockWhisperCreate.mockRejectedValue(new Error('Whisper API error'));

      const result = await voiceService.processVoiceCommand({
        audioBlob: mockAudioBlob,
      });

      expect(result.success).toBe(false);
      expect(result.action).toBe('error');
      expect(result.error).toContain('transcription');
    });

    it('handles intent parsing errors', async () => {
      mockWhisperCreate.mockResolvedValue({
        text: 'create list produce',
      });

      mockIntentParser.parseIntent = jest.fn().mockRejectedValue(new Error('GPT-4 error'));

      mockSessionManager.createSession = jest.fn().mockReturnValue({
        id: 'session-123',
        context: [],
        createdAt: new Date(),
        lastActivityAt: new Date(),
      });

      const result = await voiceService.processVoiceCommand({
        audioBlob: mockAudioBlob,
      });

      expect(result.success).toBe(false);
      expect(result.action).toBe('error');
      expect(result.error).toBeDefined();
    });

    it('handles action execution errors', async () => {
      mockWhisperCreate.mockResolvedValue({
        text: 'create list produce',
      });

      mockIntentParser.parseIntent = jest.fn().mockResolvedValue({
        action: 'create_list',
        confidence: 0.95,
        entities: { listName: 'produce' },
        requiresClarification: false,
      });

      mockSessionManager.createSession = jest.fn().mockReturnValue({
        id: 'session-123',
        context: [],
        createdAt: new Date(),
        lastActivityAt: new Date(),
      });

      mockListService.create = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await voiceService.processVoiceCommand({
        audioBlob: mockAudioBlob,
      });

      expect(result.success).toBe(false);
      expect(result.action).toBe('error');
      expect(result.error).toContain('error');
    });

    it('updates session context after successful command', async () => {
      mockWhisperCreate.mockResolvedValue({
        text: 'create list produce',
      });

      mockIntentParser.parseIntent = jest.fn().mockResolvedValue({
        action: 'create_list',
        confidence: 0.95,
        entities: { listName: 'produce' },
        requiresClarification: false,
      });

      const mockSession = {
        id: 'session-123',
        context: [],
        createdAt: new Date(),
        lastActivityAt: new Date(),
      };
      mockSessionManager.createSession = jest.fn().mockReturnValue(mockSession);
      mockSessionManager.updateContext = jest.fn();

      mockListService.create = jest.fn().mockReturnValue({
        id: 'list-123',
        name: 'produce',
        items: [],
      });

      await voiceService.processVoiceCommand({
        audioBlob: mockAudioBlob,
      });

      expect(mockSessionManager.updateContext).toHaveBeenCalledWith(
        'session-123',
        expect.objectContaining({
          transcript: 'create list produce',
          intent: 'create_list',
          action: 'create_list',
        })
      );
    });

    it('sets current list after creating list', async () => {
      mockWhisperCreate.mockResolvedValue({
        text: 'create list produce',
      });

      mockIntentParser.parseIntent = jest.fn().mockResolvedValue({
        action: 'create_list',
        confidence: 0.95,
        entities: { listName: 'produce' },
        requiresClarification: false,
      });

      const mockSession = {
        id: 'session-123',
        context: [],
        createdAt: new Date(),
        lastActivityAt: new Date(),
      };
      mockSessionManager.createSession = jest.fn().mockReturnValue(mockSession);
      mockSessionManager.setCurrentList = jest.fn();

      mockListService.create = jest.fn().mockReturnValue({
        id: 'list-123',
        name: 'produce',
        items: [],
      });

      await voiceService.processVoiceCommand({
        audioBlob: mockAudioBlob,
      });

      expect(mockSessionManager.setCurrentList).toHaveBeenCalledWith('session-123', 'list-123');
    });

    it('converts base64 audio to buffer for Whisper', async () => {
      mockWhisperCreate.mockResolvedValue({
        text: 'test command',
      });

      mockIntentParser.parseIntent = jest.fn().mockResolvedValue({
        action: 'unknown',
        confidence: 0,
        entities: {},
        requiresClarification: true,
        clarificationQuestion: 'I didn\'t understand that.',
      });

      mockSessionManager.createSession = jest.fn().mockReturnValue({
        id: 'session-123',
        context: [],
        createdAt: new Date(),
        lastActivityAt: new Date(),
      });

      await voiceService.processVoiceCommand({
        audioBlob: mockAudioBlob,
      });

      expect(mockWhisperCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          file: expect.any(Object), // Should be a File-like object
          model: 'whisper-1',
        })
      );
    });
  });
});
