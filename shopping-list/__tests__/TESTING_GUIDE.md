# Test Mocking Guidelines

## Overview
This document provides standardized patterns for mocking in tests. Use these patterns to ensure consistency and reduce duplication across test files.

## Quick Start

### 1. Import Test Utilities

```typescript
import {
  renderWithQueryClient,
  createMockQuery,
  createMockMutation,
  createShoppingListsHooksMock,
} from '@/__tests__/test-utils';
```

### 2. Mock Hooks Module

```typescript
// At the top of your test file, after imports
jest.mock('@/hooks/use-shopping-lists', () => createShoppingListsHooksMock());

// Import the hooks you need to mock
import { useShoppingListDetail, useCreateItem } from '@/hooks/use-shopping-lists';

// Cast them as mock functions
const mockUseShoppingListDetail = useShoppingListDetail as jest.MockedFunction<typeof useShoppingListDetail>;
const mockUseCreateItem = useCreateItem as jest.MockedFunction<typeof useCreateItem>;
```

### 3. Setup Mocks in Tests

```typescript
describe('YourComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock query hooks
    mockUseShoppingListDetail.mockReturnValue(createMockQuery({
      data: yourMockData,
      isLoading: false,
    }));
    
    // Mock mutation hooks
    mockUseCreateItem.mockReturnValue(createMockMutation({
      mutate: jest.fn(),
      isPending: false,
    }));
  });
  
  it('should render correctly', () => {
    renderWithQueryClient(<YourComponent />);
    // Your assertions here
  });
});
```

## Common Patterns

### Pattern 1: Mocking Query Hooks (useShoppingLists, useShoppingListDetail)

```typescript
// Loading state
mockUseShoppingListDetail.mockReturnValue(createMockQuery({
  isLoading: true,
}));

// Success state with data
mockUseShoppingListDetail.mockReturnValue(createMockQuery({
  data: {
    id: '1',
    name: 'My List',
    items: [...],
  },
  isLoading: false,
  isError: false,
}));

// Error state
mockUseShoppingListDetail.mockReturnValue(createMockQuery({
  isLoading: false,
  isError: true,
  error: { response: { status: 404 } },
}));
```

### Pattern 2: Mocking Mutation Hooks (useCreateItem, useUpdateItem, useDeleteItem)

```typescript
// Default state (idle)
mockUseCreateItem.mockReturnValue(createMockMutation({
  mutate: jest.fn(),
  isPending: false,
  isError: false,
}));

// Pending state
mockUseCreateItem.mockReturnValue(createMockMutation({
  mutate: jest.fn(),
  isPending: true,
}));

// Error state
mockUseCreateItem.mockReturnValue(createMockMutation({
  mutate: jest.fn(),
  isPending: false,
  isError: true,
  error: new Error('Network error'),
}));

// With callback testing
const mockMutate = jest.fn((data, options) => {
  // Simulate success
  options?.onSuccess?.();
});

mockUseCreateItem.mockReturnValue(createMockMutation({
  mutate: mockMutate,
}));
```

### Pattern 3: Mocking Route Params

```typescript
import { useLocalSearchParams } from 'expo-router';

const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<typeof useLocalSearchParams>;

// In your test
mockUseLocalSearchParams.mockReturnValue({
  id: 'list-123',
  name: 'Groceries',
});
```

## Global Mocks (Already Configured)

These are automatically available in all tests via `__tests__/setup.ts`:

- ✅ `expo-router` (useLocalSearchParams, Stack, useRouter)
- ✅ `react-native-safe-area-context` (useSafeAreaInsets)

**You don't need to mock these again in individual test files.**

## Anti-Patterns to Avoid

### ❌ DON'T: Inline mock return values

```typescript
// BAD
mockUseShoppingListDetail.mockReturnValue({
  data: mockData,
  isLoading: false,
  isError: false,
  error: null,
  refetch: jest.fn(),
});
```

### ✅ DO: Use helper functions

```typescript
// GOOD
mockUseShoppingListDetail.mockReturnValue(createMockQuery({
  data: mockData,
}));
```

