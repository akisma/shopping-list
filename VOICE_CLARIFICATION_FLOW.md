# Voice Clarification Flow Architecture

## Overview

This document describes the multi-turn conversation architecture that enables the voice command system to ask clarification questions and wait for responses.

## Problem Solved

**Original Bug**: When the system asked "How much chicken?", tapping the mic button started a completely new command instead of responding to the question. The system had no memory of the pending action.

## Architecture

### Core Components

#### 1. VoiceListeningContext (`hooks/use-voice-listening-context.tsx`)

Central state management for voice listening modes.

**States:**
- `inactive` - No active voice interaction
- `waiting-for-clarification` - System asked a question, waiting for user response
- `background-wake-word` - Listening for wake word (Phase 2)

**Key Functions:**
```typescript
startListeningForClarification(pendingAction: PendingActionData)
// Sets mode to 'waiting-for-clarification'
// Stores pendingAction with: type, data, question, sessionId
// Starts 15-second auto-timeout

clearPendingAction()
// Clears mode back to 'inactive'
// Clears pending action data
// Cancels timeout
```

**Timeout Behavior:**
- 15-second automatic timeout clears clarification state
- Prevents UI from being stuck in clarification mode
- Uses useRef to track timeout and properly clean up

#### 2. VoiceButton (`components/voice-button.tsx`)

Voice recording button with visual clarification state.

**Normal State:**
- Blue/purple background
- "Hold to record" hint
- Accessibility: "Voice command button"

