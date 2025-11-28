# Shopping List Mobile App - Technical Documentation

**Last Updated:** November 23, 2025  
**Version:** 0.3.0 (Mobile UI & State Management Complete)

## Architecture Overview

This is a React Native mobile application built with Expo, designed for restaurant chefs to manage shopping lists using voice commands while working in the kitchen.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile App (Expo)                     │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │  UI Layer  │  │   State    │  │  Voice Services  │  │
│  │  (React)   │◄─┤ Management │  │   (Whisper/TTS)  │  │
│  └────────────┘  └────────────┘  └──────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │ REST API
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API (Node.js/Express)               │
│  ┌──────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │   Shopping   │  │   OpenAI    │  │  Push Notif   │  │
│  │  List Logic  │  │ Integration │  │   Service     │  │
│  └──────────────┘  └─────────────┘  └───────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
                  ┌──────────┐
                  │ Database │
                  │ (Postgres)│
                  └──────────┘
```

### Technology Stack

**Mobile Frontend:**
- **Framework:** React Native 0.81.5
- **Platform:** Expo SDK 54
- **Language:** TypeScript 5.9.2
- **Navigation:** Expo Router 6.0 (file-based routing)
- **State Management:** TanStack React Query 5.65.2 (server state)
- **HTTP Client:** Axios 1.7.9
- **UI Components:** React Native built-ins + custom components
- **Testing:** Jest 29.7.0 + React Native Testing Library 13.3.3

**Backend API:** (Implemented in Task 2)
- **Runtime:** Node.js 18+
- **Framework:** Express 4.21.2
- **Database:** SQLite (better-sqlite3 11.7.0)
- **Validation:** Zod 3.24.1
- **Logging:** Pino 9.6.0
- **Testing:** Jest 29.7.0 + ts-jest 29.2.5
- **Dev Tools:** tsx 4.19.2 (watch mode)
- **API Port:** 3001
- **API Docs:** (TBD - Swagger in Task 4)

**AI Services:**
- **Speech-to-Text:** OpenAI Whisper
- **Conversational AI:** OpenAI GPT-4
- **Text-to-Speech:** OpenAI TTS
- **Push Notifications:** Expo Push Notifications

## Project Structure

```
shopping-list/
├── .claude/                    # Development guidelines
│   └── CLAUDE.md              # Core development standards
├── .docs/                     # Project documentation
│   ├── PROJECT_STATUS.md      # Current status and roadmap
│   └── TECHNICAL_DOCUMENTATION.md  # This file
├── backend/                   # Node.js/Express API
│   ├── src/
│   │   ├── controllers/      # Express request handlers
│   │   ├── db/               # Database layer (SQLite)
│   │   ├── middleware/       # Validation & error handling
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic
│   │   ├── types/            # TypeScript type definitions
│   │   └── index.ts          # Server entry point
│   ├── tests/
│   │   ├── unit/             # Unit tests (62 tests)
│   │   └── mocks/            # Mock database for testing
│   ├── data/                 # SQLite database file
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
├── shopping-list/             # Expo mobile app
│   ├── app/                   # File-based routing (Expo Router)
│   │   ├── (tabs)/           # Tab-based navigation screens
│   │   │   ├── _layout.tsx   # Tab navigator configuration
│   │   │   ├── index.tsx     # Home/Dashboard screen
│   │   │   └── explore.tsx   # Explore screen
│   │   ├── _layout.tsx       # Root layout with providers
│   │   └── modal.tsx         # Example modal screen
│   ├── assets/               # Static assets
│   │   └── images/          # Images and icons
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Base UI components
│   │   │   ├── collapsible.tsx
│   │   │   ├── icon-symbol.tsx
│   │   │   └── icon-symbol.ios.tsx
│   │   ├── external-link.tsx
│   │   ├── haptic-tab.tsx
│   │   ├── hello-wave.tsx
│   │   ├── parallax-scroll-view.tsx
│   │   ├── themed-text.tsx
│   │   └── themed-view.tsx
│   ├── constants/            # App constants and configuration
│   │   └── theme.ts         # Theme colors and styling
│   ├── hooks/               # Custom React hooks
│   │   ├── use-color-scheme.ts
│   │   ├── use-color-scheme.web.ts
│   │   └── use-theme-color.ts
│   ├── scripts/             # Build and utility scripts
│   │   └── reset-project.js
│   ├── app.json             # Expo configuration
│   ├── package.json         # Dependencies and scripts
│   ├── tsconfig.json        # TypeScript configuration
│   ├── expo-env.d.ts        # Expo TypeScript definitions
│   └── README.md            # Setup and usage instructions
└── README.md                # Root repository README
```

## Current Implementation (Task 1)

### Expo Configuration

**File:** `shopping-list/app.json`

Key configurations:
- **App Name:** shopping-list
- **Slug:** shopping-list
- **SDK Version:** 54.0.20
- **Platforms:** iOS, Android, Web
- **Orientation:** Portrait
- **Splash Screen:** Adaptive icon with white background
- **Updates:** Development builds enabled

### TypeScript Configuration

**File:** `shopping-list/tsconfig.json`

Extends Expo's base TypeScript config with strict type checking:
- Strict mode enabled
- JSX: react-native
- Module resolution: node
- Path aliases supported via Expo

### Navigation Structure

**Expo Router (File-Based Routing)**

The app uses Expo Router for navigation, which provides a file-system-based routing approach:

- `app/_layout.tsx` - Root layout with theme providers and font loading
- `app/(tabs)/_layout.tsx` - Tab navigator with Home and Explore tabs
- `app/(tabs)/index.tsx` - Home screen (Shopping List will go here)
- `app/(tabs)/explore.tsx` - Explore screen
- `app/modal.tsx` - Example modal presentation

Navigation is automatic based on file structure. No manual route configuration needed.

**Learn more:** https://docs.expo.dev/router/introduction/

### Styling System

**Theme Management:**
- Color schemes defined in `constants/theme.ts`
- Light and dark mode support via `useColorScheme()` hook
- Themed components: `ThemedText` and `ThemedView`
- Uses React Native StyleSheet API

**Design Patterns:**
- Composition over configuration
- Reusable themed components
- Responsive layouts with flexbox
- Platform-specific adaptations (iOS vs Android)

### Components Architecture

**Current Components:**

1. **UI Components** (`components/ui/`)
   - `Collapsible` - Expandable sections
   - `IconSymbol` - Cross-platform icon rendering

2. **Feature Components** (`components/`)
   - `ExternalLink` - Opens URLs in browser
   - `HapticTab` - Tab with haptic feedback
   - `HelloWave` - Animated wave component
   - `ParallaxScrollView` - Parallax header scroll
   - `ThemedText` - Text with theme support
   - `ThemedView` - View with theme support

**Component Patterns:**
- TypeScript with proper prop typing
- Functional components with hooks
- Themed styling via `useThemeColor()`
- Platform-specific rendering where needed

---

## State Management (Task 3 - Implemented)

### React Query Architecture

**Library:** TanStack React Query 5.65.2

React Query manages all server state with automatic caching, background refetching, and optimistic updates. The application follows these patterns:

**Query Keys Strategy:**
```typescript
export const shoppingListKeys = {
  all: ['shopping-lists'] as const,
  lists: (status?: string) => [...shoppingListKeys.all, { status }] as const,
  detail: (id: string) => [...shoppingListKeys.all, id] as const,
};
```

**Benefits:**
- Hierarchical cache invalidation
- Type-safe query keys
- Easy cache manipulation
- Consistent naming across app

### API Client Layer

**File:** `shopping-list/api/client.ts`

Axios-based HTTP client with:
- Base URL configuration (`http://localhost:3001/api/v1`)
- 30-second timeout
- JSON content-type headers
- Centralized error handling

**API Modules:**
```typescript
// Shopping Lists
shoppingListsApi.getAll(status?)
shoppingListsApi.getById(id)
shoppingListsApi.create(data)
shoppingListsApi.update(id, data)
shoppingListsApi.delete(id)
shoppingListsApi.send(id, status)

// Shopping List Items
shoppingListItemsApi.create(listId, data)
shoppingListItemsApi.update(listId, itemId, data)
shoppingListItemsApi.delete(listId, itemId)
```

### React Query Hooks

**File:** `shopping-list/hooks/use-shopping-lists.ts`

**Query Hooks (data fetching):**

1. **useShoppingLists(status?)** - Fetch all lists
   - Supports filtering by status (active/sent/completed)
   - Returns list summaries with item counts
   - Auto-refetches on window focus

2. **useShoppingListDetail(id)** - Fetch single list with items
   - Fetches full list details including all items
   - Enabled only when ID is present
   - Used for list detail screen

**Mutation Hooks (data modification):**

1. **useCreateShoppingList()** - Create new list
   - Invalidates `all` query key on success
   - Triggers refetch of lists

2. **useUpdateShoppingList()** - Update list name/status
   - Invalidates specific list and all lists
   - Updates cache for detail view

3. **useDeleteShoppingList()** - Delete list
   - Invalidates all lists query
   - Cascade delete handled by backend

4. **useSendShoppingList()** - Send list to manager
   - Marks list as "sent" or "completed"
   - Invalidates both detail and list queries

5. **useCreateItem()** - Add item to list
   - Invalidates list detail query
   - Shows new item immediately

6. **useUpdateItem()** - Update item details
   - Invalidates list detail query
   - Updates quantity, notes, name

7. **useDeleteItem()** - Remove item from list
   - Invalidates list detail query
   - Immediate UI update

**Cache Invalidation Strategy:**
- Mutations invalidate relevant queries
- React Query handles background refetching
- UI updates automatically when data changes
- Stale data never shown to users

