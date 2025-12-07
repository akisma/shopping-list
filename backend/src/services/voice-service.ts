/**
 * Voice Service
 * Main orchestrator for voice commands: Whisper STT → IntentParser → Action execution
 */

import { getOpenAIClient, OPENAI_CONFIG } from '../config/openai';
import { IntentParser } from './intent-parser';
import { SessionManager } from './session-manager';
import { ShoppingListService } from './shopping-list.service';
import { ShoppingListItemService } from './shopping-list-item.service';
import { VoiceCommandRequest, VoiceCommandResponse, VoiceCommand, VoiceSession } from '../types';

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
      const session = this.getOrCreateSession(request.sessionId);
      const transcript = await this.transcribeAudio(request.audioBlob);

      // Check if user is responding to a pending multi-turn interaction
      const pendingActionResult = await this.resolvePendingAction(session.id, transcript);
      if (pendingActionResult) {
        return { ...pendingActionResult, sessionId: session.id };
      }

      // Parse user intent and execute action
      const sessionContext = this.buildSessionContext(session);
      const parsedIntent = await this.intentParser.parseIntent(transcript, sessionContext);

      if (parsedIntent.requiresClarification) {
        return this.createClarificationResponse(parsedIntent, session.id);
      }

      const actionResult = await this.executeAction(parsedIntent, session.id);
      this.recordCommandInSession(session.id, transcript, parsedIntent.action, actionResult.data);

      return { ...actionResult, sessionId: session.id };
    } catch (error) {
      return this.createErrorResponse(request.sessionId, error);
    }
  }

  /**
   * Get existing session or create new one
   */
  private getOrCreateSession(sessionId?: string): VoiceSession {
    if (sessionId) {
      const existingSession = this.sessionManager.getSession(sessionId);
      if (existingSession) {
        return existingSession;
      }
    }
    return this.sessionManager.createSession();
  }

  /**
   * Build context object for intent parsing
   */
  private buildSessionContext(session: VoiceSession) {
    return {
      currentListId: session.currentListId,
      lastCommands: session.context,
    };
  }

  /**
   * Resolve pending multi-turn action if one exists
   */
  private async resolvePendingAction(
    sessionId: string,
    transcript: string
  ): Promise<Omit<VoiceCommandResponse, 'sessionId'> | null> {
    const pendingAction = this.sessionManager.getPendingAction(sessionId);
    
    if (pendingAction?.action === 'add_item') {
      return await this.completePendingAddItem(sessionId, transcript, pendingAction.entities);
    }
    
    return null;
  }

  /**
   * Complete a pending add_item action with the provided quantity
   */
  private async completePendingAddItem(
    sessionId: string,
    transcript: string,
    pendingEntities: Record<string, any>
  ): Promise<Omit<VoiceCommandResponse, 'sessionId'> | null> {
    const session = this.sessionManager.getSession(sessionId);
    if (!session) return null;

    const { itemName, listId } = pendingEntities;
    
    // For clarification responses, the transcript IS the quantity
    // No need to parse full intent - just use the transcript as the quantity
    const quantity = transcript.trim();

    // Validate that it looks like a quantity (simple check)
    if (!quantity || quantity.length === 0) {
      return null; // Empty response, continue normal flow
    }

    const addedItem = this.itemService.add(listId, { name: itemName, quantity });
    
    this.sessionManager.clearPendingAction(sessionId);
    this.recordCommandInSession(sessionId, transcript, 'add_item', {
      itemId: addedItem.id,
      itemName: addedItem.name,
      quantity: addedItem.quantity,
    });

    return this.createAddItemSuccessResponse(addedItem, quantity, itemName);
  }

  /**
   * Record a voice command in session context
   */
  private recordCommandInSession(
    sessionId: string,
    transcript: string,
    actionName: string,
    resultData: any
  ): void {
    const command: VoiceCommand = {
      timestamp: new Date(),
      transcript,
      intent: actionName,
      action: actionName,
      result: resultData,
    };
    this.sessionManager.updateContext(sessionId, command);
  }

  /**
   * Create clarification response
   */
  private createClarificationResponse(
    parsedIntent: any,
    sessionId: string
  ): VoiceCommandResponse {
    const action = parsedIntent.action === 'unknown' ? 'error' : 'clarification';
    
    // If this is an add_item clarification, store the pending action
    if (parsedIntent.action === 'add_item' && parsedIntent.entities?.itemName) {
      const session = this.sessionManager.getSession(sessionId);
      let targetListId = session?.currentListId;
      
      // If listName is provided, look up the list
      if (parsedIntent.entities.listName) {
        const { lists } = this.listService.getAll();
        const targetList = lists.find((list: any) => 
          list.name.toLowerCase() === parsedIntent.entities.listName.toLowerCase()
        );
        if (targetList) {
          targetListId = targetList.id;
          this.sessionManager.setCurrentList(sessionId, targetList.id);
        }
      }
      
      // Store pending action with itemName and listId
      if (targetListId) {
        this.sessionManager.setPendingAction(sessionId, 'add_item', {
          itemName: parsedIntent.entities.itemName,
          listId: targetListId,
        });
      }
    }
    
    return {
      success: false,
      action,
      ttsText: parsedIntent.clarificationQuestion || 'I need more information.',
      sessionId,
    };
  }

  /**
   * Create error response
   */
  private createErrorResponse(sessionId: string | undefined, error: unknown): VoiceCommandResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      action: 'error',
      ttsText: 'Sorry, I encountered an error processing your command.',
      sessionId: sessionId || '',
      error: errorMessage,
    };
  }

  /**
   * Transcribe audio using Whisper
   */
  private async transcribeAudio(audioBlob: string): Promise<string> {
    try {
      // Log audio details
      const audioBlobLength = audioBlob.length;
      const audioSizeKB = (audioBlobLength / 1024).toFixed(2);
      console.log(`[VoiceService] Received audio: ${audioSizeKB} KB (${audioBlobLength} chars base64)`);
      
      // Convert base64 to buffer
      const buffer = Buffer.from(audioBlob, 'base64');
      const bufferSizeKB = (buffer.length / 1024).toFixed(2);
      console.log(`[VoiceService] Audio buffer: ${bufferSizeKB} KB (${buffer.length} bytes)`);
      
      // Create File-like object for OpenAI
      const audioFile = new File([buffer], 'audio.m4a', { type: 'audio/m4a' }) as any;

      const response = await this.client.audio.transcriptions.create({
        file: audioFile,
        model: OPENAI_CONFIG.whisperModel,
      });

      // Strip wake words from the beginning of the transcript
      // Common wake words: "picovoice", "hey siri", "ok google", "alexa", etc.
      const wakeWords = ['picovoice', 'pico voice', 'peak of voice'];
      let transcript = response.text.trim();
      
      for (const wakeWord of wakeWords) {
        // Case-insensitive match at the start of transcript
        const regex = new RegExp(`^${wakeWord}[,\\s]+`, 'i');
        transcript = transcript.replace(regex, '');
      }
      
      console.log('[VoiceService] Original transcript:', response.text);
      console.log('[VoiceService] Cleaned transcript:', transcript);

      return transcript;
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
    const { itemName, quantity, listName } = intent.entities;

    // If listName is provided, look up the list by name
    let targetListId = session?.currentListId;
    if (listName) {
      const { lists } = this.listService.getAll();
      const targetList = lists.find((list: any) => 
        list.name.toLowerCase() === listName.toLowerCase()
      );
      
      if (targetList) {
        targetListId = targetList.id;
        // Update session's current list
        this.sessionManager.setCurrentList(sessionId, targetList.id);
      } else {
        return this.createClarificationResponse(
          { action: 'add_item', clarificationQuestion: `I couldn't find a list called "${listName}". Which list would you like to add ${itemName} to?` },
          sessionId
        );
      }
    }
    
    if (!targetListId) {
      return this.createClarificationResponse(
        { action: 'add_item', clarificationQuestion: 'Which list would you like to add that to?' },
        sessionId
      );
    }

    // If quantity is missing, ask for it and store pending action
    if (!quantity) {
      this.sessionManager.setPendingAction(sessionId, 'add_item', {
        itemName,
        listId: targetListId,
      });

      return this.createClarificationResponse(
        { action: 'add_item', clarificationQuestion: `How much ${itemName}?` },
        sessionId
      );
    }

    const addedItem = this.itemService.add(targetListId, {
      name: itemName,
      quantity,
    });

    return this.createAddItemSuccessResponse(addedItem, quantity, itemName);
  }

  /**
   * Create success response for adding an item
   */
  private createAddItemSuccessResponse(
    addedItem: any,
    quantity: string,
    itemName: string
  ): Omit<VoiceCommandResponse, 'sessionId'> {
    return {
      success: true,
      action: 'add_item',
      ttsText: `I've added ${quantity} ${itemName} to your list.`,
      data: { 
        itemId: addedItem.id, 
        itemName: addedItem.name, 
        quantity: addedItem.quantity 
      },
    };
  }

  /**
   * Validate that session has an active list, return clarification if not
   */
  private requireActiveList(
    sessionId: string,
    actionName: string,
    clarificationMessage: string
  ): { listId: string } | Omit<VoiceCommandResponse, 'sessionId'> {
    const session = this.sessionManager.getSession(sessionId);
    
    if (!session?.currentListId) {
      return this.createClarificationResponse(
        { action: actionName, clarificationQuestion: clarificationMessage },
        sessionId
      );
    }

    return { listId: session.currentListId };
  }

  /**
   * Handle remove item action
   */
  private handleRemoveItem(intent: any, sessionId: string): Omit<VoiceCommandResponse, 'sessionId'> {
    const activeListOrError = this.requireActiveList(
      sessionId,
      'remove_item',
      'Which list would you like to remove that from?'
    );
    
    if ('ttsText' in activeListOrError) {
      return activeListOrError;
    }

    const { itemName } = intent.entities;
    const list = this.listService.getById(activeListOrError.listId);
    
    if (!list) {
      return {
        success: false,
        action: 'error',
        ttsText: 'I couldn\'t find that list.',
      };
    }

    const itemToRemove = list.items.find((i: any) => 
      i.name.toLowerCase() === itemName.toLowerCase()
    );

    if (!itemToRemove) {
      return {
        success: false,
        action: 'error',
        ttsText: `I couldn't find ${itemName} in your list.`,
      };
    }

    this.itemService.delete(activeListOrError.listId, itemToRemove.id);

    return {
      success: true,
      action: 'remove_item',
      ttsText: `I've removed ${itemName} from your list.`,
      data: { itemId: itemToRemove.id, itemName: itemToRemove.name },
    };
  }

  /**
   * Handle send list action
   */
  private handleSendList(_intent: any, sessionId: string): Omit<VoiceCommandResponse, 'sessionId'> {
    const activeListOrError = this.requireActiveList(
      sessionId,
      'send_list',
      'Which list would you like to send?'
    );
    
    if ('ttsText' in activeListOrError) {
      return activeListOrError;
    }

    // In a real implementation, this would trigger the send flow
    // For now, we'll return a success message
    return {
      success: true,
      action: 'send_list',
      ttsText: 'Your list is ready to send. Please check your device to complete the action.',
      data: { listId: activeListOrError.listId },
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
