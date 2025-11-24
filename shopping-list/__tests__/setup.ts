/**
 * Jest Setup File
 * 
 * Common mocks that should be available in all test files.
 * These are set up once globally to avoid repetition.
 */

// Mock expo-router with common defaults
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({})),
  Stack: {
    Screen: ({ children }: { children: React.ReactNode }) => children,
  },
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  })),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ 
    top: 0, 
    bottom: 0, 
    left: 0, 
    right: 0 
  })),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Suppress console warnings in tests (optional - remove if you want to see warnings)
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = jest.fn((message) => {
    // Only suppress specific warnings
    if (
      message.includes('React.createElement: type is invalid') ||
      message.includes('An update to')
    ) {
      return;
    }
    originalWarn(message);
  });
  
  console.error = jest.fn((message) => {
    // Only suppress specific errors
    if (
      message.includes('Warning: ReactDOM.render') ||
      message.includes('Not implemented: HTMLFormElement.prototype.submit')
    ) {
      return;
    }
    originalError(message);
  });
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
