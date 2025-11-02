# Shopping List Mobile App

AI-powered mobile shopping list application for restaurant chefs, built with React Native and Expo.

**Part of Epic #57:** [AI-powered Mobile Shopping List Experience for Chefs](https://github.com/akisma/CostFX/issues/57)

## Overview

This mobile application enables restaurant chefs to create and manage shopping lists using voice commands, allowing them to stay focused on cooking without needing to use a computer. The app features AI-powered speech recognition, conversational interfaces, and push notification reminders.

### Key Features (Planned)

- 🎤 **Voice-driven shopping list creation** - Create, add, and remove items hands-free
- 🤖 **AI conversational interface** - Natural language processing with OpenAI GPT-4
- 🔊 **Text-to-speech confirmations** - Spoken feedback for all actions
- 📱 **Push notification reminders** - Never miss an order deadline
- 💻 **Manager web interface** - Shopping list management from CostFX desktop app

### Technology Stack

- **Frontend:** React Native 0.81.5 + Expo SDK 54
- **Language:** TypeScript 5.9.2
- **Navigation:** Expo Router 6.0 (file-based routing)
- **Testing:** Jest + React Native Testing Library
- **AI Services:** OpenAI (Whisper, GPT-4, TTS)
- **Push Notifications:** Expo Push Notifications

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** v9 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

### Platform-Specific Requirements