### React Query Provider Setup

**File:** `shopping-list/app/_layout.tsx`

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

<QueryClientProvider client={queryClient}>
  {/* App content */}
</QueryClientProvider>
```

**Configuration:**
- 5-minute stale time (data considered fresh)
- 2 retry attempts on failure
- Centralized query client for entire app

### Error Handling Patterns

**Backend Unavailable:**
```typescript
if (shoppingLists.isError) {
  return (
    <View>
      <Text>⚠️ Backend Unavailable</Text>
      <Text>Cannot communicate with backend. All functionality unavailable.</Text>
      <Button onPress={refetch}>Retry Connection</Button>
    </View>
  );
}
```

**Mutation Errors:**
```typescript
const createList = useCreateShoppingList();

if (createList.isError) {
  Alert.alert('Error', 'Failed to create shopping list. Please try again.');
}
```

**Error Detection:**
- ECONNREFUSED (backend not running)
- Network errors (no connectivity)
- Timeout errors (slow connection)
- HTTP status errors (4xx, 5xx)

---

## Mobile UI Implementation (Task 3 - Implemented)

### Screen Architecture

**1. Shopping Lists Screen** (`app/(tabs)/index.tsx`)

**Purpose:** Display all shopping lists with filtering and CRUD operations

**Features:**
- List all shopping lists with item counts
- Filter by status (All, Active, Sent, Completed)
- Create new lists via modal
- Delete lists with confirmation
- Navigate to list details
- Backend unavailable detection and retry
- Empty state with call-to-action

**UI Elements:**
- Header with "Shopping Lists" title
- Status filter buttons (pill-style)
- FlatList with shopping list cards
- Floating Action Button (FAB) for creating lists
- Loading spinner during fetch
- Error message with retry button

**List Card Display:**
```
┌─────────────────────────────────────┐
│ List Name                          │
│ 12 items • Active              🗑️  │
└─────────────────────────────────────┘
```

**State Management:**
- `useShoppingLists(status)` for data fetching
- `useCreateShoppingList()` for creation
- `useDeleteShoppingList()` for deletion
- Local state for modal visibility and status filter

---

**2. List Detail Screen** (`app/(tabs)/list-detail.tsx`)

**Purpose:** View and manage items within a shopping list

**Features:**
- Display list name and status badge
- Show all items in list
- Add new items via modal
- Edit existing items
- Delete items with confirmation
- Send list to manager workflow
- Real-time updates from React Query cache

**UI Elements:**
- Status badge (Active/Sent/Completed)
- FlatList of items
- FAB for adding items
- Send to Manager button (left bottom, green)
- Item cards with edit/delete actions
- Empty state when no items

**Item Card Display:**
```
┌─────────────────────────────────────┐
│ Item Name                           │
│ Qty: 5 lbs                          │
│ Notes: Organic preferred     ✏️  🗑️ │
└─────────────────────────────────────┘
```

**Send to Manager Workflow:**
1. User taps "Send to Manager" button
2. Confirmation modal appears
3. User confirms send action
4. List status changes to "sent"
5. Success alert displays
6. Send button disappears (can't send twice)

**Status Badge System:**
- **Active** (Blue #2196F3): List being worked on
- **Sent** (Green #4CAF50): Sent to manager for ordering
- **Completed** (Gray #9E9E9E): Order placed and received

**Conditional Logic:**
- Send button only visible for active lists with items
- Items can only be added to active lists
- Sent/completed lists are read-only

**State Management:**
- `useShoppingListDetail(id)` for list data
- `useCreateItem()` for adding items
- `useUpdateItem()` for editing items
- `useDeleteItem()` for removing items
- `useSendShoppingList()` for send workflow
- Local state for modals and form inputs

---

### Reusable Component Patterns

The application follows a component-driven architecture with highly reusable patterns for modals, confirmations, and form inputs. All components are designed with:
- TypeScript interfaces for type safety
- Consistent prop naming conventions
- Loading state support
- Keyboard-aware behavior
- Accessibility considerations

---

### Component Library

**1. ConfirmationModal** (`components/ConfirmationModal.tsx`)

**Purpose:** Reusable confirmation dialog for destructive actions

**Design Pattern:** Two-step confirmation to prevent accidental destructive actions

**Props:**
```typescript
interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}
```

**Usage Examples:**
1. **Delete List Confirmation:**
```typescript
<ConfirmationModal
  visible={isDeleteModalVisible}
  title="Delete List?"
  message={`Are you sure you want to delete "${listName}"? This action cannot be undone.`}
  confirmText="Delete"
  onConfirm={handleDeleteList}
  onCancel={() => setIsDeleteModalVisible(false)}
  isLoading={deleteList.isPending}
/>
```

2. **Delete Item Confirmation:**
```typescript
<ConfirmationModal
  visible={isDeleteItemModalVisible}
  title="Delete Item?"
  message={`Remove "${itemName}" from the list?`}
  confirmText="Delete"
  onConfirm={handleDeleteItem}
  onCancel={() => setIsDeleteItemModalVisible(false)}
  isLoading={deleteItem.isPending}
/>
```

3. **Send List Confirmation:**
```typescript
<ConfirmationModal
  visible={isSendModalVisible}
  title="Send to Manager?"
  message={`Send "${listName}" to the manager for ordering?`}
  confirmText="Send"
  onConfirm={handleSendList}
  onCancel={() => setIsSendModalVisible(false)}
  isLoading={sendList.isPending}
