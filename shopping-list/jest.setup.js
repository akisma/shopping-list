// Jest setup file for React Native Testing Library
// Note: @testing-library/react-native v12.4+ includes matchers by default

// Mock Expo Winter runtime globals before anything else
global.__ExpoImportMetaRegistry = {};
global.structuredClone = global.structuredClone || ((val) => JSON.parse(JSON.stringify(val)));

// Mock Expo modules
jest.mock('expo-font');
jest.mock('expo-asset');

jest.mock('expo-constants', () => ({
  expoConfig: {
    name: 'shopping-list',
    slug: 'shopping-list',
  },
}));

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Silence the warning about Animated useNativeDriver
global.__reanimatedWorkletInit = () => {};

// Mock safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

// Mock expo-router
jest.mock('expo-router', () => {
  const React = require('react');
  const { View, Text, Pressable } = require('react-native');
  
  // Mock Link component with all its sub-components
  const Link = ({ children, href }) => {
    return React.createElement(View, { testID: 'mock-link', accessibilityRole: 'link' }, children);
  };
  
  Link.Trigger = ({ children }) => React.createElement(Pressable, null, children);
  Link.Preview = () => null;
  Link.Menu = ({ children, title, icon }) => React.createElement(View, null, children);
  Link.MenuAction = ({ title }) => React.createElement(Text, null, title);
  
  return {
    Link,
    router: {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    },
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    }),
    usePathname: () => '/',
    useLocalSearchParams: () => ({}),
    useGlobalSearchParams: () => ({}),
  };
});

// Mock expo-image
jest.mock('expo-image', () => ({
  Image: 'Image',
}));

// Set up global test timeout
jest.setTimeout(10000);
