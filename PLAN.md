# Chat App — Development Plan

## Learning Goals

| Topic | Where You'll Learn It |
|---|---|
| Authentication | Phase 2 — JWT, refresh tokens, password hashing, protected routes |
| Databases | Phase 1 & 3 — PostgreSQL, Prisma ORM, migrations, relations |
| Caching | Phase 5 — Redis for sessions, message cache, online presence |
| Real-time | Phase 4 — Socket.IO, WebSocket rooms, typing indicators |
| Admin & User Management | Phase 6 — Roles, permissions, user CRUD, admin dashboard |

---

## Phase 1 — Project Scaffolding & Database

> Set up the monorepo, tooling, and core database schema.

### 1.1 Initialize monorepo
- [ ] Create root `package.json` with npm workspaces (`packages/*`)
- [ ] Create `packages/frontend`, `packages/backend`, `packages/shared`
- [ ] Add root `tsconfig.base.json` with strict mode, path aliases
- [ ] Add `.prettierrc` (single quotes, semicolons, 120 width, 2-space indent)
- [ ] Add `eslint.config.js` (flat config, typescript-eslint, import ordering)
- [ ] Add `.gitignore` (node_modules, dist, .env, prisma generated)

### 1.2 Backend skeleton
- [ ] Init `packages/backend/package.json` with Express, TypeScript, ts-node-dev
- [ ] Create `src/server.ts` — Express app with JSON parsing, CORS, error handler
- [ ] Set up folder structure: controllers/, services/, repositories/, middleware/, routes/, schemas/, types/, utils/
- [ ] Add health check route `GET /api/health`
- [ ] Add global error handling middleware with typed AppError class
- [ ] Add request logger middleware (morgan or custom)

### 1.3 Database setup with Prisma
- [ ] Install Prisma, initialize with PostgreSQL provider
- [ ] Create initial schema: `User` model (id, email, username, passwordHash, role, avatar, createdAt, updatedAt)
- [ ] Create `ChatRoom` model (id, name, type [direct/group], createdAt)
- [ ] Create `Message` model (id, content, senderId, roomId, createdAt, editedAt, deletedAt)
- [ ] Create `ChatRoomMember` join table (userId, roomId, joinedAt, role)
- [ ] Run first migration
- [ ] Create seed script with test users

### 1.4 Frontend skeleton
- [ ] Init Vite + React + TypeScript project in `packages/frontend`
- [ ] Configure path aliases (`@/` → `src/`)
- [ ] Install Tailwind CSS 4, Radix UI, Lucide icons
- [ ] Set up base design-system folder with theme tokens
- [ ] Create app shell: Layout component with sidebar + main area
- [ ] Add React Router with placeholder routes: `/login`, `/register`, `/chat`, `/admin`
- [ ] Install Zustand, TanStack React Query, React Hook Form

### 1.5 Shared package
- [ ] Create `packages/shared/package.json`
- [ ] Add shared TypeScript types: User, Message, ChatRoom, ApiResponse
- [ ] Add shared constants: roles enum, message types enum
- [ ] Add shared validation utils (email regex, password rules)

---

## Phase 2 — Authentication

> Implement JWT-based auth with access/refresh tokens, password hashing, protected routes.

### 2.1 Backend auth infrastructure
- [ ] Install bcrypt, jsonwebtoken, zod
- [ ] Create auth schemas: `registerSchema`, `loginSchema` (Zod)
- [ ] Create `auth-service.ts` — register (hash password, create user), login (verify password, issue tokens)
- [ ] Implement JWT helpers: `generateAccessToken` (15min), `generateRefreshToken` (7d), `verifyToken`
- [ ] Store refresh tokens in database (new `RefreshToken` model with userId, token, expiresAt, revokedAt)

### 2.2 Auth routes & middleware
- [ ] `POST /api/auth/register` — validate, create user, return tokens
- [ ] `POST /api/auth/login` — validate credentials, return tokens
- [ ] `POST /api/auth/refresh` — validate refresh token, rotate tokens
- [ ] `POST /api/auth/logout` — revoke refresh token
- [ ] Create `authenticate` middleware — verify access token, attach `req.user`
- [ ] Create `authorize(...roles)` middleware — check user role

