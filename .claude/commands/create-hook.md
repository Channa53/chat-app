Create a custom React hook following project conventions.

Hook name: $ARGUMENTS

Rules:
- File goes in `packages/frontend/src/hooks/`
- File name: `use-${hook-name}.ts` (kebab-case with use- prefix)
- Export function named `use${HookName}`
- Must start with `use` prefix
- Add explicit return type
- For data-fetching hooks, use TanStack React Query
- Keep hooks focused — one responsibility per hook

Data-fetching hook template:
```ts
import { useQuery } from '@tanstack/react-query';
import { type UseQueryResult } from '@tanstack/react-query';

interface Use${HookName}Result {
  // return type
}

export const use${HookName} = (params: ${HookName}Params): UseQueryResult<Use${HookName}Result> => {
  return useQuery({
    queryKey: ['${hookName}', params],
    queryFn: () => fetchData(params),
  });
};
```

State/logic hook template:
```ts
import { useState, useCallback } from 'react';

interface Use${HookName}Return {
  // return type
}

export const use${HookName} = (): Use${HookName}Return => {
  // implementation
};
```
