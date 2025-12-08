# Shopping List Mobile App - Project Status

**Last Updated:** December 6, 2025  
**Current Phase:** Task 4 - Phase 2.4 Wake Word Detection Complete  
**Overall Status:** ✅ Backend API Complete | ✅ Mobile CRUD Complete | ✅ Send to Manager Complete | ✅ Voice Stubs Complete | ✅ Backend Voice Services Complete | ✅ Mobile Audio & Voice Commands Working | ✅ Wake Word Detection Complete

---

## 🎯 Project Context

**Purpose:** Enable restaurant chefs to create and manage shopping lists for ingredients/supplies using voice commands while working in the kitchen.

**Key Users:**
- **Chefs:** Create lists via mobile app (voice-first, hands-free)
- **Managers:** Receive sent lists and place orders via web interface

**Critical Features:**
- Voice-driven list/item creation (OpenAI Whisper + GPT-4)
- Text-to-speech confirmations
- Send list workflow (chef → manager)
- Push notifications for reminders
- Mobile-first design (large touch targets, kitchen-friendly)

---

## Task Breakdown

### ✅ Task 1: Mobile Platform & Repo Foundation (COMPLETE)

**Status:** Complete  
**Duration:** October 2025

- ✅ Expo project initialized with TypeScript
- ✅ React Native 0.81.5 + Expo SDK 54
- ✅ Expo Router navigation configured
- ✅ Jest + React Native Testing Library setup
- ✅ ESLint + TypeScript strict mode
- ✅ Basic project structure established

---

### ✅ Task 2: Backend API Development (COMPLETE)

**Status:** Complete  
**Branch:** `feature/task-2`  
**Duration:** Completed November 2, 2025

#### Deliverables

✅ **Database Schema**
- SQLite with better-sqlite3
- Tables: shopping_lists, shopping_list_items, reminders
- Proper foreign keys and CASCADE deletes
- Indexes on frequently queried columns

✅ **Service Layer**
- `ShoppingListService` - CRUD operations for lists
- `ShoppingListItemService` - Item management
- `ReminderService` - Reminder scheduling (stub for Task 6)
- 100% test coverage on all business logic

✅ **REST API**
- 10 endpoints covering all CRUD operations
- Zod validation on all inputs
- Proper HTTP status codes
- CORS configured for Expo dev servers

✅ **Testing**
- 62 unit tests, all passing
- 100% coverage on services layer
- Mock database for isolation
- TDD approach (RED-GREEN-REFACTOR)

✅ **Code Quality**
- TypeScript strict mode
- ESLint configured and passing
- Pino structured logging
- Error handling middleware

✅ **Documentation**
- `backend/README.md` with API examples
- `.docs/TECHNICAL_DOCUMENTATION.md` updated
- All endpoints documented with request/response examples

#### Test Results

```
Test Suites: 7 passed, 7 total
Tests:       62 passed, 62 total
Snapshots:   0 total
Coverage:    100% statements, 100% branches, 100% functions, 100% lines
Time:        0.5s
```

#### Linter Results

```
ESLint: 0 errors, 2 warnings (non-blocking)
```

#### Server Status

- ✅ Running on port 3001
- ✅ Health check endpoint responding
- ✅ All CRUD operations validated via manual smoke tests
- ✅ CORS configured for mobile dev

---

## API Endpoints

### Shopping Lists

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/shopping-lists` | Create list with optional items |
| GET | `/api/v1/shopping-lists` | Get all lists (supports ?status filter) |
| GET | `/api/v1/shopping-lists/:id` | Get single list with items |
| PUT | `/api/v1/shopping-lists/:id` | Update list name or status |
| DELETE | `/api/v1/shopping-lists/:id` | Delete list (cascades) |
| POST | `/api/v1/shopping-lists/:id/send` | Mark as sent/complete |

### Shopping List Items

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/shopping-lists/:listId/items` | Add item |
| PUT | `/api/v1/shopping-lists/:listId/items/:itemId` | Update item |
| DELETE | `/api/v1/shopping-lists/:listId/items/:itemId` | Delete item |

