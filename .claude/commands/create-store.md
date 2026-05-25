Create a new Zustand store following project conventions.

Store name: $ARGUMENTS

Rules:
- File goes in `packages/frontend/src/stores/`
- File name: `use-${store-name}-store.ts` (kebab-case with use- prefix)
- Export a custom hook named `use${StoreName}Store`
- Use TypeScript interface for the store state
- Separate state from actions in the interface
- Use immer middleware for nested state updates if needed
- Use devtools middleware in development

Template:
```ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ${StoreName}State {
  // state properties
}

interface ${StoreName}Actions {
  // action methods
}

type ${StoreName}Store = ${StoreName}State & ${StoreName}Actions;

export const use${StoreName}Store = create<${StoreName}Store>()(
  devtools(
    (set, get) => ({
      // initial state

      // actions
    }),
    { name: '${storeName}Store' }
  )
);
```