/>
```

**Features:**
- Modal overlay with backdrop
- Clear title and message
- Action buttons (Cancel/Confirm)
- Loading state support (disables buttons, shows spinner)
- Prevents accidental taps during loading
- Dismiss on backdrop tap (cancel action)

**UI Structure:**
```
┌──────────────────────────────────────┐
│         Modal Backdrop (overlay)      │
│  ┌──────────────────────────────┐   │
│  │   Title                      │   │
│  │   Message text here...       │   │
│  │                              │   │
│  │  [Cancel]  [Confirm/Loading] │   │
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘
```

**Reusability Benefits:**
- Single component for all confirmations
- Consistent UX across app
- Centralized loading state handling
- Easy to test (single test file covers all usage)

---

**2. AddShoppingListModal** (`components/AddShoppingListModal.tsx`)

**Purpose:** Create new shopping lists

**Design Pattern:** Single-field form modal with inline validation

**Props:**
```typescript
interface AddShoppingListModalProps {
  visible: boolean;
  onSave: (name: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}
```

**Features:**
- Text input for list name
- Validation (1-200 characters required)
- Submit button (disabled when invalid)
- Cancel button
- Keyboard-aware behavior with KeyboardAvoidingView
- Auto-focus on input when modal opens
- Dismiss keyboard on submit

**Validation Rules:**
- Name required (shows error if empty)
- Max 200 characters
- Trim whitespace before submission
- Real-time validation feedback

**Usage:**
```typescript
<AddShoppingListModal
  visible={isAddModalVisible}
  onSave={(name) => createList.mutate({ name })}
  onCancel={() => setIsAddModalVisible(false)}
  isLoading={createList.isPending}
/>
```

---

**3. AddItemModal** (`components/AddItemModal.tsx`)

**Purpose:** Add new items to shopping list

**Design Pattern:** Multi-field form modal with optional fields

**Props:**
```typescript
interface AddItemModalProps {
  visible: boolean;
  onSave: (item: CreateItemRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}
```

**Features:**
- Item name input (required)
- Quantity input (optional, e.g., "5 lbs", "2 bottles")
- Notes input (optional, e.g., "Organic preferred")
- Multi-field form with tab navigation
- Keyboard handling (dismiss on submit)
- Auto-focus on name input

**Validation Rules:**
- Name required (1-200 chars)
- Quantity optional (max 100 chars)
- Notes optional (max 500 chars)
- Submit disabled until name is valid

**Usage:**
```typescript
<AddItemModal
  visible={isAddItemModalVisible}
  onSave={(itemData) => createItem.mutate(itemData)}
  onCancel={() => setIsAddItemModalVisible(false)}
  isLoading={createItem.isPending}
/>
```

**Form Structure:**
```
┌──────────────────────────────────┐
│ Add Item                         │
│                                  │
│ Name: [____________]  (required) │
│ Qty:  [____________]  (optional) │
│ Notes:[____________]  (optional) │
│                                  │
│      [Cancel]  [Add Item]        │
└──────────────────────────────────┘
```

---

**4. EditItemModal** (`components/EditItemModal.tsx`)

**Purpose:** Edit existing shopping list items

**Design Pattern:** Pre-populated form modal (same structure as AddItemModal)

**Props:**
```typescript
interface EditItemModalProps {
  visible: boolean;
  item: ShoppingListItem;
  onSave: (updates: UpdateItemRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}
```

**Features:**
- Pre-filled form with current values
- Same validation as AddItemModal
- Update button (changes from "Add Item" to "Update Item")
- Cancel button
- Shows original item data on open

**Usage:**
```typescript
<EditItemModal
  visible={isEditModalVisible}
  item={selectedItem}
  onSave={(updates) => updateItem.mutate({ 
    listId, 
    itemId: selectedItem.id, 
    data: updates 
  })}
  onCancel={() => setIsEditModalVisible(false)}
  isLoading={updateItem.isPending}
/>
```

**Reuse Pattern:**
- Shares validation logic with AddItemModal
- Same UI structure, different initial state
- Same keyboard behavior
- Consistent user experience

---

### Modal Component Best Practices

**Established Patterns:**

1. **Consistent Props Interface:**
   - `visible: boolean` - Controls modal visibility
   - `onSave/onConfirm: () => void` - Primary action callback
   - `onCancel: () => void` - Cancel/close action
   - `isLoading?: boolean` - Loading state from mutations

2. **Loading State Handling:**
   - Disable all buttons during loading
   - Show spinner on primary button
   - Prevent modal dismissal during mutation
   - Clear error states on cancel

3. **Keyboard Management:**
   - KeyboardAvoidingView for iOS
   - Auto-dismiss keyboard on submit
   - Tab navigation between fields
   - Return key submits form (when valid)

4. **Validation Feedback:**
   - Real-time validation on input change
   - Disable submit button when invalid
   - Show error messages inline
   - Clear errors on input focus

5. **Accessibility:**
   - Clear labels for all inputs
   - testID on all interactive elements
   - Logical tab order
   - Descriptive button text

**Testing Pattern for Modals:**
```typescript
describe('MyModal', () => {
  it('opens when visible prop is true', () => {
    render(<MyModal visible={true} {...otherProps} />);
    expect(screen.getByTestId('my-modal')).toBeTruthy();
  });

  it('closes when cancel is pressed', () => {
    const onCancel = jest.fn();
    render(<MyModal visible={true} onCancel={onCancel} {...otherProps} />);
    
    fireEvent.press(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onSave with form data when submitted', () => {
    const onSave = jest.fn();
    render(<MyModal visible={true} onSave={onSave} {...otherProps} />);
    
    fireEvent.changeText(screen.getByTestId('input-field'), 'Test Value');
    fireEvent.press(screen.getByText('Submit'));
    
    expect(onSave).toHaveBeenCalledWith({ field: 'Test Value' });
  });

  it('disables buttons when loading', () => {
    render(<MyModal visible={true} isLoading={true} {...otherProps} />);
    
    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton.props.disabled).toBe(true);
  });
});
```

---

### Voice Components (Phase 6 - Stubs for Task 4)

**Purpose:** UI foundation for voice-powered list creation, preparing for OpenAI Whisper + GPT-4 integration

**3. VoiceStatusIndicator** (`components/VoiceStatusIndicator.tsx`)

**Purpose:** Reusable voice button with visual state feedback

**Props:**
```typescript
export type VoiceStatus = 'coming-soon' | 'ready' | 'listening' | 'processing';

interface VoiceStatusIndicatorProps {
  status: VoiceStatus;
  onPress?: () => void;
}
```

**States:**
- `coming-soon` - Gray (#E0E0E0) - Stub phase, not yet functional
- `ready` - Green (#4CAF50) - Ready to accept voice commands (Task 4)
- `listening` - Red (#f44336) - Actively listening to user speech (Task 4)
- `processing` - Yellow (#FFC107) - Processing speech with OpenAI (Task 4)

**Design:**
- 44x44pt touch target (kitchen-friendly)
- Circular button with microphone emoji (🎤)
- Color-coded states for instant feedback
- Optional onPress callback

**Usage Example (Phase 6 Stub):**
```typescript
<VoiceStatusIndicator 
  status="coming-soon" 
  onPress={handleVoicePress} 
/>
```

**Usage Example (Future Task 4):**
```typescript
<VoiceStatusIndicator 
  status={voiceState}  // ready | listening | processing
  onPress={startVoiceRecording} 
/>
```

---

**4. VoiceActivationBanner** (`components/VoiceActivationBanner.tsx`)

**Purpose:** Persistent banner indicating voice activation is enabled

**Props:**
```typescript
interface VoiceActivationBannerProps {
  visible: boolean;
}
```

**Design:**
- Light green background (#E8F5E9)
- Green bottom border (#4CAF50)
- Message: "🎤 Voice Activation On - Say 'Hey Shoppy' to start"
- Conditionally rendered (null when hidden)
- Full-width banner at top of screen

**Usage Example:**
```typescript
<VoiceActivationBanner visible={voiceActivationEnabled} />
```

**"Hey Shoppy" Wake Word:**
- Chosen for restaurant chef use case (hands-free operation)
- Alternative to "Hey Chef" for better branding
- Will use expo-speech-recognition in Task 4
- Mentioned consistently across all voice UI

---

**5. Settings Screen - Voice Features** (`app/(tabs)/settings.tsx`)

**Purpose:** Centralized control for voice features

**Features:**
- Voice Features section header
- **Toggle 1:** Enable Voice Activation
  - Label: "Say 'Hey Shoppy' to activate"
  - Message: "(Coming in Task 4)"
  - Currently disabled, shows info alert when pressed
  
- **Toggle 2:** Voice Button on Lists
  - Label: "Tap microphone button"
  - Message: "(Coming Soon)"
  - Currently disabled, shows info alert when pressed

**Alert Messages (Phase 6):**
- Voice Activation Alert: "Voice activation with 'Hey Shoppy' wake word will be available when we integrate OpenAI Whisper and GPT-4."
- Voice Button Alert: "Voice button functionality will be available in the next update. We're building the voice recognition features!"

**Integration (Task 4):**
- Toggles become functional
- Enable/disable voice activation
- Control wake word detection
- Configure voice sensitivity

---

**Screen Integration Examples:**

**Shopping Lists Screen:**
```typescript
// Voice state (stub - always false in Phase 6)
const [voiceActivationEnabled] = useState(false);

const handleVoicePress = () => {
  Alert.alert(
    'Voice Commands Coming Soon',
    'Voice-powered list creation will be available in the next update. Say "Hey Shoppy" to get started!',
    [{ text: 'OK' }]
  );
};

return (
  <ThemedView style={styles.container}>
    {/* Voice banner (hidden in Phase 6) */}
    <VoiceActivationBanner visible={voiceActivationEnabled} />
    
    <View style={styles.header}>
      <ThemedText type="title">Shopping Lists</ThemedText>
      <View style={styles.headerActions}>
        {/* Voice button (stub) */}
        <VoiceStatusIndicator status="coming-soon" onPress={handleVoicePress} />
        <TouchableOpacity onPress={openCreateModal}>
          <Text>+</Text>
        </TouchableOpacity>
      </View>
    </View>
    {/* ... rest of screen */}
  </ThemedView>
);
```

**List Detail Screen:**
```typescript
// Voice state (stub - always false in Phase 6)
const [voiceActivationEnabled] = useState(false);

const handleVoicePress = () => {
  Alert.alert(
    'Voice Commands Coming Soon',
    'Voice-powered item adding will be available in the next update. Say "Hey Shoppy, add tomatoes" to get started!',
    [{ text: 'OK' }]
  );
};

return (
  <ThemedView style={styles.container}>
    {/* Voice banner (hidden in Phase 6) */}
    <VoiceActivationBanner visible={voiceActivationEnabled} />
    
    {/* Header with status badge and voice button */}
    <View style={styles.header}>
      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
        <Text>{statusText}</Text>
      </View>
      {/* Voice button (stub) */}
      <VoiceStatusIndicator status="coming-soon" onPress={handleVoicePress} />
    </View>
    {/* ... rest of screen */}
  </ThemedView>
);
```

---

**Voice Components Test Coverage (Phase 6):**

- **VoiceStatusIndicator:** 13 tests
  - Rendering all 4 states
  - OnPress callback interaction
  - Background color verification
  - 44pt touch target accessibility

- **VoiceActivationBanner:** 10 tests
  - Visibility logic (show/hide)
  - Content verification ("Hey Shoppy" text)
  - Styling validation
  - Accessibility checks

- **Settings Screen:** 11 tests
  - Voice features section rendering
  - Toggle interactions (both disabled)
  - Alert messages
  - "Hey Shoppy" instruction text

- **Screen Integrations:** 6 tests (3 per screen)
  - Voice button renders in header
  - "Coming Soon" alert on press
  - Banner not shown by default (stub phase)

**Total Voice Tests:** 40 tests, all passing ✅

---

**Task 4 Integration Path:**

Phase 6 provides the complete UI foundation for Task 4:

1. **Replace Stubs with Real Voice:**
   - Change `voiceActivationEnabled` from stub to real state
   - Connect VoiceStatusIndicator to voice recognition state
   - Replace Alert messages with actual voice commands

2. **Implement Wake Word Detection:**
   - Use expo-speech-recognition for "Hey Shoppy"
   - Update VoiceStatusIndicator status: ready → listening → processing
   - Show VoiceActivationBanner when enabled

3. **Add Voice Command Processing:**
   - Integrate OpenAI Whisper for speech-to-text
   - Use GPT-4 for intent parsing
   - Execute commands (create list, add item, send to manager)
   - Voice feedback via text-to-speech

4. **Enable Settings Toggles:**
   - Make toggles functional
   - Save voice preferences
   - Configure sensitivity/wake word

---

### Navigation Patterns

**File-Based Routing** (Expo Router 6.0)

**Route Structure:**
```
app/
  (tabs)/
    _layout.tsx       → Tab Navigator
    index.tsx         → Shopping Lists Screen (Tab 1)
    list-detail.tsx   → List Detail Screen (Stack push)
    explore.tsx       → Explore Screen (Tab 2)
    settings.tsx      → Settings Screen (Tab 3)
```

**Navigation Examples:**

**Push to List Detail:**
```typescript
import { router } from 'expo-router';

router.push(`/(tabs)/list-detail?id=${listId}`);
```

**Go Back:**
```typescript
router.back();
```

**URL Parameters:**
```typescript
import { useLocalSearchParams } from 'expo-router';

const { id } = useLocalSearchParams<{ id: string }>();
```

**Tab Navigation:**
- Automatic via file structure
- Bottom tab bar with icons
- Active tab highlighted

---

### Styling Patterns

**StyleSheet API:**
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // ... more styles
});
```

**Design System:**
- **Primary Color:** #2196F3 (Blue)
- **Success Color:** #4CAF50 (Green)
- **Error Color:** #f44336 (Red)
- **Gray Shades:** #9E9E9E, #BDBDBD, #E0E0E0

**Touch Targets:**
- Minimum 44x44pt for kitchen-friendly taps
- Large buttons for chef use case
- Adequate spacing between interactive elements

**Typography:**
- Headers: 24pt, bold
- Subheaders: 18pt, semibold
- Body: 16pt, regular
- Captions: 14pt, regular

---

### Kitchen-Optimized UX

**Design Considerations:**

1. **Large Touch Targets**
   - All buttons minimum 44x44pt
   - Extra padding around tap areas
   - Suitable for kitchen gloves

2. **High Contrast**
   - Clear text on backgrounds
   - Status colors highly visible
   - Works in bright kitchen lighting

3. **Confirmation Modals**
   - Prevent accidental deletes
   - Clear action labels
   - Two-tap for destructive actions

4. **Loading States**
   - Spinners for pending operations
   - Disabled buttons during mutations
   - Clear feedback on success

5. **Error Recovery**
   - Retry buttons on failures
   - Clear error messages
   - Persistent retry option

## Testing Strategy

### Testing Framework

**Jest Configuration** (Task 3 - Implemented)
- **Test Runner:** Jest 29.7.0
- **Component Testing:** React Native Testing Library 13.3.3
- **Test Location:** Co-located with components (e.g., `Component.test.tsx`)
- **Current Coverage:** 85 tests passing across 11 test suites
- **TDD Approach:** Strict RED-GREEN-REFACTOR cycle

**Test File Naming Convention:**
- Unit tests: `ComponentName.test.tsx`
- Feature tests: `ComponentName.feature.test.tsx` (e.g., `list-detail.send-list.test.tsx`)
- E2E tests: (Future - Detox in Task 9)

**Test Results (Task 3):**
```
Test Suites: 11 passed, 11 total
Tests:       85 passed, 85 total
Time:        ~2s
```

### Testing Patterns

**React Query Testing Pattern:**
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react-native';

// Create fresh query client for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// Wrapper component
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('Component with React Query', () => {
  it('fetches and displays data', async () => {
    render(<MyComponent />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByText('Expected Data')).toBeTruthy();
    });
  });
});
```

**Hook Mocking Pattern:**
```typescript
// Mock React Query hooks
jest.mock('@/hooks/use-shopping-lists', () => ({
  useShoppingLists: jest.fn(),
  useCreateShoppingList: jest.fn(),
  useDeleteShoppingList: jest.fn(),
}));

// Setup mock in beforeEach
beforeEach(() => {
  (useShoppingLists as jest.Mock).mockReturnValue({
    data: mockData,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  });
});
```

**User Interaction Testing:**
```typescript
import { fireEvent } from '@testing-library/react-native';

it('calls onPress when button tapped', () => {
  const mockOnPress = jest.fn();
  render(<Button onPress={mockOnPress} />);
  
  fireEvent.press(screen.getByTestId('my-button'));
  
  expect(mockOnPress).toHaveBeenCalledTimes(1);
});
```

**Modal Testing Pattern:**
```typescript
it('opens modal when button pressed', () => {
  render(<ScreenWithModal />);
  
  // Modal should not be visible initially
  expect(screen.queryByTestId('confirmation-modal')).toBeNull();
  
  // Press button to open modal
  fireEvent.press(screen.getByTestId('delete-button'));
  
  // Modal should now be visible
  expect(screen.getByTestId('confirmation-modal')).toBeTruthy();
});
```

**Async Mutation Testing:**
```typescript
it('creates shopping list successfully', async () => {
  const mockMutate = jest.fn();
  (useCreateShoppingList as jest.Mock).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  });
  