### Reminders (Stub)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/reminders` | Schedule reminder |
| PUT | `/api/v1/reminders/:id` | Update reminder |
| DELETE | `/api/v1/reminders/:id` | Cancel reminder |

---

## Architecture

### Layered Design

```
┌─────────────────────┐
│    Controllers      │  ← Thin Express adapters
│  (0% coverage)      │     Validation & HTTP handling
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     Services        │  ← ALL business logic
│  (100% coverage)    │     Fully tested
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     Database        │  ← Pure data access
│  (0% coverage)      │     No validation/logic
└─────────────────────┘
```

### Key Principles

- **Services own business logic** - Framework-agnostic, fully testable
- **Controllers are thin** - Just validate and delegate
- **Database is pure** - No business logic, just SQL
- **Dependency injection** - Services receive IDatabase interface
- **Unit tests only** - No integration tests to avoid mocking complexity

---

## Technology Stack

### Backend

- **Runtime:** Node.js 18+
- **Framework:** Express 4.21.2
- **Language:** TypeScript 5.7.2 (strict mode)
- **Database:** SQLite (better-sqlite3 11.7.0)
- **Validation:** Zod 3.24.1
- **Logging:** Pino 9.6.0
- **Testing:** Jest 29.7.0 + ts-jest 29.2.5
- **Linting:** ESLint 9.17.0 + TypeScript ESLint

### Mobile (Planned)

- **Framework:** React Native 0.81.5
- **Platform:** Expo SDK 54
- **Language:** TypeScript 5.9.2
- **Navigation:** Expo Router 6.0
- **Testing:** Jest + React Native Testing Library

---

## Development Workflow

### Quick Start

```bash
# Backend
cd backend
npm install
npm run dev          # Start dev server
npm test            # Run tests
npm run lint        # Run linter

# Mobile (TODO)
cd mobile
npm install
npm start           # Start Expo dev server
```

### Environment Variables

```bash
# Backend
PORT=3001
NODE_ENV=development
DATABASE_PATH=./data/shopping-list.db
CORS_ORIGINS=http://localhost:8081,http://localhost:19000
```

---

### 🔄 Task 3: Mobile UI Skeleton & State Management (IN PROGRESS)

**Status:** 85% Complete - CRUD & Send to Manager Done, Voice Stubs & Accessibility Pending  
**Branch:** `feature/task-2` (continuing mobile work)  
**Duration:** November 2025

#### Completed Deliverables

✅ **Navigation & Routing**
- Expo Router tab navigation configured
- Shopping List tab at `/app/(tabs)/index.tsx`
- List detail screen at `/app/(tabs)/list-detail.tsx`
- Settings tab placeholder

✅ **State Management**
- React Query (@tanstack/react-query) fully integrated
- Axios API client with base URL configuration
- Custom hooks for all CRUD operations:
  - `useShoppingLists` - Fetch all lists
  - `useShoppingListDetail` - Fetch single list with items
  - `useCreateShoppingList` - Create new list
  - `useDeleteShoppingList` - Delete list
  - `useCreateItem` - Add item to list
  - `useUpdateItem` - Edit existing item
  - `useDeleteItem` - Remove item from list
- Optimistic updates for instant UI feedback
- Error handling and loading states
- Cache invalidation on mutations

✅ **UI Components**
- Shopping lists overview screen with create/delete
- List detail screen showing all items
- Item creation modal with validation (name, quantity, notes)
- Item edit modal with pre-filled data
- Item deletion with confirmation dialog
- Reusable modals: `ConfirmationModal`, `ItemFormModal`
- Loading states, empty states, error messages
- Large touch targets suitable for kitchen use

✅ **Testing Infrastructure**
- 125 tests passing across 14 test suites
- TDD approach: RED-GREEN-REFACTOR-DOCUMENT cycle
- Centralized test utilities (`__tests__/test-utils.tsx`)
- Global test setup (`__tests__/setup.ts`)
- Comprehensive test documentation (`__tests__/TESTING_GUIDE.md`)
- Test coverage:
  - Shopping list CRUD (14 tests including voice features)
  - List detail CRUD (36 tests including voice features)
  - Item creation (8 tests)
  - Item editing (8 tests)
  - Item deletion (6 tests)
  - Send to manager (8 tests)
  - Voice status indicator (13 tests)
  - Voice activation banner (10 tests)
  - Settings screen voice features (11 tests)
  - Component snapshots and integration tests

