# Test Refactoring Summary

## Problem
We identified duplicate mock setups across test files, with three different mocking patterns being used inconsistently:
1. Module-level jest.mock() with inline defaults (list-detail.test.tsx, update-item.test.tsx)
2. jest.spyOn() with module imports (delete-item.test.tsx)
3. API-level mocking with React Query (create-item.test.tsx, index tests)

This caused:
- Repetitive boilerplate in every test file
- Inconsistent mock configurations
- Frequent issues when adding new hooks (had to update all files)
- Difficult to maintain when hook signatures change

## Solution
Created centralized test utilities and global setup:

### 1. `__tests__/test-utils.tsx`
Provides reusable helpers:
- `renderWithQueryClient()` - Automatic QueryClient wrapping
- `createMockQuery()` - Standard query hook mocks
- `createMockMutation()` - Standard mutation hook mocks
- `createShoppingListsHooksMock()` - Complete hooks module mock
- `createTestQueryClient()` - Consistent QueryClient config

### 2. `__tests__/setup.ts`
Global mocks that run for all tests:
- `expo-router` (useLocalSearchParams, Stack, useRouter)
- `react-native-safe-area-context` (useSafeAreaInsets)

### 3. `__tests__/TESTING_GUIDE.md`
Comprehensive documentation with:
- Quick start guide
- Common patterns
- Anti-patterns to avoid
- Migration guide
- Complete example

## Benefits

### Before Refactor (per test file):
```typescript
// ~30 lines of boilerplate
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  Stack: { Screen: ({ children }) => children },
}));

jest.mock('@/hooks/use-shopping-lists', () => ({
  useShoppingListDetail: jest.fn(),
  useCreateItem: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    reset: jest.fn(),
  })),
  // ... repeat for all hooks
}));

const createWrapper = () => {
  const queryClient = new QueryClient({...});
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  return Wrapper;
};
```

### After Refactor:
```typescript
// ~5 lines
import { renderWithQueryClient, createShoppingListsHooksMock } from '@/__tests__/test-utils';

jest.mock('@/hooks/use-shopping-lists', () => createShoppingListsHooksMock());

// Global mocks (expo-router, safe-area-context) already available
// No QueryClient wrapper needed
```

**Code reduction: 75-85% less boilerplate per file**

## Status

✅ Test utilities created and documented
✅ All 77 tests still passing
✅ Global setup configured in jest.config.js
✅ Comprehensive migration guide provided

### Current Test Files (Not Yet Migrated):
All existing test files continue to work as-is. Migration is optional and can be done gradually:

- `app/(tabs)/index.test.tsx`
- `app/(tabs)/index.create.test.tsx`
- `app/(tabs)/index.delete.test.tsx`
- `app/(tabs)/list-detail.test.tsx`
- `app/(tabs)/list-detail.create-item.test.tsx`
- `app/(tabs)/list-detail.delete-item.test.tsx`
- `app/(tabs)/list-detail.update-item.test.tsx`

### Recommended Approach:
**Don't break working tests.** Use new patterns for:
1. All new test files going forward
2. When significantly modifying existing tests
3. When fixing mock-related issues

## Usage Example

New test file using refactored patterns:

```typescript
import React from 'react';
import { screen } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import MyComponent from './my-component';
import { useShoppingListDetail } from '@/hooks/use-shopping-lists';
import {
  renderWithQueryClient,
  createMockQuery,
  createShoppingListsHooksMock,
} from '@/__tests__/test-utils';

jest.mock('@/hooks/use-shopping-lists', () => createShoppingListsHooksMock());

const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<typeof useLocalSearchParams>;
const mockUseShoppingListDetail = useShoppingListDetail as jest.MockedFunction<typeof useShoppingListDetail>;

describe('MyComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({ id: '1' });
    mockUseShoppingListDetail.mockReturnValue(createMockQuery({
      data: { id: '1', name: 'Test' },
    }));
  });

  it('renders', () => {
    renderWithQueryClient(<MyComponent />);
    expect(screen.getByText('Test')).toBeTruthy();
  });
});
```

## Future Improvements

Potential enhancements:
1. Create mock data factories (e.g., `createMockShoppingList()`, `createMockItem()`)
2. Add helpers for common test scenarios (loading, error, empty states)
3. Create custom matchers for common assertions
4. Add performance testing utilities
5. Create visual regression test helpers

## Validation

- ✅ All 77 tests passing
- ✅ No breaking changes to existing tests
- ✅ TypeScript types properly maintained
- ✅ Jest configuration updated
- ✅ Documentation complete