  render(<CreateListModal />);
  
  fireEvent.changeText(screen.getByTestId('name-input'), 'New List');
  fireEvent.press(screen.getByText('Create'));
  
  expect(mockMutate).toHaveBeenCalledWith({ name: 'New List' });
});
```

### Test Coverage Breakdown

**Shopping Lists Screen** (11 tests)
- Display loading state
- Display shopping lists
- Filter by status
- Create new list
- Delete list with confirmation
- Navigate to detail
- Backend unavailable handling
- Empty state display
- Retry connection

**List Detail Screen** (33 tests total)
- **Basic Display** (11 tests): Loading, error, empty states, item rendering
- **Item Management** (14 tests): Add, edit, delete items with validation
- **Send to Manager** (8 tests): Button visibility, confirmation, success/error handling

**API Client** (23 tests)
- Shopping lists CRUD operations
- Shopping list items CRUD operations
- Error handling
- Request/response formatting

**Hooks** (18 tests)
- React Query hook behavior
- Cache invalidation
- Mutation callbacks
- Error states

### Testing Principles

**Implemented Standards:**
- Test user behavior, not implementation details
- Use testID for reliable element selection
- Mock external dependencies (hooks, navigation)
- Wait for async operations with `waitFor()`
- Test error states and edge cases
- Verify loading and disabled states
- Test confirmation flows (two-step actions)
- Ensure keyboard interactions work

**Test Organization:**
- One test file per feature
- Group related tests in `describe` blocks
- Clear test names describing expected behavior
- Setup/teardown in `beforeEach`/`afterEach`
- Consistent mock patterns across tests

---

### Testing Best Practices & Refactoring Patterns

**Test File Organization Strategy:**

The project uses feature-based test file organization to improve maintainability and clarity:

**Pattern:**
```
component-name.test.tsx              # Core functionality tests
component-name.feature-name.test.tsx # Feature-specific test suites
```

**Example (List Detail Screen):**
```
list-detail.test.tsx              # Basic display, navigation (11 tests)
list-detail.update-item.test.tsx  # Item editing workflow (8 tests)
list-detail.send-list.test.tsx    # Send to manager workflow (8 tests)
```

**Benefits:**
- Smaller, focused test files (easier to navigate)
- Clear separation of concerns
- Parallel test execution
- Easier to locate relevant tests
- Reduces merge conflicts

---

### Reusable Test Utilities

**1. React Query Test Wrapper**

**File:** Defined in each test file that needs React Query

**Pattern:**
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';

// Create fresh query client for isolation
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },      // No retries in tests
    mutations: { retry: false },
  },
});

// Wrapper component
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

// Usage in tests
render(<MyComponent />, { wrapper });
```

**Why Fresh Client Per Test:**
- Prevents cache pollution between tests
- Each test starts with clean state
- Avoids flaky tests from shared cache
- Predictable test behavior

**2. Mock Hook Patterns**

**Centralized Mock Setup:**
```typescript
// Mock all hooks from a module
jest.mock('@/hooks/use-shopping-lists', () => ({
  useShoppingLists: jest.fn(),
  useShoppingListDetail: jest.fn(),
  useCreateShoppingList: jest.fn(),
  useUpdateShoppingList: jest.fn(),
  useDeleteShoppingList: jest.fn(),
  useSendShoppingList: jest.fn(),
  useCreateItem: jest.fn(),
  useUpdateItem: jest.fn(),
  useDeleteItem: jest.fn(),
}));

// Import mocked hooks
import { 
  useShoppingLists,
  useCreateShoppingList,
  // ... others
} from '@/hooks/use-shopping-lists';
```

**Default Mock in beforeEach:**
```typescript
beforeEach(() => {
  // Reset all mocks
  jest.clearAllMocks();
  
  // Set default return values
  (useShoppingLists as jest.Mock).mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  });
  
  (useCreateShoppingList as jest.Mock).mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    reset: jest.fn(),
  });
  
  // ... other hooks
});
```

**Per-Test Mock Overrides:**
```typescript
it('displays loading state', () => {
  // Override just the loading state
  (useShoppingLists as jest.Mock).mockReturnValue({
    data: undefined,
    isLoading: true,  // <-- Override
    isError: false,
    refetch: jest.fn(),
  });
  
  render(<MyComponent />, { wrapper });
  expect(screen.getByTestId('loading-spinner')).toBeTruthy();
});
```

**3. Spy Pattern for Hook Testing**

**Use Case:** When you need to verify hook calls without fully mocking

```typescript
it('calls mutate with correct data', () => {
  const mockMutate = jest.fn();
  
  // Spy on the hook
  jest.spyOn(require('@/hooks/use-shopping-lists'), 'useCreateShoppingList')
    .mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      reset: jest.fn(),
    });
  
  render(<MyComponent />, { wrapper });
  
  fireEvent.changeText(screen.getByTestId('name-input'), 'New List');
  fireEvent.press(screen.getByText('Create'));
  
  expect(mockMutate).toHaveBeenCalledWith({ name: 'New List' });
});
```

**4. Navigation Mock Pattern**

**Expo Router Mocking:**
```typescript
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
  useLocalSearchParams: jest.fn(),
}));

import { router, useLocalSearchParams } from 'expo-router';

// In test
it('navigates to detail screen', () => {
  render(<ShoppingListsScreen />);
  
  fireEvent.press(screen.getByText('My List'));
  
  expect(router.push).toHaveBeenCalledWith('/(tabs)/list-detail?id=123');
});
```

**5. Alert Mock Pattern**

**React Native Alert Mocking:**
```typescript
jest.spyOn(Alert, 'alert');

it('shows success alert after send', async () => {
  // ... setup and action
  
  await waitFor(() => {
    expect(Alert.alert).toHaveBeenCalledWith(
      'List Sent!',
      'Your shopping list has been sent to the manager.'
    );
  });
});
```

---