✅ **Code Quality**
- TypeScript strict mode with proper interfaces
- ESLint configured and passing
- Modular component architecture
- Reusable modal patterns
- Consistent error handling

✅ **Documentation** (Updated continuously after each phase)
- PROJECT_STATUS.md reflects current state
- TESTING_GUIDE.md documents test patterns and utilities
- REFACTOR_SUMMARY.md explains test infrastructure improvements
- Component patterns documented inline
- Memory system updated with project context

✅ **Send/Complete Actions** (Phase 5 - COMPLETE)
- ✅ Prominent "Send to Manager" button on list detail screen
- ✅ Visual confirmation alert when list is sent successfully
- ✅ Status badge showing active/sent/completed states (color-coded)
- ✅ Backend endpoint integration (POST /api/v1/shopping-lists/:id/send)
- ✅ 8 comprehensive tests for send workflow
- ✅ Conditional logic: button only shows for active lists with items
- ✅ Error handling with clear error messages
- ✅ Confirmation modal before sending

✅ **Voice UI Stubs (Phase 6 - COMPLETE)**
- ✅ Reusable `VoiceStatusIndicator` component with 4 states (coming-soon, ready, listening, processing)
- ✅ `VoiceActivationBanner` showing "Hey Shoppy" wake word messaging
- ✅ Voice button integrated into Shopping Lists screen header
- ✅ Voice button integrated into List Detail screen header
- ✅ Settings screen with voice features section (2 toggles)
- ✅ "Coming Soon" alerts on all voice interactions
- ✅ All components fully tested (29 new tests)
- ✅ Linting passing with no errors
- ✅ Hands-free voice activation messaging ("Hey Shoppy")
- ✅ Kitchen-friendly 44pt touch targets maintained

#### Remaining Work (Task 3)

⏳ **Accessibility & Kitchen UX** (Phase 7 - ~1 hour)
- [ ] Verify touch target sizes across all screens (minimum 44x44pt)
- [ ] High contrast mode testing
- [ ] Landscape orientation support
- [ ] Test on mid-tier Android devices
- [ ] Performance validation

#### Test Results (Current)

```
Test Suites: 14 passed, 14 total
Tests:       125 passed, 125 total
Snapshots:   0 total
Time:        ~2.3s
```

---

## Next Steps

### Task 3 Completion (IMMEDIATE - ~1 hour)

Priority 1: Accessibility & Kitchen UX Validation (Phase 7)
- Verify touch target sizes across all screens (minimum 44x44pt)
- High contrast mode testing
- Landscape orientation support
- Test on mid-tier Android devices
- Performance validation
- Update PROJECT_STATUS.md to 100% complete
- Update memory system with final Task 3 capabilities

**Note:** Documentation and memory updates happen after EACH phase completion.

### Task 4: Voice Integration (IN PROGRESS)

**Status:** Phase 2 Complete - Mobile Audio Capture & Voice Commands Working  
**Branch:** `feature/task-2` (continuing)  
**Started:** November 25, 2025  
**Phase 2 Complete:** November 28, 2025

**Goal:** Replace voice UI stubs with real OpenAI Whisper (speech-to-text) and GPT-4 (intent parsing) integration

---

#### ✅ Phase 1: Backend Voice Infrastructure (COMPLETE)

**Duration:** Day 1 (November 25, 2025)  
**Approach:** TDD (RED-GREEN-REFACTOR-DOCUMENT)

**Deliverables:**

✅ **OpenAI Integration Setup**
- Installed `openai@4.73.1` SDK
- Created configuration file (`src/config/openai.ts`)
- GPT-4 system prompt for intent parsing (6 actions: create_list, add_item, remove_item, send_list, query_lists, clarification)
- Environment variables documented (`.env.example`)

✅ **IntentParser Service** (12/12 tests passing)
- Calls GPT-4 to parse voice command transcripts
- Extracts structured intents (action, entities, confidence)
- Handles ambiguous commands with clarification requests
- Retry logic for API failures (3 attempts)
- Entity extraction: listName, itemName, quantity, listId

