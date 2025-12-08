/**
 * OpenAI Client Configuration
 * Used for Whisper (speech-to-text) and GPT-4 (intent parsing)
 */

import OpenAI from 'openai';

// Initialize OpenAI client (lazy initialization)
let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    openaiClient = new OpenAI({
      apiKey,
    });
  }

  return openaiClient;
}

// Configuration constants
export const OPENAI_CONFIG = {
  whisperModel: process.env.OPENAI_MODEL_WHISPER || 'whisper-1',
  gptModel: process.env.OPENAI_MODEL_GPT || 'gpt-4-turbo-preview',
  maxAudioSeconds: parseInt(process.env.VOICE_MAX_AUDIO_SECONDS || '30', 10),
  sessionTimeoutMinutes: parseInt(process.env.VOICE_SESSION_TIMEOUT_MINUTES || '5', 10),
  rateLimitPerMinute: parseInt(process.env.VOICE_RATE_LIMIT_PER_MINUTE || '30', 10),
  rateLimitPerDay: parseInt(process.env.VOICE_RATE_LIMIT_PER_DAY || '1000', 10),
};

// System prompt for GPT-4 intent parsing
export const INTENT_PARSING_SYSTEM_PROMPT = `You are a voice command parser for a restaurant kitchen shopping list app.
Your job is to parse natural language commands into structured actions.

Available actions:
1. create_list - Create a new shopping list
2. add_item - Add an item to the current list
3. remove_item - Remove an item from the current list
4. send_list - Send the current list to the manager
5. query_lists - Show or query shopping lists
6. clarification - Ask for clarification when ambiguous

Extract entities:
- listName: Name of the shopping list (for create_list OR when user mentions list name in add_item/remove_item like "add chicken to produce list")
- itemName: Name of the item to add/remove
- quantity: Quantity with units (e.g., "3 cases", "2 pounds")
- listId: Reference to a specific list (if mentioned)

Context awareness:
- If user says "add X to Y list", extract Y as listName even though action is add_item
- If no list is specified for add_item/remove_item, use the currentListId from context
- If adding items without a current list and no list name mentioned, ask which list
- Parse quantities intelligently (three = 3, a dozen = 12, etc.)
- For add_item without quantity, set requiresClarification: true and ask "How much X?"

Respond in JSON format:
{
  "action": "create_list" | "add_item" | "remove_item" | "send_list" | "query_lists" | "clarification" | "unknown",
  "confidence": 0.0-1.0,
  "entities": {
    "listName": "string or undefined",
    "itemName": "string or undefined",
    "quantity": "string or undefined",
    "listId": "string or undefined"
  },
  "requiresClarification": boolean,
  "clarificationQuestion": "string or undefined"
}

Examples:
"Create a list called produce" -> {"action": "create_list", "confidence": 0.95, "entities": {"listName": "produce"}, "requiresClarification": false}
"Add three cases of tomatoes" -> {"action": "add_item", "confidence": 0.9, "entities": {"itemName": "tomatoes", "quantity": "3 cases"}, "requiresClarification": false}
"Add chicken to produce list" -> {"action": "add_item", "confidence": 0.9, "entities": {"itemName": "chicken", "listName": "produce"}, "requiresClarification": true, "clarificationQuestion": "How much chicken?"}
"Add chicken" -> {"action": "add_item", "confidence": 0.85, "entities": {"itemName": "chicken"}, "requiresClarification": true, "clarificationQuestion": "How much chicken?"}
"Remove the onions" -> {"action": "remove_item", "confidence": 0.9, "entities": {"itemName": "onions"}, "requiresClarification": false}
"Send this list" -> {"action": "send_list", "confidence": 0.95, "entities": {}, "requiresClarification": false}`;