### Test Refactoring Lessons Learned

**1. Avoid Mock Duplication**

**❌ Before (Duplication):**
```typescript
// list-detail.test.tsx
jest.mock('@/hooks/use-shopping-lists', () => ({
  useShoppingListDetail: jest.fn(),
  useDeleteItem: jest.fn(),
}));

// list-detail.update-item.test.tsx
jest.mock('@/hooks/use-shopping-lists', () => ({
  useShoppingListDetail: jest.fn(),
  useUpdateItem: jest.fn(),
  // Missing useDeleteItem - causes errors!
}));
```

**✅ After (Complete Mock):**
```typescript
// Both files now mock ALL hooks from the module
jest.mock('@/hooks/use-shopping-lists', () => ({
  useShoppingListDetail: jest.fn(),
  useCreateItem: jest.fn(),
  useUpdateItem: jest.fn(),
  useDeleteItem: jest.fn(),
  useSendShoppingList: jest.fn(),  // Added when feature introduced
  // ... all exports
}));
```

**Rule:** When you add a new hook to a component, update ALL test files that render that component to mock the new hook.

**2. Fresh Query Client Per Test**

**❌ Before (Shared Client):**
```typescript
const queryClient = new QueryClient(); // Shared across tests

describe('MyTests', () => {
  it('test 1', () => {
    render(<Component />, { 
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    });
  });
  
  it('test 2', () => {
    // Still using same client - has cached data from test 1!
    render(<Component />, { wrapper: ... });
  });
});
```

**✅ After (Fresh Client):**
```typescript
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

// Each render gets fresh client automatically
```

**3. Descriptive Test Names**

**❌ Before:**
```typescript
it('works', () => { ... });
it('handles error', () => { ... });
```

**✅ After:**
```typescript
it('displays send button when list has items and is active', () => { ... });
it('displays error message when send fails', () => { ... });
```

**Rule:** Test name should describe expected behavior in plain English.

**4. Feature-Based Test Files**

**Evolution:**
- Started with: `list-detail.test.tsx` (59 tests, 400+ lines)
- Refactored to: 
  - `list-detail.test.tsx` (11 tests - display/navigation)
  - `list-detail.update-item.test.tsx` (8 tests - item editing)
  - `list-detail.send-list.test.tsx` (8 tests - send workflow)

**Benefits:**
- Faster test runs (parallel execution)
- Easier to find relevant tests
- Smaller git diffs
- Clear feature boundaries

---

### Testing Checklist for New Features

When adding a new feature, ensure tests cover:

- ✅ **Happy Path:** Feature works as expected
- ✅ **Loading State:** Shows loading indicator during async operations
- ✅ **Error State:** Displays error message when operation fails
- ✅ **Empty State:** Handles empty data gracefully
- ✅ **Validation:** Rejects invalid input
- ✅ **Button States:** Buttons disabled when appropriate
- ✅ **Confirmation Flows:** Multi-step actions work correctly
- ✅ **Navigation:** Navigates to correct screens
- ✅ **Cache Updates:** React Query cache invalidates correctly
- ✅ **User Feedback:** Success/error alerts display

**Test Count Target:** 6-10 tests per feature is typical for good coverage.

## Development Workflow

### Prerequisites

- **Node.js:** v18+ recommended
- **npm:** v9+ or yarn
- **Expo CLI:** Installed globally or via npx
- **iOS:** Xcode and iOS Simulator (macOS only)
- **Android:** Android Studio and Android Emulator
- **Mobile Device:** iOS or Android device with Expo Go app (optional)

### Local Development

```bash
# Install dependencies
cd shopping-list
npm install

# Start development server
npm start
# or
npx expo start

# Run on specific platform
npm run ios        # iOS Simulator
npm run android    # Android Emulator
npm run web        # Web browser

# Run tests
npm test

# Run linter
npm run lint
```

### Development Server

When you run `npm start`, Expo CLI provides:
- QR code for scanning with Expo Go app
- Options to open in iOS Simulator
- Options to open in Android Emulator
- Web browser preview
- Hot reload on file changes

### Code Quality

**Linting:**
- ESLint with Expo configuration (`eslint-config-expo`)
- Runs on pre-commit hooks
- All issues must be resolved before committing

**Type Checking:**
- TypeScript strict mode enabled
- Type errors are blocking
- Use proper types, avoid `any`

## Environment Configuration

**Current Environment Variables:** (None yet)

**Future Environment Variables** (Task 2+):
```bash
# Backend API
API_BASE_URL=https://api.shopping-list.com
API_TIMEOUT=30000

# OpenAI Services
OPENAI_API_KEY=sk-...
WHISPER_MODEL=whisper-1
GPT_MODEL=gpt-4
TTS_MODEL=tts-1

# Expo Push Notifications
EXPO_PUSH_TOKEN=...
```

Environment variables will be managed via:
- `.env` files (local development)
- `app.json` extra field (Expo config)
- EAS Secrets (production deployments)

## Deployment Strategy

### Development Builds

**Expo Development Client:**
- Enables use of native modules not in Expo Go
- Required for OpenAI integrations
- Built via EAS Build service

**EAS Build Configuration:**
- Development builds for internal testing
- Preview builds for stakeholder review
- Production builds for app stores

### CI/CD Pipeline (Task 3a)

**GitHub Actions Workflow:**
1. Lint and type check
2. Run test suite
3. Build preview for Android
4. Deploy to AWS/Vercel (web version)
5. Notify on build completion

### Production Deployment

**Target Platforms:**
- iOS: App Store (future)
- Android: Google Play Store (primary target for business partner)
- Web: Progressive Web App via Vercel/AWS (for broader access)

**Deployment Requirements:**
- All tests passing ✅
- Linting clean ✅
- Manual QA approval ✅
- Security review complete ✅

## API Integration (Future)

### Backend API Design

**REST API Endpoints** (To be implemented in Task 2):

```
Shopping Lists:
POST   /api/v1/shopping-lists          # Create list
GET    /api/v1/shopping-lists          # Get all lists
GET    /api/v1/shopping-lists/:id      # Get specific list
PUT    /api/v1/shopping-lists/:id      # Update list
DELETE /api/v1/shopping-lists/:id      # Delete list
POST   /api/v1/shopping-lists/:id/send # Mark as sent

Shopping List Items:
POST   /api/v1/shopping-lists/:id/items        # Add item
PUT    /api/v1/shopping-lists/:id/items/:itemId # Update item
DELETE /api/v1/shopping-lists/:id/items/:itemId # Remove item

Voice & AI:
POST   /api/v1/voice/transcribe       # Whisper STT
POST   /api/v1/voice/synthesize       # TTS
POST   /api/v1/ai/intent              # GPT-4 intent parsing

Reminders:
POST   /api/v1/reminders              # Create reminder
PUT    /api/v1/reminders/:id          # Update reminder
DELETE /api/v1/reminders/:id          # Cancel reminder

Push Notifications:
POST   /api/v1/devices/register       # Register device token
DELETE /api/v1/devices/:token         # Unregister device
```

**Authentication:**
- JWT-based authentication
- Token stored in secure storage
- Refresh token rotation
- Role-based access control (chef vs manager)

**Data Format:**
- JSON request/response bodies
- ISO 8601 timestamps
- Standard HTTP status codes
- Consistent error response format

## Security Considerations

### Data Protection

**Sensitive Data:**
- API keys stored in environment variables, never in code
- User tokens stored in secure storage (iOS Keychain / Android Keystore)
- Audio recordings not persisted longer than needed
- Shopping list data encrypted at rest

**Network Security:**
- HTTPS only for all API calls
- Certificate pinning for production
- Request timeout limits
- Rate limiting on API endpoints

### Permission Management

**Required Permissions:**
- Microphone access (for voice commands)
- Notifications (for reminders)
- Network access (for API calls)

**Permission Handling:**
- Request permissions with clear explanation
- Graceful degradation if denied
- Re-prompt only when contextually appropriate

## Performance Optimization

### App Startup

**Optimization Strategies:**
- Lazy load non-critical screens
- Cache theme preferences
- Preload fonts during splash screen
- Minimize initial bundle size

### Runtime Performance

**Best Practices:**
- Memoize expensive computations
- Use FlatList for long lists (not ScrollView)
- Optimize images (WebP format, appropriate sizes)
- Debounce user input handlers
- Cancel in-flight requests on unmount

### Memory Management

**Monitoring:**
- Watch for memory leaks in development
- Clean up listeners and subscriptions
- Limit audio buffer sizes
- Clear caches periodically

## Accessibility

### Accessibility Features (To be implemented)

**Screen Reader Support:**
- Meaningful labels for all interactive elements
- Proper heading hierarchy
- Announcement of dynamic changes

**Visual Accessibility:**
- Sufficient color contrast (WCAG AA)
- Scalable text (respects system font size)
- Alternative text for images
- Focus indicators for keyboard navigation

**Interaction Accessibility:**
- Large touch targets (44x44pt minimum)
- Haptic feedback for actions
- Voice commands as alternative to touch
- Spoken confirmations for blind users

## Monitoring & Analytics

### Error Tracking (Future)

**Crash Reporting:**
- Sentry or similar for crash tracking
- Error boundaries for graceful failures
- Detailed error logs with context

**Analytics:** (To be determined)
- User flow tracking
- Feature usage metrics
- Voice command success rates
- Performance metrics (TTI, FCP, etc.)

## Resources & References

### Official Documentation

- **Expo Documentation:** https://docs.expo.dev/
- **React Native Documentation:** https://reactnative.dev/docs/getting-started
- **Expo Router:** https://docs.expo.dev/router/introduction/
- **React Navigation:** https://reactnavigation.org/docs/getting-started