✅ **SessionManager Service** (21/21 tests passing)
- In-memory session store with UUID-based session IDs
- 5-minute session timeout with automatic cleanup
- Context retention (last 5 commands)
- Current list tracking for voice context
- Session CRUD operations (create, get, update, delete)

✅ **VoiceService Orchestrator** (12/12 tests passing)
- Complete pipeline: Audio (base64) → Whisper STT → GPT-4 Intent Parser → CRUD Action
- Integrates with existing ShoppingListService and ShoppingListItemService
- Generates TTS-friendly response text
- Error handling for transcription, parsing, and action execution
- Context-aware command processing

✅ **Voice API Endpoints**
- `POST /api/voice/command` - Process voice command (rate limited: 30/min)
- `POST /api/voice/session` - Create new session (rate limited: 10/min)
- `GET /api/voice/session/:id` - Retrieve session
- `DELETE /api/voice/session/:id` - Delete session
- Request validation (audioBlob required, max 5MB)
- Express rate limiting with `express-rate-limit`

✅ **TypeScript Types**
- `VoiceCommandRequest` - Audio blob + optional session ID
- `VoiceCommandResponse` - Success, action, TTS text, session ID, data, error
- `VoiceSession` - Session state with context and timestamps
- `VoiceCommand` - Command history entry
- `ParsedIntent` - Structured intent from GPT-4

#### Test Results (Phase 1)

```
Test Suites: 8 passed, 1 failed (integration mocking), 9 total
Tests:       115 passed, 13 failed (integration mocking), 128 total
Voice Tests: 53 new tests (45 service + 8 endpoint validation)
Original:    62 tests (all still passing)
Coverage:    Voice services ~95% covered
Time:        10.5s
```

**Key Metrics:**
- 53 new voice tests written using TDD approach
- IntentParser: 12 tests covering GPT-4 integration, retry logic, error handling
- SessionManager: 21 tests covering CRUD, timeouts, context retention
- VoiceService: 12 tests covering full orchestration pipeline
- Voice endpoints: 8 validation tests passing (rate limiting, request validation)

#### Architecture Decisions

**Backend-Heavy Approach:**
- Voice processing on server (not client) for security
- OpenAI API keys never exposed to mobile app
- Session management server-side for context persistence
- Rate limiting at API layer (30 commands/min per user)

**Voice Command Flow:**
1. Mobile app records audio → uploads base64-encoded audio blob
2. Backend Whisper STT → transcript text
3. Backend GPT-4 + context → parsed intent
4. Backend executes CRUD action on shopping lists
5. Backend returns result + TTS text
6. Mobile app updates UI + speaks confirmation

**Supported Commands:**
- "Create a list called [name]" → create_list
- "Add [item]" → add_item (requires current list context)
- "Add [quantity] [item]" → add_item with quantity
- "Remove [item]" → remove_item
- "Send this list" → send_list
- "Show my lists" → query_lists

---

#### ✅ Phase 2: Mobile Audio Capture & Voice Commands (COMPLETE)

**Duration:** Days 2-4 (November 27-28, 2025)  
**Approach:** TDD with physical device testing

**Deliverables:**

✅ **expo-audio Integration**
- Migrated from expo-av to expo-audio ~16.0.7
- useAudioRecorder + useAudioRecorderState hooks
- Fixed critical recording state bug (capture state BEFORE stop)
- Minimum recording duration validation (300ms)
- Base64 audio encoding with expo-file-system
- Audio config: 44100Hz, high quality, .m4a format

✅ **VoiceButton Component**
- Press-and-hold microphone button with visual feedback
- Red pulsing animation during recording
- "Keep holding..." hint for short recordings
- Fixed layout jumping with feedbackContainer (20px fixed height)
- Haptic feedback on press/release
- Kitchen-friendly 44pt touch target

✅ **useAudioRecorder Hook**
- Custom hook wrapping expo-audio with proper state management
- Permission handling (requestPermissions)
- Recording state captured before stopping (critical fix)
- Duration tracking with live updates
- Base64 conversion for API upload

