import { ChatRoomType } from '@chat-app/shared/constants/message-types';
import { z } from 'zod';

const ROOM_NAME_MIN_LENGTH = 1;
const ROOM_NAME_MAX_LENGTH = 100;
const MAX_INITIAL_MEMBERS = 100;

const roomName = z
  .string()
  .trim()
  .min(ROOM_NAME_MIN_LENGTH, 'Room name is required')
  .max(ROOM_NAME_MAX_LENGTH, `Room name must be at most ${ROOM_NAME_MAX_LENGTH} characters`);

export const createRoomSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(ChatRoomType.GROUP),
    name: roomName,
    memberIds: z.array(z.string().min(1)).max(MAX_INITIAL_MEMBERS).optional().default([]),
  }),
  z.object({
    type: z.literal(ChatRoomType.DIRECT),
    memberIds: z
      .array(z.string().min(1))
      .length(1, 'A direct room requires exactly one other member'),
  }),
]);
export type CreateRoomInput = z.infer<typeof createRoomSchema>;

export const updateRoomSchema = z.object({
  name: roomName,
});
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;

export const addMemberSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  role: z.enum(['MEMBER', 'ADMIN']).optional().default('MEMBER'),
});
export type AddMemberInput = z.infer<typeof addMemberSchema>;