### Testing Resources

- **React Native Testing Library:** https://callstack.github.io/react-native-testing-library/
- **Jest Documentation:** https://jestjs.io/docs/getting-started
- **Testing Best Practices:** https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

### AI Integration Resources

- **OpenAI Whisper API:** https://platform.openai.com/docs/guides/speech-to-text
- **OpenAI TTS API:** https://platform.openai.com/docs/guides/text-to-speech
- **OpenAI GPT-4:** https://platform.openai.com/docs/guides/chat

### Push Notifications

- **Expo Push Notifications:** https://docs.expo.dev/push-notifications/overview/
- **Firebase Cloud Messaging:** https://firebase.google.com/docs/cloud-messaging

---

## Backend API (Task 2 - Completed)

### Technology Stack

**Runtime & Framework:**
- Node.js 18+
- Express 4.21.2 (HTTP framework)
- TypeScript 5.7.2 (strict mode)

**Database:**
- SQLite via better-sqlite3 11.7.0
- Synchronous API for simplicity
- File-based: `backend/data/shopping-list.db`
- Easy migration path to PostgreSQL later

**Validation & Logging:**
- Zod 3.24.1 for request validation
- Pino 9.6.0 for structured JSON logging
- Pretty printing in development

**Testing:**
- Jest 29.7.0 + ts-jest 29.2.5
- 62 unit tests, 100% coverage on services
- Mock database for isolated testing
- TDD with RED-GREEN-REFACTOR cycle

**Dev Tools:**
- tsx 4.19.2 for watch mode
- ESLint 9.17.0 for linting
- CORS configured for Expo dev servers

### Architecture

**Layered Architecture:**
```
Controllers (thin adapters)
    ↓
Services (all business logic)
    ↓
Database (pure data access)
```

**Key Principles:**
- Services contain ALL business logic (>90% coverage target)
- Database layer is PURE data access, no validation (0% coverage)
- Controllers are thin adapters between Express and services (0% coverage)
- Dependency injection via IDatabase interface
- Unit tests only (no integration tests to avoid mocking complexity)

### Database Schema

#### Tables

**shopping_lists**
- `id` (TEXT, UUID v4, PRIMARY KEY)
- `name` (TEXT, NOT NULL, 1-200 chars)
- `status` (TEXT, DEFAULT 'active', enum: active|sent|completed)
- `created_at` (TEXT, ISO 8601)
- `updated_at` (TEXT, ISO 8601)

**shopping_list_items**
- `id` (TEXT, UUID v4, PRIMARY KEY)
- `shopping_list_id` (TEXT, FOREIGN KEY → shopping_lists.id ON DELETE CASCADE)
- `name` (TEXT, NOT NULL, 1-200 chars)
- `quantity` (TEXT, optional, max 100 chars)
- `notes` (TEXT, optional, max 500 chars)
- `created_at` (TEXT, ISO 8601)
- `updated_at` (TEXT, ISO 8601)

**reminders** (Stub for Task 6)
- `id` (TEXT, UUID v4, PRIMARY KEY)
- `shopping_list_id` (TEXT, FOREIGN KEY → shopping_lists.id ON DELETE CASCADE)
- `scheduled_at` (TEXT, ISO 8601, must be future)
- `status` (TEXT, DEFAULT 'pending', enum: pending|sent|cancelled)
- `created_at` (TEXT, ISO 8601)
- `updated_at` (TEXT, ISO 8601)

**Indexes:**
- `shopping_lists.status`
- `shopping_list_items.shopping_list_id`
- `reminders.shopping_list_id`
- `reminders.scheduled_at`

**Relationships:**
- 1 shopping_list → many shopping_list_items (CASCADE DELETE)
- 1 shopping_list → many reminders (CASCADE DELETE)

### API Specification

**Base URL:** `http://localhost:3001/api/v1`

**Authentication:** None (Task 8 will add JWT)

**CORS Origins:**
- `http://localhost:8081` (Expo dev server)
- `http://localhost:19000` (Expo web)
- `http://localhost:19006` (Alternative Expo port)

#### Endpoints

**Health Check**
- `GET /health` → `{status, timestamp, version}`

**Shopping Lists**
- `POST /api/v1/shopping-lists` - Create list with optional items
- `GET /api/v1/shopping-lists?status=active` - Get all lists with item counts
- `GET /api/v1/shopping-lists/:id` - Get single list with all items
- `PUT /api/v1/shopping-lists/:id` - Update list name or status
- `DELETE /api/v1/shopping-lists/:id` - Delete list (cascades to items/reminders)
- `POST /api/v1/shopping-lists/:id/send` - Mark list as sent/completed

**Shopping List Items**
- `POST /api/v1/shopping-lists/:listId/items` - Add item to list
- `PUT /api/v1/shopping-lists/:listId/items/:itemId` - Update item
- `DELETE /api/v1/shopping-lists/:listId/items/:itemId` - Remove item

**Reminders** (Stub for Task 6)
- `POST /api/v1/reminders` - Schedule reminder
- `PUT /api/v1/reminders/:id` - Update reminder time or status
- `DELETE /api/v1/reminders/:id` - Cancel reminder

#### Validation Rules

**Shopping List:**
- `name`: Required, 1-200 characters
- `status`: Optional, enum: `active`, `sent`, `completed`

**Shopping List Item:**
- `name`: Required, 1-200 characters
- `quantity`: Optional, max 100 characters
- `notes`: Optional, max 500 characters

**Reminder:**
- `shoppingListId`: Required, valid UUID
- `scheduledAt`: Required, ISO 8601, must be in future
- `status`: Optional, enum: `pending`, `sent`, `cancelled`

### Error Handling

**Consistent Error Response:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Name is required",
    "details": {"field": "name"},
    "timestamp": "2025-11-02T20:00:00.000Z",
    "path": "/api/v1/shopping-lists"
  }
}
```

**Error Codes:**
- `VALIDATION_ERROR` (400) - Request validation failed
- `NOT_FOUND` (404) - Resource not found
- `INTERNAL_ERROR` (500) - Unexpected server error

**Error Middleware:**
- Catches ZodError → 400 with validation details
- Catches Error with "not found" → 404
- All others → 500 with generic message
- Structured logging with Pino

### Logging Strategy

**Levels:** ERROR, WARN, INFO, DEBUG (dev only)

**Format:**
- Development: Pretty printed to console
- Production: Structured JSON

**What to Log:**
- All API requests (method, path, status, duration)
- All errors with stack traces
- Database connection events
- Server startup/shutdown

**Never Log:**
- Passwords or API keys
- Sensitive user data

### Testing Results

**62/62 unit tests passing (100% coverage)**

**Breakdown:**
- Health utility: 1 test
- Validation middleware: 21 tests
- ShoppingListService: 23 tests
- ShoppingListItemService: 10 tests
- ReminderService: 7 tests

**Key Learnings:**
- Use `toBeGreaterThanOrEqual` for timestamp tests (operations too fast)
- Zod: `.parse()` throws, `.safeParse()` returns result object
- TypeScript strict mode catches unused variables early
- better-sqlite3 is synchronous - no async/await needed

### Running the Backend

**Install dependencies:**
```bash
cd backend
npm install
```

**Start development server:**
```bash
npm run dev  # Runs on port 3001 with watch mode
```

**Run tests:**
```bash
npm test           # Run all tests
npm run test:watch # Watch mode
npm run test:coverage # Coverage report
```

**Build for production:**
```bash
npm run build      # Compile TypeScript
npm start          # Run compiled JavaScript
```

### Environment Variables

```bash
NODE_ENV=development
PORT=3001
LOG_LEVEL=info
DATABASE_PATH=./data/shopping-list.db
CORS_ORIGINS=http://localhost:8081,http://localhost:19000,http://localhost:19006
```

---

## Voice Integration (Phase 2 - Completed Nov 28, 2025)

### Overview

Complete end-to-end voice command system enabling hands-free shopping list management through natural language. The system uses OpenAI Whisper for speech-to-text transcription and GPT-4 for intent parsing, with a session-based context manager for multi-turn conversations.

**Status:** ✅ Production-ready voice commands working on physical devices

**Working Commands:**
- ✅ "Create a list called [name]"
- ✅ "Add [item]" (uses current list from context)
- ✅ "Add [quantity] [item]" (quantity is optional, defaults to "1")
- 🔲 "Remove [item]" (not yet tested)
- 🔲 "Send this list" (not yet tested)
- 🔲 "Show my lists" (not yet tested)

### Architecture

**Voice Processing Flow:**

```
┌──────────────────────────────────────────────────────────────┐
│                    Mobile Device (Expo)                       │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 1. User presses and holds microphone button            │  │
│  │ 2. expo-audio records audio (min 300ms)                │  │
│  │ 3. Stop recording → base64 audio blob                  │  │
│  │ 4. POST to backend with sessionId                      │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────┬──────────────────────────────────────┘
                        │ HTTP POST /api/v1/voice/command
                        ▼
┌──────────────────────────────────────────────────────────────┐
│              Backend API (Node.js/Express)                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ VoiceService.processVoiceCommand():                    │  │
│  │                                                         │  │
│  │ 5. Get/create session (5-min timeout)                  │  │
│  │ 6. Whisper API → transcribe audio                      │  │
│  │ 7. Build context (currentListId + last 5 commands)     │  │
│  │ 8. GPT-4 → parse intent with context                   │  │
│  │ 9. Execute action (CRUD via services)                  │  │
│  │ 10. Update session context                             │  │
│  │ 11. Return result + TTS text                           │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────┬──────────────────────────────────────┘
                        │ JSON response
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                    Mobile Device (Expo)                       │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 12. Display confirmation alert                          │  │
│  │ 13. Refetch lists (if create_list action)              │  │
│  │ 14. Future: Speak TTS response                          │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Mobile Components (expo-audio)