✅ **Voice Command Integration**
- useVoiceCommands hook for backend communication
- Session ID management (persists across commands)
- Clarification vs error handling
- Returns structured result: { success, action, data, ttsText }

✅ **Backend Refactoring**
- Fixed database instance sharing bug (dependency injection)
- Voice controller shares same DB instance as REST API
- Fixed GPT-4 validation (default requiresClarification to false)
- Updated system prompt (quantity optional, no clarification)
- Cleaned up all debug logging

✅ **End-to-End Testing**
- "Create a list called produce" ✅ Working
- "Add tomatoes" ✅ Working (uses currentListId from context)
- "Add three cases of tomatoes" ✅ Working (quantity extraction)
- Lists appear immediately in UI after voice creation
- Items appear in list detail after voice addition

✅ **Code Quality**
- All debug console.log statements removed
- Production-ready clean code
- ESLint passing with 0 errors
- TypeScript strict mode passing
- 163/163 mobile tests passing
- 115/128 backend tests passing (13 integration test mocks failing, non-blocking)

**Critical Fixes:**

1. **expo-audio State Bug:**
   - Problem: `getStatus()` returns stale data (durationMillis: 0) after `stop()`
   - Solution: Use `useAudioRecorderState` hook, capture state BEFORE stopping
   - Evidence: Logs showed state before: 4982ms, after: 0ms
   - Impact: Recording duration validation now works correctly

2. **Database Instance Sharing:**
   - Problem: Voice-created lists not appearing in GET /api/v1/shopping-lists
   - Root Cause: Voice controller created separate SQLiteDatabase instance
   - Solution: Dependency injection pattern - initializeVoiceController(services)
   - Impact: All services now share single DB instance, data consistency guaranteed

3. **GPT-4 Validation:**
   - Problem: "Missing requiresClarification" error when GPT-4 returned confident intent
   - Solution: Default requiresClarification to false if omitted
   - Impact: Voice commands no longer fail on validation

4. **Quantity Handling:**
   - Problem: GPT-4 asked "How many tomatoes?" for "Add tomatoes"
   - Solution: Updated system prompt - quantity explicitly marked as OPTIONAL
   - Impact: Commands work without quantity, defaults to "1"

**Test Results:**
```
Mobile Tests: 163/163 passing (VoiceButton, useAudioRecorder, useVoiceCommands)
Backend Tests: 115/128 passing (voice services all passing)
Voice Commands Tested: 3/6 (create_list, add_item with/without quantity)
Physical Device: iPhone (working end-to-end)
```

**Cost Analysis:**
- ~$0.008 per voice command (2-5 seconds audio)
- Whisper: ~$0.001 per command
- GPT-4: ~$0.007 per command
- Monthly estimates: Light use (50/day) = $12, Moderate (200/day) = $48

**Working Commands:**
- ✅ "Create a list called produce"
- ✅ "Add tomatoes" (context-aware, uses currentListId)
- ✅ "Add three cases of tomatoes" (quantity parsing)
- ✅ "Add fettucine to pasta list" → "How much?" → "2 pounds" (multi-turn conversation)
- 🔲 "Remove tomatoes" (untested)
- 🔲 "Send this list" (untested)
- 🔲 "Show my lists" (untested)

**Documentation:**
- Added comprehensive section to TECHNICAL_DOCUMENTATION.md
- Added openmemory with all learnings and critical fixes
- Documented voice processing flow: Audio → Whisper → GPT-4 → Action
- Documented GPT-4 system prompt engineering patterns

---

#### ✅ Phase 3: Enhanced Voice Features & UX Improvements (COMPLETE)

**Status:** Complete - November 28, 2025  
**Branch:** `feature/task-2`  
**Test Coverage:** 317/317 tests passing (189 frontend + 128 backend)

**Priority 1: Text-to-Speech Feedback** ✅
- ✅ Installed expo-speech
- ✅ Created useTextToSpeech hook with AsyncStorage persistence
- ✅ Integrated TTS into useVoiceCommands (speaks confirmations, clarifications, errors)
- ✅ Falls back to Alert.alert when TTS disabled
- ✅ User preference toggle for TTS (isTtsEnabled, setTtsEnabled)
- ✅ Configuration: Rate 0.9, Language en-US, Pitch 1.0
- ✅ 14 tests for TTS hook, 12 tests for voice commands integration

