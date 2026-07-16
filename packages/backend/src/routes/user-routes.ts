import { Router } from 'express';

import * as userController from '@/controllers/user-controller.js';
import { authenticate } from '@/middleware/authenticate.js';
import { uploadAvatar } from '@/middleware/upload.js';
import { validateBody } from '@/middleware/validate.js';
import { updateMeSchema } from '@/schemas/user-schemas.js';

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.get('/me', userController.getMe);
userRouter.patch('/me', validateBody(updateMeSchema), userController.updateMe);
userRouter.post('/me/avatar', uploadAvatar, userController.uploadAvatarHandler);