**1. useAudioRecorder Hook** (`shopping-list/hooks/use-audio-recorder.ts`)

Custom hook wrapping expo-audio's useAudioRecorder with proper state management.

**Critical Fix:**
```typescript
// ❌ WRONG - getStatus() returns stale data after stop()
const status = await audioRecorder.getStatus();
const duration = status.durationMillis; // Returns 0!

// ✅ CORRECT - Capture state BEFORE stopping
const recorderState = useAudioRecorderState(audioRecorder);
const duration = recorderState.durationMillis; // Correct value
const uri = recorderState.url;
await audioRecorder.stop();
```

**Key Features:**
- Minimum recording duration validation (300ms)
- Proper permission handling (requestPermissions)
- Recording state captured before stopping
- Base64 conversion with expo-file-system
- Audio config: 44100Hz sample rate, high quality, .m4a format

**State Management:**
```typescript
interface UseAudioRecorderResult {
  isRecording: boolean;
  recordingDuration: number; // Live updates during recording
  isPreparing: boolean;
  hasPermission: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>; // Returns base64 audio
}
```

**2. VoiceButton Component** (`shopping-list/components/voice-button.tsx`)

Press-and-hold microphone button with visual feedback.

**Key Features:**
- 🎤 Microphone icon that pulses during recording
- Fixed-height feedback container (20px) prevents layout jumping
- "Keep holding..." hint when duration < 300ms
- Minimum recording duration enforced
- haptic feedback on press/release

**Visual States:**
- Default: Gray microphone
- Recording: Red pulsing microphone + "Keep holding..." hint
- Processing: Shows processing state (future TTS)

**3. useVoiceCommands Hook** (`shopping-list/hooks/use-voice-commands.ts`)

Integration hook for voice command workflow.

**Features:**
- Session ID management (persists across commands)
- Audio blob to backend communication
- Clarification vs error handling
- Returns structured result: `{ success, action, data, ttsText }`

### Backend Services

**1. VoiceService** (`backend/src/services/voice-service.ts`)

Main orchestration service for voice command processing.

**Key Methods:**
```typescript
processVoiceCommand(audioBlob: string, sessionId?: string): Promise<VoiceCommandResponse>
  → Session management
  → Whisper transcription
  → Context building
  → GPT-4 intent parsing
  → Action execution
  → Context update

transcribeAudio(audioBlob: string): Promise<string>
  → Convert base64 to Buffer
  → Create File object
  → OpenAI Whisper API call
  → Returns transcript text

executeAction(intent: ParsedIntent, sessionId: string): Promise<ActionResult>
  → Routes to specific handlers:
    - handleCreateList()
    - handleAddItem()
    - handleRemoveItem()
    - handleSendList()
    - handleQueryLists()
```

**Context Building:**
```typescript
const context: ParseContext = {
  currentListId: session.currentListId, // From last create_list
  lastCommands: session.context // Last 5 commands with timestamps
};
```

**2. IntentParser** (`backend/src/services/intent-parser.ts`)

GPT-4-powered natural language understanding.

**System Prompt Engineering:**

The system prompt (defined in `backend/src/config/openai.ts`) instructs GPT-4 on:
- **6 Available Actions:** create_list, add_item, remove_item, send_list, query_lists, clarification
- **Entity Extraction:** listName, itemName, quantity (OPTIONAL), listId
- **Context Awareness:** Use currentListId from context, parse quantities intelligently
- **JSON Response Format:** Structured output with action, confidence, entities, requiresClarification
- **Examples:** Input→Output patterns showing expected behavior

**Example System Prompt Section:**
```
Actions you can choose from:
1. create_list - Create a new shopping list
   Entities: listName (required)

2. add_item - Add an item to a shopping list
   Entities: itemName (required), quantity (OPTIONAL), listId (optional if context has currentListId)

3. clarification - Ask the user for more information
   Entities: clarificationMessage (required)

Context awareness:
- If context includes currentListId, use it for add_item/remove_item actions
- Do NOT ask for clarification on missing quantity - it's optional
- Parse quantities intelligently: "three cases" → quantity: "3 cases"
```

**Context Message Format:**
```typescript
buildContextMessage(context: ParseContext): string {
  let msg = "Context:\n";
  if (context.currentListId) {
    msg += `Current list ID: ${context.currentListId}\n`;
  }
  if (context.lastCommands?.length) {
    msg += "Recent commands:\n";
    context.lastCommands.forEach(cmd => {
      msg += `- ${cmd.transcript} → ${cmd.intent.action}\n`;
    });
  }
  return msg;
}
```

**GPT-4 Call:**
```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [
    { role: 'system', content: INTENT_PARSING_SYSTEM_PROMPT },
    { role: 'user', content: `${contextMessage}\n\nUser command: "${transcript}"` }
  ],
  temperature: 0.3, // Low temperature for consistent parsing
  max_tokens: 500
});
```

**Retry Logic:**
- 3 attempts with exponential backoff
- Validates GPT-4 response structure
- Defaults requiresClarification to false if omitted

**3. SessionManager** (`backend/src/services/session-manager.ts`)

In-memory session storage with automatic cleanup.

**Session Structure:**
```typescript
interface VoiceSession {
  id: string; // UUID v4
  userId?: string; // For future auth
  currentListId?: string; // Set by create_list action
  context: VoiceCommand[]; // Last 5 commands
  createdAt: Date;
  lastActivityAt: Date; // Updated on every command
}
```

**Key Features:**
- 5-minute session timeout (SESSION_TIMEOUT_MS)
- Keeps last 5 commands (maxContextCommands)
- Automatic expired session cleanup
- Thread-safe Map-based storage

**Methods:**
```typescript
createSession(): VoiceSession
getSession(sessionId: string): VoiceSession | null // Returns null if expired
updateContext(sessionId: string, command: VoiceCommand): void
setCurrentList(sessionId: string, listId: string): void
cleanup(): void // Removes expired sessions
```

**4. VoiceController** (`backend/src/controllers/voice.controller.ts`)

HTTP request handlers with dependency injection.

**Critical Refactor:**
```typescript
// ❌ OLD - Created separate DB instance
const db = new SQLiteDatabase(DB_PATH);
const listService = new ShoppingListService(db);

// ✅ NEW - Dependency injection, shares DB with REST API
export function initializeVoiceController(
  listService: ShoppingListService,
  itemService: ShoppingListItemService
) {
  const voiceService = new VoiceService(listService, itemService);
  // ... initialize controller with shared services
}

// In index.ts:
initializeVoiceController(shoppingListService, itemService);
```

**Why This Matters:**
- SQLite caching or connection isolation caused voice-created lists to not appear in GET /api/v1/shopping-lists
- Single DB instance ensures all services see same data
- Proper service lifecycle management

**Endpoints:**
```typescript
POST /api/v1/voice/command
  Body: { audio: base64, sessionId?: string }
  Response: { success, sessionId, transcript, action, data, ttsText }

POST /api/v1/voice/session
  Response: { sessionId, expiresAt }

GET /api/v1/voice/session/:sessionId
  Response: { session, isValid }
```

### Critical Fixes & Learnings

**1. expo-audio State Bug**

**Problem:** Recording duration always showed 0ms after stopping.

**Root Cause:** `getStatus()` returns stale/reset data after `stop()` is called.

**Evidence:**
```
[DEBUG] State before stop: {durationMillis: 4982, url: "file://..."}
[DEBUG] Recording stopped, status: {durationMillis: 0, url: null}
```

**Solution:**
```typescript
// Capture state BEFORE stopping
const recorderState = useAudioRecorderState(audioRecorder);
const duration = recorderState.durationMillis;
const uri = recorderState.url;

// Then stop
await audioRecorder.stop();

// Use captured values
if (duration < 300) {
  Alert.alert("Recording too short");
  return;
}
```

**2. Database Instance Sharing**

**Problem:** Lists created via voice commands not appearing in UI.

**Investigation:**
```bash
# Database showed 5 lists
$ sqlite3 shopping-lists.db "SELECT id, name FROM shopping_lists"
cb1b82aa|produce
32c4665b|produce
...

# API returned only 3 lists
$ curl http://localhost:3001/api/v1/shopping-lists
{"lists": [{...}, {...}, {...}]}  # Missing voice-created lists
```

**Root Cause:** voice.controller.ts created its own `new SQLiteDatabase(DB_PATH)` instance.

**Solution:** Dependency injection pattern
```typescript
// index.ts - Single source of truth
const db = new SQLiteDatabase(DB_PATH);
const listService = new ShoppingListService(db);
const itemService = new ShoppingListItemService(db);

// Share services with voice controller
initializeVoiceController(listService, itemService);
```

**3. GPT-4 Validation**

**Problem:** "Missing or invalid requiresClarification in parsed intent"

**Root Cause:** GPT-4 omitted `requiresClarification: false` when returning confident intents.

**Solution:**
```typescript
// validateParsedIntent() - Default to false
const requiresClarification = parsed.requiresClarification ?? false;
```

**4. Quantity Handling**

**Problem:** GPT-4 asked "How many tomatoes?" for "Add tomatoes" command.

**Solution:** Updated system prompt:
- Explicitly marked quantity as "OPTIONAL"
- Added: "Do NOT ask for clarification on missing quantity"
- Added example: "Add tomatoes" → `{"action": "add_item", "entities": {"itemName": "tomatoes"}}`
- Backend defaults: `quantity: intent.entities.quantity || '1'`

