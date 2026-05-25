Create tests for a given module following project conventions.

Target: $ARGUMENTS

Rules:
- Test file placed next to the source file: `module-name.test.ts`
- Use Vitest (`describe`, `it`, `expect`)
- Use descriptive test names: `it('should return empty array when no messages exist')`
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies (database, APIs)
- Test edge cases and error scenarios
- For React components, use React Testing Library

Backend test template:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('${ModuleName}', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('${methodName}', () => {
    it('should handle the happy path', async () => {
      // Arrange
      // Act
      // Assert
    });

    it('should throw when given invalid input', async () => {
      // Arrange
      // Act & Assert
      await expect(fn()).rejects.toThrow();
    });
  });
});
```

Component test template:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ${ComponentName} } from './${component-name}';

describe('${ComponentName}', () => {
  it('should render correctly', () => {
    render(<${ComponentName} />);
    expect(screen.getByText('expected text')).toBeInTheDocument();
  });
});
```
