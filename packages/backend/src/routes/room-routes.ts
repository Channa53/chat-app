import { Router } from 'express';

import * as roomController from '@/controllers/room-controller.js';
import { authenticate } from '@/middleware/authenticate.js';
import { validateBody } from '@/middleware/validate.js';
import { addMemberSchema, createRoomSchema, updateRoomSchema } from '@/schemas/room-schemas.js';

export const roomRouter = Router();

roomRouter.use(authenticate);

roomRouter.post('/', validateBody(createRoomSchema), roomController.createRoom);
roomRouter.get('/', roomController.listRooms);
roomRouter.get('/:id', roomController.getRoom);
roomRouter.patch('/:id', validateBody(updateRoomSchema), roomController.updateRoom);
roomRouter.post('/:id/members', validateBody(addMemberSchema), roomController.addMember);
roomRouter.delete('/:id/members/:userId', roomController.removeMember);