#### For iOS Development (macOS only)
- **Xcode** 15 or higher ([Mac App Store](https://apps.apple.com/us/app/xcode/id497799835))
- **Xcode Command Line Tools**
  ```bash
  xcode-select --install
  ```
- **iOS Simulator** (included with Xcode)

#### For Android Development
- **Android Studio** ([Download](https://developer.android.com/studio))
- **Android SDK** (API 34 recommended)
- **Android Emulator** or physical device

#### For Testing on Physical Devices
- **Expo Go app** (iOS or Android)
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Verify Installation

```bash
# Check Node.js version
node --version  # Should be v18+

# Check npm version  
npm --version   # Should be v9+

# Check Git
git --version
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/akisma/shopping-list.git
cd shopping-list/shopping-list
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React Native and Expo SDK
- TypeScript and type definitions
- Navigation libraries (Expo Router, React Navigation)
- Testing libraries (Jest, React Native Testing Library)
- UI libraries and utilities

### 3. Start the Development Server

```bash
npm start
```

This will start the Expo development server and display a QR code in your terminal.

**Alternative commands:**
```bash
# Start with specific platform
npm run ios        # Open in iOS Simulator
npm run android    # Open in Android Emulator  
npm run web        # Open in web browser
```

### 4. Run the App

You have several options to run the app:

#### Option A: Physical Device (Easiest)
1. Install **Expo Go** from the App Store or Play Store
2. Scan the QR code displayed in your terminal
3. The app will load on your device

#### Option B: iOS Simulator (macOS only)
1. Press `i` in the terminal where the dev server is running
2. Or run: `npm run ios`
3. The iOS Simulator will launch automatically

#### Option C: Android Emulator
1. Start an Android Virtual Device in Android Studio
2. Press `a` in the terminal where the dev server is running
3. Or run: `npm run android`

#### Option D: Web Browser
1. Press `w` in the terminal
2. Or run: `npm run web`
3. The app will open in your default browser

---

## Development Workflow

### Project Structure

```
shopping-list/
├── app/                    # File-based routing (Expo Router)
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── _layout.tsx   # Tab navigator configuration
│   │   ├── index.tsx     # Home screen
│   │   └── explore.tsx   # Explore screen
│   ├── _layout.tsx       # Root layout with providers
│   └── modal.tsx         # Example modal screen
├── assets/               # Static assets (images, fonts)
├── components/           # Reusable UI components
│   └── ui/              # Base UI components
├── constants/            # App constants (theme, config)
├── hooks/               # Custom React hooks
├── scripts/             # Build and utility scripts
├── jest.config.js       # Jest configuration
├── jest.setup.js        # Jest setup and mocks
├── metro.config.js      # Metro bundler configuration
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

**Test File Naming Convention:**
- Place test files next to the components they test
- Use `.test.tsx` or `.test.ts` extension
- Example: `component-name.tsx` → `component-name.test.tsx`

### Code Quality

#### Linting

```bash
# Run ESLint
npm run lint
```

All linting issues must be resolved before committing code.

#### Type Checking

TypeScript is configured with strict mode. The development server will show type errors in real-time.

```bash
# Check types manually
npx tsc --noEmit
```

### Hot Reload

The app supports **Fast Refresh** - your changes will appear instantly without losing app state.

- ✅ Edit any component and see changes immediately
- ✅ State is preserved across reloads
- ⚠️ If Fast Refresh doesn't work, shake your device (physical) or press `Cmd+D` (iOS) / `Cmd+M` (Android) and select "Reload"

### Debugging

#### React Native Debugger

1. Open the dev menu:
   - **iOS Simulator:** `Cmd+D`
   - **Android Emulator:** `Cmd+M`
   - **Physical Device:** Shake the device

2. Select "Debug Remote JS" or "Open Debugger"

#### VS Code Debugging

Install the [React Native Tools](https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native) extension for in-editor debugging.

#### Console Logs

```typescript
console.log('Debug message');
console.warn('Warning message');
console.error('Error message');
```

Logs appear in the terminal where you ran `npm start`.

---

## Environment Configuration

Currently, no environment variables are required for local development.

**Future environment variables** (Task 2+) will include:
- API endpoints
- OpenAI API keys
- Push notification configuration

Environment variables will be managed via:
- `.env` files (local development - not committed)
- `app.json` extra field (Expo configuration)
- EAS Secrets (production deployments)

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the Expo development server |
| `npm run ios` | Open app in iOS Simulator |
| `npm run android` | Open app in Android Emulator |
| `npm run web` | Open app in web browser |
| `npm test` | Run Jest test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run reset-project` | Move starter code to app-example/ |

---

## Troubleshooting

### Common Issues

#### Metro bundler error: "Unable to resolve module"

**Solution:**
```bash
# Clear Metro bundler cache
npx expo start --clear

# Or manually clear cache
rm -rf node_modules/.cache
```

#### iOS Simulator not opening

**Solution:**
```bash
# Check if Xcode Command Line Tools are installed
xcode-select --install

# Verify Xcode installation
xcode-select -p
```

#### Android Emulator not connecting

**Solution:**
```bash
# Ensure ANDROID_HOME is set
echo $ANDROID_HOME  # Should point to Android SDK

# Check ADB devices
adb devices  # Should list your emulator
```

#### Metro error: "Missing dev dependency react-test-renderer"

If Metro bundler tries to load test files and shows errors about missing dependencies:

**Solution:**
The project includes `metro.config.js` which excludes test files from the bundler. If you still see this error:

```bash
# Clear Metro cache and restart
npx expo start --clear

# Or restart without cache
rm -rf node_modules/.cache
npm start
```

**Note:** Test files (`.test.tsx`, `.test.ts`) are excluded from Metro bundler via the `blacklistRE` configuration. They only run through Jest when you execute `npm test`.

#### Tests failing with "Cannot find module"

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Clear Jest cache
npx jest --clearCache
```

#### TypeScript errors after installing new packages

**Solution:**
```bash
# Reinstall with legacy peer deps
npm install --legacy-peer-deps

# Or force install
npm install --force
```

### Getting Help

- **Expo Documentation:** https://docs.expo.dev/
- **React Native Docs:** https://reactnative.dev/
- **Expo Router Docs:** https://docs.expo.dev/router/introduction/
- **Project Issues:** https://github.com/akisma/shopping-list/issues

---

## Project Documentation

- **Project Status:** `.docs/PROJECT_STATUS.md` - Current phase, roadmap, and completed work
- **Technical Docs:** `.docs/TECHNICAL_DOCUMENTATION.md` - Architecture, patterns, and technical details
- **Development Guidelines:** `.claude/CLAUDE.md` - Code standards and development workflow

---

## Contributing

This project follows strict quality standards:

- ✅ All tests must pass before committing
- ✅ All linting rules must be satisfied
- ✅ No TODOs in production code
- ✅ TypeScript strict mode compliance
- ✅ Test coverage for all new features

### Development Workflow

1. Create a feature branch
2. Implement changes with tests
3. Run `npm test && npm run lint`
4. Ensure all checks pass ✅
5. Submit pull request

---

## Deployment

### Development Builds

**Expo Development Client** (future):
- Required for native modules (OpenAI integrations)
- Built via EAS Build service
- Supports over-the-air updates

### CI/CD Pipeline (Task 3a)

GitHub Actions will handle:
- Automated testing on pull requests
- Linting and type checking
- Preview builds for Android
- Deployment to AWS/Vercel

### Production Deployment

**Target platforms:**
- 📱 Android: Google Play Store (primary)
- 📱 iOS: App Store (future)
- 🌐 Web: Progressive Web App (broader access)

---

## License

[Add license information]

---

## Acknowledgments

Built with ❤️ using:
- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Jest](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)

---

**Questions?** Contact the development team or refer to the project documentation in `.docs/`
