Create a new React component following project conventions.

Component name: $ARGUMENTS

Rules:
- File name must be kebab-case: `component-name.tsx`
- Place in the appropriate feature folder under `packages/frontend/src/components/`
- Use FC type annotation with explicit Props interface
- Props interface named `${ComponentName}Props`
- No React namespace imports — use `import { type FC } from 'react'`
- Use Tailwind CSS for styling
- Import UI primitives from `@/design-system` (not shadcn directly)

Template:
```tsx
import { type FC } from 'react';

interface ${ComponentName}Props {
  // props here
}

export const ${ComponentName}: FC<${ComponentName}Props> = (props) => {
  return (
    <div>
      {/* implementation */}
    </div>
  );
};
```
