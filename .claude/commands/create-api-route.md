Create a new backend API route with controller, service, and validation schema.

Route: $ARGUMENTS

Follow the layered architecture pattern:
1. **Route** (`packages/backend/src/routes/`) — defines endpoints and attaches middleware
2. **Controller** (`packages/backend/src/controllers/`) — handles req/res, calls service
3. **Service** (`packages/backend/src/services/`) — business logic, calls repository
4. **Repository** (`packages/backend/src/repositories/`) — database access via Prisma
5. **Schema** (`packages/backend/src/schemas/`) — Zod validation schema for request body/params

Rules:
- All files kebab-case
- Controllers should NOT contain business logic
- Services should NOT access req/res objects
- Use Zod schemas for request validation middleware
- Add proper error handling with typed errors
- Use async/await — no raw promises
- Add explicit return types on all exported functions

Example controller pattern:
```ts
import { type Request, type Response, type NextFunction } from 'express';
import { messageService } from '../services/message-service';

export const getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { roomId } = req.params;
    const messages = await messageService.getByRoom(roomId);
    res.json({ data: messages });
  } catch (error) {
    next(error);
  }
};
```
