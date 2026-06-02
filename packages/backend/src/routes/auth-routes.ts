import { Router } from 'express';

import * as authController from '@/controllers/auth-controller.js';
import { validateBody } from '@/middleware/validate.js';
import { loginSchema, refreshSchema, registerSchema } from '@/schemas/auth-schemas.js';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), authController.register);
authRouter.post('/login', validateBody(loginSchema), authController.login);
authRouter.post('/refresh', validateBody(refreshSchema), authController.refresh);
authRouter.post('/logout', validateBody(refreshSchema), authController.logout);