### 2.3 Frontend auth flow
- [ ] Create auth store (`useAuthStore`) — user, tokens, isAuthenticated, login/logout/refresh actions
- [ ] Build Login page — form with email + password, validation, error display
- [ ] Build Register page — form with username + email + password + confirm password
- [ ] Create `api-client.ts` — Axios/fetch wrapper with token interceptor (auto-attach Authorization header)
- [ ] Implement token refresh interceptor — on 401, try refresh, retry request
- [ ] Create `ProtectedRoute` component — redirect to login if not authenticated
- [ ] Create `AuthProvider` — check stored tokens on app load, refresh if needed

### 2.4 User profile
- [ ] `GET /api/users/me` — return current user profile
- [ ] `PATCH /api/users/me` — update username, avatar
- [ ] Build profile settings page in frontend
- [ ] Add avatar upload (local file storage for now)

---

## Phase 3 — Chat Rooms & Messages (REST)

> CRUD for chat rooms and messages via REST API before adding real-time.

#
- [ ] `P## 3.1 Chat room endpointsOST /api/rooms` — create a new room (group or direct)
- [ ] `GET /api/rooms` — list rooms for current user
- [ ] `GET /api/rooms/:id` — get room details + members
- [ ] `PATCH /api/rooms/:id` — update room name (group only, by admin/owner)
- [ ] `POST /api/rooms/:id/members` — add member to room
- [ ] `DELETE /api/rooms/:id/members/:userId` — remove member
- [ ] Add Prisma queries in room repository with pagination

### 3.2 Message endpoints
- [ ] `POST /api/rooms/:roomId/messages` — send a message
- [ ] `GET /api/rooms/:roomId/messages` — list messages with cursor-based pagination
- [ ] `PATCH /api/messages/:id` — edit own message
- [ ] `DELETE /api/messages/:id` — soft-delete own message
- [ ] Add message service with authorization checks (room membership)

### 3.3 Frontend chat UI
- [ ] Build room list sidebar component (shows rooms, unread counts placeholder)
- [ ] Build message list component with infinite scroll (TanStack Query + cursor pagination)
- [ ] Build message input component with React Hook Form
- [ ] Build message bubble component (own vs others, timestamps, edited indicator)
- [ ] Build create room modal — room name, select members
- [ ] Wire up API calls with TanStack React Query (queries + mutations)
- [ ] Add optimistic updates for sending messages

---

## Phase 4 — Real-Time with Socket.IO

> Add WebSocket layer for live messaging, typing indicators, and online presence.

