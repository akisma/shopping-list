/**
 * Intent Parser Tests (TDD - RED Phase)
 * Tests GPT-4 intent parsing for voice commands
 */

import { IntentParser } from '../../../src/services/intent-parser';

// Mock OpenAI client
const mockCreate = jest.fn();
const mockGetOpenAIClient = jest.fn(() => ({
  chat: {
    completions: {
      create: mockCreate,
    },
  },
}));

jest.mock('../../../src/config/openai', () => ({
  getOpenAIClient: () => mockGetOpenAIClient(),
  INTENT_PARSING_SYSTEM_PROMPT: 'Mock system prompt',
  OPENAI_CONFIG: {
    gptModel: 'gpt-4-turbo-preview',
  },
}));

describe('IntentParser', () => {
  let parser: IntentParser;

  beforeEach(() => {
    mockCreate.mockClear();
    parser = new IntentParser();
  });

  describe('parseIntent', () => {
    it('parses "create list" command correctly', async () => {
      // Mock GPT-4 response
      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              action: 'create_list',
              confidence: 0.95,
              entities: { listName: 'produce' },
              requiresClarification: false,
            }),
          },
        }],
      });

      const result = await parser.parseIntent('create a list called produce', {});

      expect(result.action).toBe('create_list');
      expect(result.entities.listName).toBe('produce');
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.requiresClarification).toBe(false);
    });

    it('parses "add item" command with quantity', async () => {
      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              action: 'add_item',
              confidence: 0.9,
              entities: { itemName: 'tomatoes', quantity: '3 cases' },
              requiresClarification: false,
            }),
          },
        }],
      });

      const result = await parser.parseIntent('add three cases of tomatoes', { currentListId: 'list-123' });

      expect(result.action).toBe('add_item');
      expect(result.entities.itemName).toBe('tomatoes');
      expect(result.entities.quantity).toBe('3 cases');
      expect(result.requiresClarification).toBe(false);
    });

    it('parses "add item" without quantity', async () => {
      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              action: 'add_item',
              confidence: 0.9,
              entities: { itemName: 'olive oil' },
              requiresClarification: false,
            }),
          },
        }],
      });

      const result = await parser.parseIntent('add olive oil', { currentListId: 'list-123' });

      expect(result.action).toBe('add_item');
      expect(result.entities.itemName).toBe('olive oil');
      expect(result.entities.quantity).toBeUndefined();
    });

    it('parses "remove item" command', async () => {
      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              action: 'remove_item',
              confidence: 0.9,
              entities: { itemName: 'onions' },
              requiresClarification: false,
            }),
          },
        }],
      });

      const result = await parser.parseIntent('remove the onions', { currentListId: 'list-123' });

      expect(result.action).toBe('remove_item');
      expect(result.entities.itemName).toBe('onions');
    });

    it('parses "send list" command', async () => {
      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              action: 'send_list',
              confidence: 0.95,
              entities: {},
              requiresClarification: false,
            }),
          },
        }],
      });

      const result = await parser.parseIntent('send this list', { currentListId: 'list-123' });

      expect(result.action).toBe('send_list');
      expect(result.requiresClarification).toBe(false);
    });

    it('parses "query lists" command', async () => {
      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              action: 'query_lists',
              confidence: 0.9,
              entities: {},
              requiresClarification: false,
            }),
          },
        }],
      });

      const result = await parser.parseIntent('show my lists', {});

      expect(result.action).toBe('query_lists');
    });

    it('requests clarification for ambiguous command', async () => {
      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              action: 'clarification',
              confidence: 0.5,
              entities: { itemName: 'tomatoes' },
              requiresClarification: true,
              clarificationQuestion: 'Which list would you like to add tomatoes to?',
            }),
          },
        }],
      });

      const result = await parser.parseIntent('add tomatoes', {});

      expect(result.action).toBe('clarification');
      expect(result.requiresClarification).toBe(true);
      expect(result.clarificationQuestion).toContain('Which list');
    });

    it('handles unknown command gracefully', async () => {
      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              action: 'unknown',
              confidence: 0.3,
              entities: {},
              requiresClarification: true,
              clarificationQuestion: 'I didn\'t understand that. Can you rephrase?',
            }),
          },
        }],
      });

      const result = await parser.parseIntent('blah blah blah', {});

      expect(result.action).toBe('unknown');
      expect(result.confidence).toBeLessThan(0.5);
      expect(result.requiresClarification).toBe(true);
    });

    it('includes context in GPT-4 prompt', async () => {
      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              action: 'add_item',
              confidence: 0.9,
              entities: { itemName: 'salt' },
              requiresClarification: false,
            }),
          },
        }],
      });

      const context = {
        currentListId: 'list-123',
        lastCommands: [
          { transcript: 'create list produce', intent: 'create_list', action: 'create_list', timestamp: new Date() },
        ],
      };

      await parser.parseIntent('add salt', context);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('list-123'),
            }),
          ]),
        })
      );
    });

    it('handles GPT-4 API errors with retries', async () => {
      mockCreate
        .mockRejectedValueOnce(new Error('API rate limit'))
        .mockRejectedValueOnce(new Error('API rate limit'))
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                action: 'unknown',
                confidence: 0,
                entities: {},
                requiresClarification: true,
                clarificationQuestion: 'Sorry, I had trouble understanding. Please try again.',
              }),
            },
          }],
        });

      const result = await parser.parseIntent('add tomatoes', {});

      expect(mockCreate).toHaveBeenCalledTimes(3);
      expect(result.action).toBe('unknown');
    });

    it('handles malformed GPT-4 response', async () => {
      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: 'not valid json',
          },
        }],
      });

      const result = await parser.parseIntent('add tomatoes', {});

      expect(result.action).toBe('unknown');
      expect(result.requiresClarification).toBe(true);
    });

    it('handles missing GPT-4 response', async () => {
      mockCreate.mockResolvedValue({
        choices: [],
      });

      const result = await parser.parseIntent('add tomatoes', {});

      expect(result.action).toBe('unknown');
      expect(result.requiresClarification).toBe(true);
    });
  });
});