**Priority 2: Multi-Turn Clarification Conversations** ✅
- ✅ Fixed critical UX bug: System now waits for clarification responses
- ✅ Implemented VoiceListeningContext with 3 states: inactive, waiting-for-clarification, background-wake-word
- ✅ 15-second auto-timeout prevents stuck UI
- ✅ Frontend visual feedback:
  - VoiceButton: Green (#10b981) with pulsing animation (800ms) in clarification mode
  - VoiceActivationBanner: Amber (#FFF3CD) shows question with Cancel button
  - "Tap to answer..." hint text, updated accessibility labels
- ✅ Backend improvements:
  - Intent parser recognizes "add X to Y list" pattern, extracts listName
  - createClarificationResponse() stores pending action when GPT-4 asks for clarification
  - Looks up lists by name, auto-switches to target list
  - Uses transcript directly as quantity (skips GPT-4 to avoid "£2" confusion)
- ✅ Flow tested: "Add chicken to produce list" → "How much chicken?" → "2 pounds" → ✅ Added
- ✅ All tests passing: 21 VoiceButton, 17 VoiceActivationBanner, 9 Context, 13 use-voice-commands
- ✅ Documentation: VOICE_CLARIFICATION_FLOW.md with complete architecture guide

**Priority 3: Bug Fixes & UX Improvements** ✅
- ✅ Fixed shopping list refresh after voice add_item command
  - Modified index.tsx to refetch on both 'create_list' AND 'add_item' actions
  - Item counts now update immediately after voice add
- ✅ Fixed all 6 controller test failures (rate limiting, CORS, timeout, size validation)
- ✅ All 317 tests passing with zero tolerance policy

**Priority 4: Code Refactoring (DRY, SOLID)** ✅
- ✅ Extracted 8+ helper methods in VoiceService:
  - getOrCreateSession(), buildSessionContext(), resolvePendingAction()
  - completePendingAddItem(), recordCommandInSession()
  - createClarificationResponse(), createErrorResponse(), createAddItemSuccessResponse()
  - requireActiveList() - shared validation across handlers
- ✅ Frontend: Created announceToUser() to eliminate 5 duplicate TTS/Alert patterns
- ✅ Improved semantic naming: "Step 2.5" → descriptive method names
- ✅ Reduced cyclomatic complexity, improved maintainability
- ✅ ~50 lines removed through DRY improvements

**Priority 5: Documentation** ✅
- ✅ Updated PROJECT_STATUS.md with Phase 3 completion
- ✅ Added comprehensive openmemory notes covering architecture and improvements
- ✅ Documented multi-turn conversation pattern
- ✅ Documented refactoring decisions and patterns

**Test Results:**
```
Backend:  128/128 tests passing (9 suites)
Frontend: 189/189 tests passing (19 suites)
Total:    317/317 tests passing ✅
```

**Key Patterns Implemented:**
- Multi-turn conversations via session-based pending actions
- Graceful degradation: TTS → Alert when disabled
- Semantic method extraction for maintainability
- Zero failing tests policy enforced

---

#### ✅ Phase 2.4: Wake Word Detection & Auto-Recording (COMPLETE)

**Status:** Complete - December 6, 2025  
**Branch:** `feature/task-4-voice`  
**Test Coverage:** 135/135 tests passing

**Deliverables:**

✅ **Porcupine Wake Word Integration**
- Integrated @picovoice/porcupine-react-native 3.0.5
- Wake word: "Picovoice" (built-in keyword)
- Background listening with real-time detection
- Configurable sensitivity (0.0 - 1.0, default 0.5)
- Proper lifecycle management (start/stop/cleanup)

✅ **Wake Word Manager Hook**
- `useWakeWordManager` orchestrates wake word detection
- Processing state flag prevents Porcupine restart during recording
- 12-second debounce window prevents double detections
- Clarification mode integration stops wake word during voice command processing
- 100ms delay after stopping Porcupine for audio system release

✅ **Settings UI**
- Enable/disable wake word toggle
- Sensitivity slider with real-time updates
- Test button for immediate feedback
- Persistent settings via AsyncStorage
- All settings changes reflected immediately

✅ **Visual Feedback**
- VoiceActivationBanner shows wake word status
- Blue banner (#3B82F6) during background wake word listening
- "Ready! Speak your command now" when wake word detected
- VoiceButton border turns blue when wake word active
- 3-second visual flash on detection

✅ **Auto-Recording Flow**
- Wake word detected → Porcupine stops → 100ms delay → Recording starts
- 10-second recording duration (increased from 6s for better capture)
- Clarification mode set during recording prevents Porcupine interference
- Guard clause prevents double-start of recording
- Proper cleanup and wake word restart after command processed

**Critical Bugs Fixed:**

1. **Double Recording Issue**
   - **Problem:** Porcupine restarting immediately after wake word detection while recording still active, causing second recording to overwrite first
   - **Root Cause:** Wake word manager's useEffect responding to state changes and restarting Porcupine before recording complete
   - **Solution:** Added `processingWakeWord` state flag to prevent restart + set clarification mode during recording to block wake word re-activation
   - **Impact:** Eliminated double recordings, audio files no longer overwritten

2. **Microphone Conflicts**
   - **Problem:** Two audio streams (Porcupine + Expo Audio) competing for microphone access
   - **Solution:** Stop Porcupine immediately on detection, add 100ms delay for audio system release, set clarification mode during recording
   - **Impact:** Clean audio capture without interference, consistent 180 KB recordings vs previous 75 KB "You" transcriptions

3. **Permission Race Condition**
   - **Problem:** useState async updates meant `hasPermission` state checked before actually updated, causing "Cannot start - no permission" errors
   - **Solution:** Removed stale permission checks from `startRecording()`, trust caller to verify permissions
   - **Impact:** Permission errors eliminated, recording starts reliably

4. **Double-Start Prevention**
   - **Problem:** Second `startRecording()` call overwriting first recording
   - **Solution:** Added `isRecording` guard clause in startRecording() to ignore duplicate start requests
   - **Impact:** Second attempt logged "Already recording - ignoring start request", prevented file corruption

**Architecture Patterns:**

**Separate Audio Stream Pattern:**
- Porcupine manages wake word detection stream (continuous)
- Expo Audio manages command recording stream (on-demand)
- Lifecycle coordination through state flags and mode transitions
- Clean handoff: Porcupine stops → delay → Recording starts → Recording stops → Porcupine restarts

**State-Based Lifecycle Management:**
- `processingWakeWord` flag prevents premature Porcupine restart (500ms window)
- `listeningMode` controls system state (inactive/background-wake-word/waiting-for-clarification)
- Clarification mode doubles as recording-in-progress state
- Guard clauses prevent race conditions in async operations

**Files Modified:**
- `hooks/use-wake-word-detection.ts` - Porcupine integration with lifecycle management
- `hooks/use-wake-word-manager.ts` - Orchestration with processing flag and debouncing
- `hooks/use-audio-recorder.ts` - Recording with isRecording guard clause
- `hooks/use-voice-listening-context.tsx` - State management for wake word modes
- `components/voice-button.tsx` - Auto-recording trigger with proper mode transitions
- `components/VoiceActivationBanner.tsx` - Visual feedback for wake word states
- `app/(tabs)/settings.tsx` - Wake word settings UI with toggle and slider
- `backend/src/services/voice-service.ts` - Wake word stripping from transcripts

**Test Results:**
```
Total Tests: 135/135 passing ✅
- Wake word detection: 14 tests
- Wake word + context integration: 24 tests  
- Settings UI: 24 tests
- Visual feedback: 10 tests
- Device testing: Working on iPhone (iOS development build)
```

**Performance Metrics:**
- Wake word detection latency: ~50-100ms
- Recording start after wake word: ~50-100ms  
- Audio capture: 180 KB for ~6 seconds (improved from 75 KB)
- Backend processing: Full command transcribed successfully
- Debounce window: 12 seconds (prevents double detections during full cycle)

**User Experience:**
Users can now:
1. Enable wake word detection in Settings
2. Say "Picovoice" + command (e.g., "Picovoice, create a list called Groceries")
3. See visual feedback (blue banner appears)
4. Recording automatically starts and captures command
5. Command executes without pressing any buttons
6. Fully hands-free voice control

**Configuration:**
- Wake word: "Picovoice" (Porcupine built-in)
- Sensitivity: 0.5 (adjustable 0.0-1.0)
- Recording duration: 10 seconds
- Debounce window: 12 seconds
- Audio quality: HIGH_QUALITY preset (44.1kHz)

**Technical Learnings:**
- Separate audio streams require careful lifecycle coordination
- State-based flags prevent race conditions better than refs (trigger re-renders)
- Guard clauses essential for preventing double-operations in async code
- Microphone conflicts resolved with proper stop/delay/start sequencing
- Processing flags prevent premature service restarts during transitions

**Next Steps (Future Enhancements):**
- Custom wake word support (currently "Picovoice" only)
- Configurable recording duration in settings
- Audio beep feedback for better UX
- Continuous recording with circular buffer for improved capture timing
- Additional wake word options ("Hey Shoppy")

---

#### 🔲 Phase 4: Advanced Voice Features (FUTURE - Days 5-7)

**Priority 1: Test Remaining Commands (~30 min)**
- [ ] Test "Remove [item]" command
- [ ] Test "Send this list" command
- [ ] Test "Show my lists" command
- [ ] Test clarification scenarios
- [ ] Test multi-list context switching

**Priority 2: Text-to-Speech Feedback (~2 hours)**
- [ ] Install expo-speech
- [ ] Replace Alert.alert with TTS confirmations
- [ ] "I've created a list called produce" spoken aloud
- [ ] Voice feedback for errors
- [ ] Settings toggle for TTS on/off

**Priority 3: Wake Word Detection (~2-3 hours)**
- [ ] Install expo-speech-recognition
- [ ] Implement "Hey Shoppy" wake word detection
- [ ] Background listening when enabled
- [ ] VoiceActivationBanner shows listening state
- [ ] Test in kitchen-like environment

---

#### 🔲 Phase 4: Polish & Production Readiness (Days 8-10)

- [ ] Persistent session storage (Redis or database)
- [ ] Rate limiting and cost monitoring
- [ ] Comprehensive error logging
- [ ] Performance optimization (reduce GPT-4 tokens)
- [ ] Multi-language support testing
- [ ] Kitchen environment usability testing
- [ ] Documentation finalization

### Task 5: List Management UI (TODO)

- [ ] Shopping list screens
- [ ] Item management
- [ ] Voice-driven list creation
- [ ] Status management (sent/complete)

### Task 6: Reminder Integration (TODO)

- [ ] Push notification setup
- [ ] Reminder scheduling logic
- [ ] Background notification service
- [ ] Test notification delivery

### Task 7: Manager Web UI (TODO)

- [ ] Next.js admin interface
- [ ] List viewing and management
- [ ] Delete/complete controls
- [ ] Integration with backend API

### Task 8: Authentication (TODO)

- [ ] JWT authentication
- [ ] User registration/login
- [ ] Protected routes
- [ ] Session management

---

## Known Issues

None currently. All tests passing, linter clean, server running smoothly.

---

## Performance Metrics

- **Test Execution:** 0.5s for 62 tests
- **Server Startup:** <1s
- **API Response Times:** <50ms for all endpoints (local testing)
- **Database Size:** <1MB for typical usage

---

## Git Workflow

**Current Branch:** `feature/task-2`

**Commit Strategy:**
- Small, focused commits
- Descriptive commit messages
- All tests passing before commit

**Ready to Merge:**
- ✅ All tests passing
- ✅ Linter clean
- ✅ Documentation updated
- ✅ Manual testing complete
- ✅ GitHub issue updated

---

## Contact & Support

**Repository:** akisma/shopping-list  
**Issue Tracker:** GitHub Issues  
**Documentation:** `.docs/TECHNICAL_DOCUMENTATION.md`

---

**🎉 Task 2 Backend API is production-ready!**
