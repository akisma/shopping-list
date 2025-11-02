import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';

// Simple component to test the test infrastructure
function HelloWorld() {
  return (
    <View>
      <Text>Hello World</Text>
      <Text>Shopping List App</Text>
    </View>
  );
}

describe('Test Infrastructure', () => {
  it('should render a simple component', () => {
    render(<HelloWorld />);
    
    expect(screen.getByText('Hello World')).toBeTruthy();
    expect(screen.getByText('Shopping List App')).toBeTruthy();
  });

  it('should verify Jest is configured correctly', () => {
    expect(true).toBe(true);
  });

  it('should verify React Native Testing Library works', () => {
    const { toJSON } = render(<HelloWorld />);
    expect(toJSON()).toMatchSnapshot();
  });
});
