/**
 * Intent Parser Service
 * Uses GPT-4 to parse voice command transcripts into structured intents
 */

import { getOpenAIClient, INTENT_PARSING_SYSTEM_PROMPT, OPENAI_CONFIG } from '../config/openai';
import { ParsedIntent, VoiceCommand } from '../types';

interface ParseContext {
  currentListId?: string;
  lastCommands?: VoiceCommand[];
}

export class IntentParser {
  private client;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // ms

  constructor() {
    this.client = getOpenAIClient();
  }

  /**
   * Parse a voice command transcript into a structured intent
   * @param transcript - The text transcript from speech-to-text
   * @param context - Optional context (current list, command history)
   * @returns ParsedIntent with action, entities, confidence, clarification
   */
  async parseIntent(transcript: string, context: ParseContext): Promise<ParsedIntent> {
    let attempt = 0;

    while (attempt < this.maxRetries) {
      try {
        // Build context message for GPT-4
        const contextMessage = this.buildContextMessage(context);
        const userMessage = `${contextMessage}\n\nUser command: "${transcript}"`;

        // Call GPT-4 for intent parsing
        const response = await this.client.chat.completions.create({
          model: OPENAI_CONFIG.gptModel,
          messages: [
            { role: 'system', content: INTENT_PARSING_SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.3, // Lower temperature for more consistent parsing
          max_tokens: 500,
        });

        // Parse GPT-4 response
        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('Empty response from GPT-4');
        }

        const parsed = JSON.parse(content) as ParsedIntent;

        // Validate and normalize parsed intent
        this.validateParsedIntent(parsed);

        return parsed;
      } catch (error) {
        attempt++;
        
        if (attempt >= this.maxRetries) {
          // Max retries exceeded, return unknown intent
          console.error('Intent parsing failed after max retries:', error);
          return {
            action: 'unknown',
            confidence: 0,
            entities: {},
            requiresClarification: true,
            clarificationQuestion: 'Sorry, I had trouble understanding. Please try again.',
          };
        }

        // Wait before retrying
        await this.sleep(this.retryDelay * attempt);
      }
    }

    // Fallback (should never reach here)
    return {
      action: 'unknown',
      confidence: 0,
      entities: {},
      requiresClarification: true,
      clarificationQuestion: 'Sorry, I had trouble understanding. Please try again.',
    };
  }

  /**
   * Build context message for GPT-4
   */
  private buildContextMessage(context: ParseContext): string {
    const parts: string[] = [];

    if (context.currentListId) {
      parts.push(`Current list ID: ${context.currentListId}`);
    }

    if (context.lastCommands && context.lastCommands.length > 0) {
      parts.push('Recent commands:');
      context.lastCommands.forEach((cmd) => {
        parts.push(`- "${cmd.transcript}" (${cmd.intent})`);
      });
    }

    return parts.length > 0 ? `Context:\n${parts.join('\n')}` : 'No context available.';
  }

  /**
   * Validate and normalize parsed intent
   */
  private validateParsedIntent(intent: any): void {
    if (!intent.action) {
      throw new Error('Missing action in parsed intent');
    }

    if (typeof intent.confidence !== 'number') {
      throw new Error('Missing or invalid confidence in parsed intent');
    }

    if (!intent.entities || typeof intent.entities !== 'object') {
      throw new Error('Missing or invalid entities in parsed intent');
    }

    // Default requiresClarification to false if not provided
    if (intent.requiresClarification === undefined) {
      intent.requiresClarification = false;
    }

    // Default clarificationQuestion to undefined if not provided
    if (intent.clarificationQuestion === undefined) {
      intent.clarificationQuestion = undefined;
    }
  }

  /**
   * Sleep helper for retries
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