### ❌ DON'T: Duplicate QueryClient setup

```typescript
// BAD
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const Wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

render(<Component />, { wrapper: Wrapper });
```

### ✅ DO: Use renderWithQueryClient

```typescript
// GOOD
renderWithQueryClient(<Component />);
```

### ❌ DON'T: Mock expo-router or safe-area-context in every file

```typescript
// BAD - Already mocked globally
jest.mock('expo-router', () => ({...}));
```

### ✅ DO: Just override when needed

```typescript
// GOOD - Override specific behavior when needed
mockUseLocalSearchParams.mockReturnValue({ id: 'specific-id' });
```

## Migration Guide

### Step 1: Update imports

```diff
- import { render } from '@testing-library/react-native';
- import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
+ import { renderWithQueryClient, createMockQuery, createMockMutation } from '@/__tests__/test-utils';
```

### Step 2: Replace jest.mock() with helper

```diff
- jest.mock('@/hooks/use-shopping-lists', () => ({
-   useShoppingListDetail: jest.fn(),
-   useCreateItem: jest.fn(() => ({
-     mutate: jest.fn(),
-     isPending: false,
-     isError: false,
-     reset: jest.fn(),
-   })),
- }));
+ jest.mock('@/hooks/use-shopping-lists', () => createShoppingListsHooksMock());
```

### Step 3: Replace render with renderWithQueryClient

```diff
- const Wrapper = createWrapper();
- render(<Component />, { wrapper: Wrapper });
+ renderWithQueryClient(<Component />);
```

### Step 4: Use helper functions for mock returns

```diff
- mockUseShoppingListDetail.mockReturnValue({
-   data: mockData,
-   isLoading: false,
-   isError: false,
-   error: null,
-   refetch: jest.fn(),
- });
+ mockUseShoppingListDetail.mockReturnValue(createMockQuery({
+   data: mockData,
+ }));
```

## Example: Complete Test File

```typescript
import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import MyComponent from './my-component';
import { useShoppingListDetail, useCreateItem } from '@/hooks/use-shopping-lists';
import {
  renderWithQueryClient,
  createMockQuery,
  createMockMutation,
  createShoppingListsHooksMock,
} from '@/__tests__/test-utils';

// Mock the hooks module
jest.mock('@/hooks/use-shopping-lists', () => createShoppingListsHooksMock());

const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<typeof useLocalSearchParams>;
const mockUseShoppingListDetail = useShoppingListDetail as jest.MockedFunction<typeof useShoppingListDetail>;
const mockUseCreateItem = useCreateItem as jest.MockedFunction<typeof useCreateItem>;

describe('MyComponent', () => {
  const mockData = {
    id: '1',
    name: 'Test List',
    items: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup route params
    mockUseLocalSearchParams.mockReturnValue({ id: '1' });
    
    // Setup default mocks
    mockUseShoppingListDetail.mockReturnValue(createMockQuery({
      data: mockData,
    }));
    
    mockUseCreateItem.mockReturnValue(createMockMutation());
  });

  it('should display the list name', () => {
    renderWithQueryClient(<MyComponent />);
    expect(screen.getByText('Test List')).toBeTruthy();
  });

  it('should handle create action', () => {
    const mockMutate = jest.fn();
    mockUseCreateItem.mockReturnValue(createMockMutation({
      mutate: mockMutate,
    }));

    renderWithQueryClient(<MyComponent />);
    
    const button = screen.getByTestId('create-button');
    fireEvent.press(button);
    
    expect(mockMutate).toHaveBeenCalled();
  });
});
```

## Benefits

1. **Consistency**: All tests use the same patterns
2. **Less Code**: Reduce boilerplate by 50-70%
3. **Maintainability**: Changes to mock structure only need to happen in one place
4. **Type Safety**: Helpers provide correct TypeScript types
5. **Readability**: Clear, semantic helper names

## Questions?

If you encounter a mocking pattern that isn't covered here, consider:
1. Can it be added to `test-utils.tsx`?
2. Should it be documented in this guide?
3. File an issue or update this document!