### 4.1 Socket.IO server setup
- [ ] Install socket.io, integrate with Express HTTP server
- [ ] Create socket authentication middleware — verify JWT on connection
- [ ] Create `socket/` folder: connection-handler, room-handler, message-handler
- [ ] Implement room join/leave on socket connection (user's rooms)
- [ ] Handle disconnect — clean up presence

### 4.2 Real-time messaging
- [ ] Emit `message:new` when a message is created (to room)
- [ ] Emit `message:edited` when a message is updated
- [ ] Emit `message:deleted` when a message is soft-deleted
- [ ] Frontend: listen for message events, update React Query cache in real-time
- [ ] Handle reconnection — re-join rooms, fetch missed messages

### 4.3 Typing indicators
- [ ] Client emits `typing:start` and `typing:stop` events
- [ ] Server broadcasts to room (exclude sender)
- [ ] Frontend: show "User is typing..." with debounce/timeout
- [ ] Auto-stop typing after 3 seconds of inactivity

### 4.4 Online presence
- [ ] Track connected users in memory (Map of userId → socketId)
- [ ] Emit `presence:online` / `presence:offline` events
- [ ] Frontend: show online/offline indicator on user avatars
- [ ] Show "last seen" timestamp for offline users

---

## Phase 5 — Caching with Redis

> Add Redis for session management, message caching, and rate limiting.

### 5.1 Redis setup
- [ ] Install ioredis, configure connection
- [ ] Create `redis-client.ts` with connection handling and error logging
- [ ] Create `cache-service.ts` with get/set/delete/invalidate helpers
- [ ] Add TTL-based caching pattern with JSON serialization

### 5.2 Cache chat data
- [ ] Cache recent messages per room (last 50, invalidate on new message)
- [ ] Cache room member lists (invalidate on member add/remove)
- [ ] Cache user profiles (invalidate on profile update)
- [ ] Add cache-aside pattern: check cache → miss → fetch DB → populate cache
- [ ] Add cache invalidation on write operations

### 5.3 Online presence with Redis
- [ ] Move presence tracking from in-memory Map to Redis Sets
- [ ] `SADD online:users {userId}` on connect
- [ ] `SREM online:users {userId}` on disconnect
- [ ] `SISMEMBER` to check if user is online
- [ ] Support multiple server instances (Redis pub/sub for Socket.IO)

### 5.4 Rate limiting
- [ ] Create rate limit middleware using Redis (sliding window)
- [ ] Apply to auth routes: 5 login attempts per minute
- [ ] Apply to message sending: 30 messages per minute
- [ ] Return `429 Too Many Requests` with retry-after header

---

## Phase 6 — Admin & User Management

> Role-based access control, admin dashboard, and user management.

### 6.1 Role system
- [ ] Define roles: `user`, `moderator`, `admin`
- [ ] Update User model with role field (default: `user`)
- [ ] Create `authorize` middleware — check role hierarchy
- [ ] Create room-level roles: `member`, `admin`, `owner`
- [ ] Add role checks to room operations (who can kick, edit name, etc.)

### 6.2 Admin API endpoints
- [ ] `GET /api/admin/users` — list all users with search/filter/pagination
- [ ] `PATCH /api/admin/users/:id` — update user role, ban/unban
- [ ] `DELETE /api/admin/users/:id` — soft-delete user
- [ ] `GET /api/admin/stats` — active users, message count, room count
- [ ] `GET /api/admin/rooms` — list all rooms with member counts
- [ ] `DELETE /api/admin/rooms/:id` — delete a room
- [ ] `DELETE /api/admin/messages/:id` — remove any message (moderation)

### 6.3 Admin dashboard frontend
- [ ] Build admin layout with navigation: Users, Rooms, Stats
- [ ] Build users table — search, filter by role, sort, pagination
- [ ] Build user detail view — edit role, view activity, ban toggle
- [ ] Build rooms management table — member counts, creation date, delete
- [ ] Build stats dashboard — cards with counts, simple charts (message volume over time)
- [ ] Add `admin` route guard — redirect non-admin users

---

## Phase 7 — Polish & Advanced Features

> Final touches, security hardening, and nice-to-have features.

### 7.1 Security hardening
- [ ] Add helmet.js for HTTP security headers
- [ ] Add CORS configuration (whitelist frontend origin)
- [ ] Sanitize user input (prevent XSS in messages)
- [ ] Add request size limits
- [ ] Add CSRF protection for cookie-based auth (if used)
- [ ] Audit npm dependencies

### 7.2 File uploads
- [ ] Add multer for file upload handling
- [ ] Support image/file attachments in messages
- [ ] Store files locally (or S3 for production)
- [ ] Add file type validation and size limits
- [ ] Show image previews in chat

### 7.3 Notifications
- [ ] Track unread message count per room per user (Redis)
- [ ] Emit `notification:unread` socket event
- [ ] Frontend: show badge counts on room list
- [ ] Add browser notification API (with permission request)

### 7.4 Message features
- [ ] Add message reactions (emoji reactions model + UI)
- [ ] Add reply/thread support (parentMessageId)
- [ ] Add message search endpoint with full-text search
- [ ] Add "seen by" read receipts

### 7.5 Testing
- [ ] Write unit tests for auth service (register, login, token refresh)
- [ ] Write unit tests for message service (CRUD, authorization)
- [ ] Write integration tests for API routes
- [ ] Write E2E tests: register → login → create room → send message
- [ ] Set up CI pipeline (GitHub Actions)

---

## Phase Summary

| Phase | Focus | Key Learning |
|---|---|---|
| 1 | Scaffolding & DB | Monorepo, Prisma, project structure |
| 2 | Authentication | JWT, bcrypt, protected routes, token refresh |
| 3 | Chat REST API | CRUD, pagination, optimistic updates, React Query |
| 4 | Real-Time | Socket.IO, WebSocket rooms, event-driven architecture |
| 5 | Caching | Redis, cache-aside pattern, rate limiting, pub/sub |
| 6 | Admin Panel | RBAC, admin dashboard, user management |
| 7 | Polish | Security, file uploads, notifications, testing |
