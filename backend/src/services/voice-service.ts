/**
 * Voice Service
 * Main orchestrator for voice commands: Whisper STT → IntentParser → Action execution
 */

import { getOpenAIClient, OPENAI_CONFIG } from '../config/openai';
import { IntentParser } from './intent-parser';
import { SessionManager } from './session-manager';
import { ShoppingListService } from './shopping-list.service';
import { ShoppingListItemService } from './shopping-list-item.service';
import { VoiceCommandRequest, VoiceCommandResponse, VoiceCommand } from '../types';

export class VoiceService {
  private client;

  constructor(
    private intentParser: IntentParser,
    private sessionManager: SessionManager,
    private listService: ShoppingListService,
    private itemService: ShoppingListItemService
  ) {
    this.client = getOpenAIClient();
  }

  /**
   * Process a voice command from audio blob
   */
  async processVoiceCommand(request: VoiceCommandRequest): Promise<VoiceCommandResponse> {
    try {
      // Step 1: Get or create session
      let session = request.sessionId
        ? this.sessionManager.getSession(request.sessionId)
        : null;

      if (!session) {
        session = this.sessionManager.createSession();
      }

      // Step 2: Transcribe audio with Whisper
      const transcript = await this.transcribeAudio(request.audioBlob);

      // Step 3: Parse intent with GPT-4
      const context = {
        currentListId: session.currentListId,
        lastCommands: session.context,
      };
      const intent = await this.intentParser.parseIntent(transcript, context);

      // Step 4: Handle clarification
      if (intent.requiresClarification) {
        return {
          success: false,
          action: intent.action === 'unknown' ? 'error' : intent.action,
          ttsText: intent.clarificationQuestion || 'I need more information.',
          sessionId: session.id,
        };
      }

      // Step 5: Execute action
      const result = await this.executeAction(intent, session.id);

      // Step 6: Update session context
      const command: VoiceCommand = {
        timestamp: new Date(),
        transcript,
        intent: intent.action,
        action: intent.action,
        result: result.data,
      };
      this.sessionManager.updateContext(session.id, command);

      return {
        ...result,
        sessionId: session.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        action: 'error',
        ttsText: 'Sorry, I encountered an error processing your command.',
        sessionId: request.sessionId || '',
        error: errorMessage,
      };
    }
  }

  /**
   * Transcribe audio using Whisper
   */
  private async transcribeAudio(audioBlob: string): Promise<string> {
    try {
      // Convert base64 to buffer
      const buffer = Buffer.from(audioBlob, 'base64');
      
      // Create File-like object for OpenAI
      const audioFile = new File([buffer], 'audio.m4a', { type: 'audio/m4a' }) as any;

      const response = await this.client.audio.transcriptions.create({
        file: audioFile,
        model: OPENAI_CONFIG.whisperModel,
      });

      return response.text;
    } catch (error) {
      console.error('Audio transcription failed:', error);
      throw new Error(`Audio transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute the parsed action
   */
  private async executeAction(intent: any, sessionId: string): Promise<Omit<VoiceCommandResponse, 'sessionId'>> {
    try {
      switch (intent.action) {
        case 'create_list':
          return await this.handleCreateList(intent, sessionId);
        
        case 'add_item':
          return await this.handleAddItem(intent, sessionId);
        
        case 'remove_item':
          return await this.handleRemoveItem(intent, sessionId);
        
        case 'send_list':
          return await this.handleSendList(intent, sessionId);
        
        case 'query_lists':
          return await this.handleQueryLists(intent);
        
        default:
          return {
            success: false,
            action: 'error',
            ttsText: 'I\'m not sure how to help with that.',
          };
      }
    } catch (error) {
      throw new Error(`Action execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle create list action
   */
  private handleCreateList(intent: any, sessionId: string): Omit<VoiceCommandResponse, 'sessionId'> {
    const listName = intent.entities.listName;
    
    const list = this.listService.create({
      name: listName,
    });

    // Set as current list
    this.sessionManager.setCurrentList(sessionId, list.id);

    return {
      success: true,
      action: 'create_list',
      ttsText: `I've created a list called ${listName}.`,
      data: { listId: list.id, listName: list.name },
    };
  }

  /**
   * Handle add item action
   */
  private handleAddItem(intent: any, sessionId: string): Omit<VoiceCommandResponse, 'sessionId'> {
    const session = this.sessionManager.getSession(sessionId);
    
    if (!session?.currentListId) {
      return {
        success: false,
        action: 'clarification',
        ttsText: 'Which list would you like to add that to?',
      };
    }

    const itemName = intent.entities.itemName;
    const quantity = intent.entities.quantity;

    const item = this.itemService.add(session.currentListId, {
      name: itemName,
      quantity: quantity || '1',
    });

    const ttsText = quantity
      ? `I've added ${quantity} ${itemName} to your list.`
      : `I've added ${itemName} to your list.`;

    return {
      success: true,
      action: 'add_item',
      ttsText,
      data: { itemId: item.id, itemName: item.name, quantity: item.quantity },
    };
  }

  /**
   * Handle remove item action
   */
  private handleRemoveItem(intent: any, sessionId: string): Omit<VoiceCommandResponse, 'sessionId'> {
    const session = this.sessionManager.getSession(sessionId);
    
    if (!session?.currentListId) {
      return {
        success: false,
        action: 'clarification',
        ttsText: 'Which list would you like to remove that from?',
      };
    }

    const itemName = intent.entities.itemName;

    // Find item by name in current list
    const list = this.listService.getById(session.currentListId);
    if (!list) {
      return {
        success: false,
        action: 'error',
        ttsText: 'I couldn\'t find that list.',
      };
    }

    const item = list.items.find((i: any) => i.name.toLowerCase() === itemName.toLowerCase());

    if (!item) {
      return {
        success: false,
        action: 'error',
        ttsText: `I couldn't find ${itemName} in your list.`,
      };
    }

    this.itemService.delete(session.currentListId, item.id);

    return {
      success: true,
      action: 'remove_item',
      ttsText: `I've removed ${itemName} from your list.`,
      data: { itemId: item.id, itemName: item.name },
    };
  }

  /**
   * Handle send list action
   */
  private handleSendList(_intent: any, sessionId: string): Omit<VoiceCommandResponse, 'sessionId'> {
    const session = this.sessionManager.getSession(sessionId);
    
    if (!session?.currentListId) {
      return {
        success: false,
        action: 'clarification',
        ttsText: 'Which list would you like to send?',
      };
    }

    // In a real implementation, this would trigger the send flow
    // For now, we'll return a success message
    return {
      success: true,
      action: 'send_list',
      ttsText: 'Your list is ready to send. Please check your device to complete the action.',
      data: { listId: session.currentListId },
    };
  }

  /**
   * Handle query lists action
   */
  private handleQueryLists(_intent: any): Omit<VoiceCommandResponse, 'sessionId'> {
    const response = this.listService.getAll();
    const lists = response.lists;

    if (lists.length === 0) {
      return {
        success: true,
        action: 'query_lists',
        ttsText: 'You don\'t have any lists yet.',
        data: { lists: [] },
      };
    }

    const listNames = lists.map((l: any) => l.name).join(', ');
    const ttsText = lists.length === 1
      ? `You have 1 list: ${listNames}.`
      : `You have ${lists.length} lists: ${listNames}.`;

    return {
      success: true,
      action: 'query_lists',
      ttsText,
      data: { lists },
    };
  }
}