**Clarification State** (`listeningMode === 'waiting-for-clarification'`):
- 🟢 Green background (#10b981)
- Pulsing animation (800ms loop, scale 1.0 → 1.1)
- "Tap to answer..." hint text
- Accessibility: "Tap to answer clarification question"
- Single tap (not hold) to record

#### 3. VoiceActivationBanner (`components/VoiceActivationBanner.tsx`)

Banner showing system status or clarification questions.

**Normal State** (wake word banner):
- Light green background (#E8F5E9)
- Shows: "🎤 Voice Activation On - Say 'Hey Shoppy' to start (Coming Soon)"

**Clarification State** (`listeningMode === 'waiting-for-clarification'`):
- 🟡 Amber/yellow background (#FFF3CD) for attention
- Shows: pendingAction.question (e.g., "How much chicken?")
- Cancel button - calls clearPendingAction()
- Replaces wake word message entirely

#### 4. use-voice-commands Hook (`hooks/use-voice-commands.ts`)

Orchestrates voice command flow and context integration.

**Integration Points:**
```typescript
// On clarification response from backend
if (response.action === 'clarification') {
  startListeningForClarification({
    type: 'add_item',
    data: response.data,
    question: response.ttsText,
    sessionId: response.sessionId,
  });
}

// On successful completion
clearPendingAction();

// On error
clearPendingAction();
```

### Backend Components

#### 1. Intent Parser (`backend/src/services/intent-parser.ts`)

GPT-4 powered intent parsing with clarification support.

**System Prompt Updates:**
- Recognizes "add X to Y list" pattern
- Extracts listName even in add_item commands
- Sets `requiresClarification: true` when quantity missing
- Returns specific questions: "How much {itemName}?"

**Example Flows:**
```
"Add chicken to produce list" →
{
  action: "add_item",
  entities: { itemName: "chicken", listName: "produce" },
  requiresClarification: true,
  clarificationQuestion: "How much chicken?"
}
```

#### 2. Voice Service (`backend/src/services/voice-service.ts`)

Orchestrates multi-turn conversation flow.

**Key Changes:**

1. **createClarificationResponse()** - Now stores pending action:
   ```typescript
   // When GPT-4 returns clarification for add_item
   if (parsedIntent.action === 'add_item' && parsedIntent.entities?.itemName) {
     // Look up list by name if provided
     // Store pending action with itemName and listId
     this.sessionManager.setPendingAction(sessionId, 'add_item', {
       itemName: parsedIntent.entities.itemName,
       listId: targetListId,
     });
   }
   ```

2. **resolvePendingAction()** - Checks for pending action first:
   ```typescript
   // Before parsing new intent, check for pending action
   const pendingActionResult = await this.resolvePendingAction(session.id, transcript);
   if (pendingActionResult) {
     return { ...pendingActionResult, sessionId: session.id };
   }
   ```

3. **completePendingAddItem()** - Directly uses transcript as quantity:
   ```typescript
   // No GPT-4 parsing needed for clarification responses
   const quantity = transcript.trim(); // "2 pounds" → "2 pounds"
   const addedItem = this.itemService.add(listId, { name: itemName, quantity });
   ```

**Why This Works:**
- Skips GPT-4 for clarification responses (faster, more reliable)
- Avoids "2 pounds" being interpreted as British currency (£2)
- User's exact words become the quantity

#### 3. Session Manager (`backend/src/services/session-manager.ts`)

Manages session state and pending actions.

**Pending Action Structure:**
```typescript
{
  action: 'add_item',
  entities: {
    itemName: string,
    listId: string
  }
}
```

## Complete Flow Example

### Happy Path: "Add chicken to produce list" → "2 pounds"

1. **User says:** "Add chicken to produce list"
2. **Backend STT:** Transcribes audio → "Add chicken to produce list"
3. **Intent Parser (GPT-4):**
   ```json
   {
     "action": "add_item",
     "entities": { "itemName": "chicken", "listName": "produce" },
     "requiresClarification": true,
     "clarificationQuestion": "How much chicken?"
   }
   ```
4. **Voice Service:**
   - Finds "produce" list by name
   - Sets as current list
   - Stores pending action: `{ action: 'add_item', entities: { itemName: 'chicken', listId: 'produce-id' } }`
   - Returns clarification response
5. **Frontend (use-voice-commands):**
   - Receives clarification response
   - Calls `startListeningForClarification()`
   - Speaks: "How much chicken?"
6. **Frontend (VoiceButton):**
   - Changes to green background with pulsing
   - Shows "Tap to answer..."
7. **Frontend (VoiceActivationBanner):**
   - Shows amber banner
   - Displays: "How much chicken?"
   - Shows Cancel button
8. **User taps mic and says:** "2 pounds"
9. **Backend STT:** Transcribes audio → "2 pounds"
10. **Voice Service:**
    - Finds pending action ✅
    - Uses "2 pounds" directly as quantity
    - Adds item: `{ name: 'chicken', quantity: '2 pounds' }` to produce list
    - Clears pending action
    - Returns success
11. **Frontend:**
    - Calls `clearPendingAction()`
    - Returns to normal state
    - Updates list UI

### Timeout Path: User doesn't respond within 15 seconds

1. **System asks:** "How much chicken?"
2. **15 seconds pass...**
3. **Context timeout fires:**
   - Calls `clearPendingAction()`
   - UI returns to normal state
4. **Backend session timeout** (separate mechanism):
   - Session manager cleans up after 30 minutes inactivity

### Cancel Path: User presses Cancel button

1. **System asks:** "How much chicken?"
2. **User presses Cancel button**
3. **VoiceActivationBanner:**
   - Calls `clearPendingAction()`
4. **Context:**
   - Sets mode to 'inactive'
   - Clears pending action
   - Cancels timeout
5. **UI returns to normal state**

## Testing Strategy

### Unit Tests

**VoiceListeningContext** (9 tests):
- State transitions
- Timeout behavior
- Mode changes
- Error handling

**VoiceButton** (21 tests):
- Normal rendering
- Clarification state visual changes
- Pulsing animation
- Accessibility updates

**VoiceActivationBanner** (17 tests):
- Normal wake word banner
- Clarification question display
- Cancel button functionality
- Proper state transitions

**use-voice-commands** (13 tests):
- Context integration
- Clarification flow
- Success/error handling

### Integration Testing

**End-to-End Flow:**
1. Say "Add chicken to produce list"
2. Verify amber banner shows "How much chicken?"
3. Verify mic is green and pulsing
4. Tap mic, say "2 pounds"
5. Verify item added to produce list
6. Verify UI returns to normal

**Timeout Testing:**
1. Trigger clarification
2. Wait 15 seconds without responding
3. Verify UI auto-clears

**Cancel Testing:**
1. Trigger clarification
2. Press Cancel button
3. Verify immediate state clear

## Known Issues & Future Improvements

### Current Limitations

1. **No voice interruption**: User must wait for TTS to finish before responding
2. **Single clarification only**: Can't chain multiple clarification questions
3. **No partial quantity parsing**: "two" must be said as "2" or backend needs NLP
4. **List name must match exactly**: Case-insensitive but requires exact spelling

### Future Enhancements

1. **Interrupt TTS**: Allow user to start recording while system is speaking
2. **Multi-turn conversations**: Support chains of clarification
3. **Better NLP**: Parse "two pounds", "a dozen", etc. without GPT-4
4. **Fuzzy list matching**: "produce" matches "Produce List", "produce items", etc.
5. **Voice feedback**: Audible beep or tone when entering/exiting clarification mode

## Related Documentation

- See `WAKE_WORD_DETECTION.md` for Phase 2 wake word implementation
- See `PROJECT_STATUS.md` for overall project status
- See individual test files for detailed test coverage
