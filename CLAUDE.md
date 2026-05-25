# Chat App - Claude Code Project Guide

## Project Overview

Educational full-stack chat application: React (frontend) + Node.js (backend).
Learning goals: authentication, caching, databases, admin management, real-time communication.

## Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript (strict mode)
- **Build**: Vite
- **State**: Zustand
- **Data Fetching**: TanStack React Query
- **Routing**: React Router DOM
- **UI**: Radix UI + Tailwind CSS (shadcn/ui based design system)
- **Forms**: React Hook Form
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js + TypeScript (strict mode)
- **Framework**: Express.js
- **Database**: PostgreSQL (Prisma ORM)
- **Cache**: Redis
- **Auth**: JWT (access + refresh tokens)
- **Real-time**: Socket.IO
- **Validation**: Zod

### Shared
- **Monorepo**: npm workspaces
- **Testing**: Vitest (unit), Playwright (E2E)
- **Linting**: ESLint flat config
- **Formatting**: Prettier

## Code Conventions

### File Naming
- All files: `kebab-case.ts` / `kebab-case.tsx`
- No `index.ts` barrel files (except design-system)
- Test files: `kebab-case.test.ts`

### TypeScript
- Strict mode enabled everywhere
- Use `type` imports: `import { type FC } from 'react'`
- No `any` — use `unknown` and narrow
- Prefer interfaces over types for object shapes
- Explicit return types on exported functions (backend)

### React Components
- Always use `FC` type annotation
- Props must be interfaces named `ComponentNameProps`
- No React namespace — destructure imports
- Functional components only — no class components

```tsx
import { type FC } from 'react';

interface MessageBubbleProps {
  content: string;
  sender: string;
  timestamp: Date;
}

export const MessageBubble: FC<MessageBubbleProps> = ({ content, sender, timestamp }) => {
  return (/* JSX */);
};
```

### Backend Patterns
- Controllers handle HTTP req/res only
- Services contain business logic
- Repositories handle database queries
- Middleware for cross-cutting concerns (auth, logging, validation)
- Zod schemas for request validation

### Naming
- Components: `PascalCase`
- Files: `kebab-case`
- Variables/functions: `camelCase`
- Constants: `UPPER_CASE`
- Types/Interfaces: `PascalCase`
- Database tables: `snake_case`
- API routes: `kebab-case` (`/api/chat-rooms`)

### Formatting (Prettier)
- Semicolons: yes
- Quotes: single
- Tab width: 2 spaces
- Print width: 120
- Trailing commas: es5
- Arrow parens: always

### Import Order
1. Node built-ins
2. External packages
3. Internal aliases (`@/`)
4. Relative imports
5. Type-only imports last

### Project Structure

```
chat-app/
├── packages/
│   ├── frontend/           # React SPA
│   │   ├── src/
│   │   │   ├── components/ # Feature-based folders
│   │   │   ├── design-system/
│   │   │   ├── hooks/
│   │   │   ├── services/   # API service functions
│   │   │   ├── stores/     # Zustand stores
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── main.tsx
│   │   └── package.json
│   ├── backend/            # Express API
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   ├── schemas/    # Zod validation schemas
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   ├── socket/     # Socket.IO handlers
│   │   │   ├── prisma/     # Prisma schema & migrations
│   │   │   └── server.ts
│   │   └── package.json
│   └── shared/             # Shared types & utilities
│       ├── src/
│       │   ├── types/
│       │   └── utils/
│       └── package.json
├── package.json            # Root workspace config
├── tsconfig.base.json
├── .prettierrc
├── eslint.config.js
└── CLAUDE.md
```

## Common Commands

```bash
# Development
npm run dev                  # Start all packages
npm run dev:frontend         # Start frontend only
npm run dev:backend          # Start backend only

# Database
npx prisma migrate dev       # Run migrations
npx prisma studio            # Open Prisma Studio
npx prisma generate          # Generate Prisma client

# Testing
npm run test                 # Run all tests
npm run test:frontend        # Frontend unit tests
npm run test:backend         # Backend unit tests
npm run test:e2e             # E2E tests

# Linting & Formatting
npm run lint                 # Lint all packages
npm run format               # Format all files
npm run typecheck            # TypeScript check
```
