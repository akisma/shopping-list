# Voice Commands Testing Guide

## Prerequisites

1. **OpenAI API Key**: You need an OpenAI API key with access to:
   - Whisper API (speech-to-text)
   - GPT-4 API (intent parsing)

2. **Development Environment**:
   - Node.js 18+ installed
   - Expo Go app on your phone OR iOS Simulator
   - Two terminal windows

## Setup Steps

### 1. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-api-key-here
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Mobile
cd ../shopping-list
npm install
```

### 3. Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
Server running on http://localhost:3001
Database initialized
```

### 4. Start Mobile App

In a new terminal:

```bash
cd shopping-list
npm start
```

Then:
- Press `i` for iOS Simulator
- OR scan QR code with Expo Go app (Android/iOS)

## Testing Voice Commands

### Test 1: Create a List

1. Open the app
2. Press and hold the microphone button
3. Say: **"Create a list called produce"**
4. Release the button
5. ✅ Expected: Alert shows "I've created a list called produce"
6. ✅ Expected: New list appears on screen

### Test 2: Add Items

1. Press and hold the microphone button
2. Say: **"Add tomatoes"**
3. Release
4. ✅ Expected: Alert shows "I've added tomatoes to produce"

### Test 3: Add with Quantity

1. Press and hold the microphone button
2. Say: **"Add three cases of onions"**
3. Release
4. ✅ Expected: Alert shows "I've added 3 cases of onions to produce"

### Test 4: Query Lists

1. Press and hold the microphone button
2. Say: **"Show my lists"**
3. Release
4. ✅ Expected: Alert shows all your lists

### Test 5: Remove Item

1. Press and hold the microphone button
2. Say: **"Remove the tomatoes"**
3. Release
4. ✅ Expected: Alert shows "I've removed tomatoes from produce"

### Test 6: Send List

1. Press and hold the microphone button
2. Say: **"Send this list"**
3. Release
4. ✅ Expected: Alert shows "I've sent the produce list"

## Voice Command Examples

### Creating Lists
- "Create a list called groceries"
- "Make a new list named supplies"
- "Start a list for the kitchen"

### Adding Items
- "Add milk"
- "Add two gallons of milk"
- "Add three cases of water bottles"
- "Put chicken breast on the list"

### Removing Items
- "Remove milk"
- "Delete the bread"
- "Take off tomatoes"

### Queries
- "Show my lists"
- "What lists do I have?"
- "List all my shopping lists"

### Sending
- "Send this list"
- "Send the list"
- "Email this list"

## Troubleshooting

### Backend Issues

**Problem**: "OPENAI_API_KEY environment variable is required"
- Solution: Add your API key to `backend/.env`

**Problem**: Port 3001 already in use
- Solution: Kill process on port 3001 or change port in `backend/src/index.ts`

**Problem**: Database errors
- Solution: Delete `backend/data/shopping-lists.db` and restart server

### Mobile Issues

**Problem**: "Network request failed"
- iOS Simulator: Backend should be on `http://localhost:3001`
- Physical Device: Check that phone and computer are on same WiFi
- Android Emulator: Backend should use `http://10.0.2.2:3001`

**Problem**: Voice button doesn't appear
- Check that backend is running
- Check console for errors
- Try pulling down to refresh

**Problem**: Microphone permission denied
- iOS: Go to Settings > Privacy > Microphone > Expo Go
- Android: Go to Settings > Apps > Expo Go > Permissions > Microphone

### Voice Recognition Issues

**Problem**: "Voice command failed"
- Speak clearly and at normal volume
- Try shorter, simpler commands first
- Check backend logs for error details

**Problem**: Command misunderstood
- Use the example phrases listed above
- Speak at a normal pace
- Avoid background noise

## Architecture Overview

```
Mobile App (React Native/Expo)
  ↓
  Press & Hold VoiceButton
  ↓
  Record Audio (expo-av)
  ↓
  Base64 Encode (expo-file-system)
  ↓
  POST /api/voice/command
  ↓
Backend (Node.js/Express)
  ↓
  Decode Audio Buffer
  ↓
  Whisper API (Speech-to-Text)
  ↓
  GPT-4 API (Intent Parsing)
  ↓
  Execute Action (CRUD Operations)
  ↓
  Return Response + TTS Text
  ↓
Mobile App
  ↓
  Display Alert with Result
  ↓
  Refresh List (if needed)
```

## Performance Notes

- **Latency**: Typical response time is 2-5 seconds
  - 1-2s for Whisper transcription
  - 1-2s for GPT-4 intent parsing
  - <1s for database operations

- **Rate Limits**:
  - Voice commands: 30 per minute
  - Session operations: 10 per minute

- **Session Duration**: 5 minutes of inactivity

## Cost Estimates (OpenAI API)

Per voice command:
- Whisper: ~$0.006 (for 30 seconds of audio)
- GPT-4: ~$0.002 (for intent parsing)
- **Total: ~$0.008 per command**

For 100 commands/day:
- Daily: $0.80
- Monthly: $24.00

## Next Steps After Testing

1. ✅ Verify all voice commands work
2. ✅ Test on both iOS and Android
3. ✅ Check session management (multiple commands)
4. ✅ Test error handling (bad audio, unclear commands)
5. 📝 Document any issues found
6. 🚀 Ready for Phase 3: Full voice command integration
