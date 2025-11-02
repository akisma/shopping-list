import React from 'react';
import { render, screen } from '@testing-library/react-native';

// Import the default export from the component  
const HomeScreen = require('./index').default; // eslint-disable-line @typescript-eslint/no-require-imports

// Mock ParallaxScrollView to simplify testing
jest.mock('@/components/parallax-scroll-view', () => {
  return function ParallaxScrollView({ children }: { children: React.ReactNode }) {
    // Use require inside the factory to avoid hoisting issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require('react-native');
    return <View testID="parallax-scroll-view">{children}</View>;
  };
});

// Mock HelloWave component
jest.mock('@/components/hello-wave', () => ({
  HelloWave: function HelloWave() {
    return null;
  },
}));

describe('HomeScreen', () => {
  it('should render the welcome message', () => {
    render(<HomeScreen />);
    
    expect(screen.getByText('Welcome!')).toBeTruthy();
  });

  it('should render all three step sections', () => {
    render(<HomeScreen />);
    
    expect(screen.getByText('Step 1: Try it')).toBeTruthy();
    expect(screen.getByText('Step 2: Explore')).toBeTruthy();
    expect(screen.getByText('Step 3: Get a fresh start')).toBeTruthy();
  });

  it('should display instructions for editing the file', () => {
    render(<HomeScreen />);
    
    expect(screen.getByText('app/(tabs)/index.tsx')).toBeTruthy();
  });

  it('should display reset project instructions', () => {
    render(<HomeScreen />);
    
    expect(screen.getByText('npm run reset-project')).toBeTruthy();
  });

  it('should match snapshot', () => {
    const { toJSON } = render(<HomeScreen />);
    expect(toJSON()).toMatchSnapshot();
  });
});
