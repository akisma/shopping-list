# Shopping List Mobile App - Technical Documentation

**Last Updated:** October 28, 2025  
**Version:** 0.1.0 (Foundation Phase)

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
- **State Management:** (TBD - React Query or Redux Toolkit)
- **UI Components:** React Native built-ins + custom components
- **Testing:** Jest + React Native Testing Library

**Backend API:** (To be implemented in Task 2)
- **Runtime:** Node.js
- **Framework:** Express
- **Database:** PostgreSQL
- **ORM:** (TBD - Sequelize or Prisma)
- **API Docs:** Swagger/OpenAPI

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

## Testing Strategy

### Testing Framework

**Jest Configuration** (To be set up in Task 1)
- **Test Runner:** Jest
- **Component Testing:** React Native Testing Library
- **Coverage Target:** (Will set after more code exists)
- **Test Location:** Co-located with components (e.g., `Component.test.tsx`)

**Test File Naming Convention:**
- Unit tests: `ComponentName.test.tsx`
- Integration tests: `FeatureName.integration.test.tsx`
- E2E tests: (Will use Detox or similar in Task 9)

### Testing Patterns

**Component Tests:**
```typescript
// Example pattern for component tests
import { render, screen } from '@testing-library/react-native';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeTruthy();
  });
});
```

**Testing Principles:**
- Test user behavior, not implementation details
- Use accessible queries (getByRole, getByLabelText)
- Mock external dependencies (API, storage, etc.)
- Keep tests fast and isolated

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

## Changelog

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