### Cost Analysis

**Per Voice Command (~2-5 seconds of audio):**
- Whisper API: ~$0.006 per minute = ~$0.001 per command
- GPT-4 Turbo: ~$0.01/1K input tokens + ~$0.03/1K output tokens
  * System prompt: ~400 tokens
  * Context + transcript: ~100 tokens
  * Response: ~50 tokens
  * Cost: ~$0.005-0.007 per command
- **Total: ~$0.008 per voice command**

**Monthly Cost Estimates:**
- Light use (50 commands/day): ~$12/month
- Moderate use (200 commands/day): ~$48/month
- Heavy use (500 commands/day): ~$120/month

### Testing Results

**End-to-End Testing (Nov 27-28):**

✅ **Test 1: Create List**
- Command: "Create a list called produce"
- Audio: 2351ms, 119KB
- Whisper: "Create a list called produce."
- GPT-4: `{"action": "create_list", "confidence": 0.95, "entities": {"listName": "produce"}}`
- Result: List created with ID cb1b82aa
- UI: Appeared immediately in shopping lists screen

✅ **Test 2: Add Item (No Quantity)**
- Command: "Add tomatoes"
- Context: currentListId = "cb1b82aa"
- Whisper: "Add tomatoes."
- GPT-4: `{"action": "add_item", "confidence": 0.9, "entities": {"itemName": "tomatoes"}}`
- Result: Item added with quantity "1"
- UI: Appeared in list detail screen

✅ **Test 3: Add Item (With Quantity)**
- Command: "Add three cases of tomatoes"
- Context: currentListId = "cb1b82aa"
- Whisper: "Add three cases of tomatoes."
- GPT-4: `{"action": "add_item", "confidence": 0.95, "entities": {"itemName": "tomatoes", "quantity": "3 cases"}}`
- Result: Item added with quantity "3 cases"
- UI: Updated correctly

**Backend Tests:**
- 115/128 passing (13 integration test mocks failing, not blocking)
- All voice service unit tests passing

**Mobile Tests:**
- 163/163 passing
- VoiceButton, useAudioRecorder, useVoiceCommands all covered

### Configuration

**Environment Variables:**
```bash
# backend/.env
OPENAI_API_KEY=sk-...
SESSION_TIMEOUT_MS=300000  # 5 minutes
MAX_CONTEXT_COMMANDS=5
WHISPER_MODEL=whisper-1
GPT_MODEL=gpt-4-turbo-preview
```

**expo-audio Configuration:**
```typescript
const audioConfig: RecordingOptions = {
  android: {
    extension: '.m4a',
    outputFormat: AndroidOutputFormat.MPEG_4,
    audioEncoder: AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    audioQuality: IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};
```

### Known Limitations

**Current:**
- No wake word detection ("Hey Shoppy" planned for Phase 3)
- No text-to-speech responses (TTS planned for Phase 3)
- Session storage is in-memory (lost on server restart)
- No user authentication (all sessions are anonymous)
- English only (multi-language support not tested)

**Future Improvements:**
- Wake word detection with expo-speech-recognition
- TTS responses with expo-speech
- Persistent session storage (Redis or database)
- User authentication with session linking
- Multi-language support
- Voice settings (TTS voice, speed, language)
- Offline mode with local speech processing

### Files Modified

**Backend:**
- `backend/src/config/openai.ts` - OpenAI client + system prompt
- `backend/src/services/voice-service.ts` - Main orchestration (299 lines)
- `backend/src/services/intent-parser.ts` - GPT-4 integration (145 lines)
- `backend/src/services/session-manager.ts` - Session storage (144 lines)
- `backend/src/controllers/voice.controller.ts` - HTTP handlers (163 lines)
- `backend/src/index.ts` - Dependency injection initialization
- `backend/src/types/index.ts` - Voice-related TypeScript types

**Mobile:**
- `shopping-list/hooks/use-audio-recorder.ts` - expo-audio wrapper (175 lines)
- `shopping-list/hooks/use-voice-commands.ts` - Integration hook (89 lines)
- `shopping-list/components/voice-button.tsx` - UI component (236 lines)
- `shopping-list/services/voice-command-service.ts` - API client (138 lines)
- `shopping-list/app/(tabs)/index.tsx` - Voice integration in lists screen

### Next Steps

**Immediate:**
1. Test remaining voice commands (remove_item, send_list, query_lists)
2. Add text-to-speech (TTS) for spoken confirmations
3. Polish error handling and loading states

**Phase 3: Enhanced Voice Features**
1. Wake word detection ("Hey Shoppy")
2. Background listening when enabled
3. Voice settings screen (TTS on/off, voice selection)
4. Multi-turn conversation improvements
5. Error recovery and retry mechanisms

**Phase 4: Production Readiness**
1. Persistent session storage (Redis)
2. Rate limiting on voice endpoints
3. Cost monitoring and budgets
4. Performance optimization (reduce GPT-4 tokens)
5. Comprehensive error logging and monitoring

---

## Changelog

### Version 0.4.0 - November 23, 2025 (Voice UI Stubs - Phase 6)

**Added:**
- VoiceStatusIndicator component with 4 visual states (coming-soon, ready, listening, processing)
- VoiceActivationBanner component for persistent voice status
- Settings screen with Voice Features section (2 toggles)
- Voice button integration in Shopping Lists screen header
- Voice button integration in List Detail screen header
- "Hey Shoppy" wake word messaging throughout
- 40 new tests for voice components and integrations
- Complete voice UI foundation for Task 4

**Voice Components:**
- `VoiceStatusIndicator` - Reusable 44pt touch target button
- `VoiceActivationBanner` - Full-width green banner for voice status
- Settings toggles for Voice Activation and Voice Button (disabled stubs)

**Integration:**
- Voice button renders in all screen states (loading, error, empty, data)
- "Coming Soon" alerts explain future functionality
- Consistent "Hey Shoppy" wake word branding
- Kitchen-friendly messaging (hands-free operation)

**Test Coverage:**
- VoiceStatusIndicator: 13 tests
- VoiceActivationBanner: 10 tests
- Settings screen: 11 tests
- Shopping Lists voice: 3 tests
- List Detail voice: 3 tests
- Total: 125 tests (up from 85), all passing

**Code Quality:**
- ESLint 0 errors, 0 warnings
- TypeScript strict mode passing
- HTML entities for proper quote escaping
- No unused variables

**Task 4 Preparation:**
- UI foundation complete for voice integration
- Component states ready for real-time updates
- Settings toggles ready to become functional
- "Hey Shoppy" wake word ready for expo-speech-recognition

**Next Steps:**
- Phase 7: Accessibility & Kitchen UX validation (~1 hour)
- Task 4: OpenAI Whisper + GPT-4 integration (~2 weeks)

---

### Version 0.3.0 - November 23, 2025 (Mobile UI & State Management)

**Added:**
- Complete mobile UI with two main screens (Shopping Lists, List Detail)
- React Query state management (TanStack React Query 5.65.2)
- Axios HTTP client for backend communication
- Custom React Query hooks for all CRUD operations
- Shopping list filtering by status (active/sent/completed)
- Item management within lists (add/edit/delete)
- Send to Manager workflow with confirmation
- Status badge system (Active/Sent/Completed)
- Reusable modal components (Confirmation, Add List, Add/Edit Item)
- Backend unavailable detection and retry
- 85 tests across 11 test suites (before Phase 6)
- Comprehensive test patterns for React Query

**State Management Features:**
- Hierarchical query key structure
- Automatic cache invalidation
- Background refetching
- Loading and error states
- 5-minute stale time configuration
- 2 retry attempts on failure

**UI/UX Features:**
- Kitchen-friendly large touch targets (44x44pt minimum)
- High contrast colors for bright environments
- Confirmation modals for destructive actions
- Floating Action Buttons (FAB) for primary actions
- Empty states with clear calls-to-action
- Real-time UI updates from React Query cache
- Success/error feedback via alerts and inline messages

**Testing Infrastructure:**
- Jest 29.7.0 with React Native Testing Library 13.3.3
- QueryClientProvider wrapper pattern
- Hook mocking patterns
- Async mutation testing
- Modal and user interaction testing
- TDD RED-GREEN-REFACTOR-DOCUMENT methodology

**Navigation:**
- Tab-based navigation (3 tabs: Lists, Explore, Settings)
- Stack navigation for list details
- URL parameter passing for list IDs
- Back navigation support

### Version 0.2.0 - November 2, 2025 (Backend Foundation)

**Added:**
- Complete REST API with Express + TypeScript
- SQLite database with better-sqlite3
- Zod validation for all endpoints
- Pino structured logging
- 62 unit tests with 100% coverage on services
- Shopping list CRUD operations
- Shopping list item CRUD operations
- Reminder service stub (for Task 6)
- Comprehensive error handling
- CORS configuration for Expo dev servers
- Health check endpoint

**Technical Details:**
- TDD approach with RED-GREEN-REFACTOR cycle
- Layered architecture (Controllers → Services → Database)
- Dependency injection pattern
- Mock database for testing
- No integration tests (unit tests only)

### Version 0.1.0 - October 28, 2025 (Foundation)

**Added:**
- Initial Expo project scaffolding
- File-based routing with Expo Router
- Basic UI components and theming system
- TypeScript configuration
- Project documentation structure
- Development guidelines in `.claude/CLAUDE.md`

**Next Steps:**
- Set up Jest testing infrastructure
- Create first test suite
- Update README with setup instructions
- Begin Task 2 (Backend API development)

---

**For Questions or Updates:** Contact project maintainer or refer to GitHub Epic #57
