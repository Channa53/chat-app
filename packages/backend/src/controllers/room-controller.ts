import { type Request } from 'express';

import { type AddMemberInput, type CreateRoomInput, type UpdateRoomInput } from '@/schemas/room-schemas.js';
import * as roomService from '@/services/room-service.js';
import { AppError } from '@/utils/app-error.js';
import { asyncHandler } from '@/utils/async-handler.js';

function requireParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string' || value.length === 0) {
    throw AppError.badRequest(`Missing route parameter: ${name}`, 'MISSING_PARAM');
  }
  return value;
}

export const createRoom = asyncHandler(async (req, res) => {
  if (!req.user) throw AppError.unauthorized('Not authenticated');
  const room = await roomService.createRoom(req.user.id, req.body as CreateRoomInput);
  res.status(201).json({ data: room });
});

export const listRooms = asyncHandler(async (req, res) => {
  if (!req.user) throw AppError.unauthorized('Not authenticated');

  const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
  const limitRaw = typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined;
  const limit = limitRaw !== undefined && Number.isFinite(limitRaw) ? limitRaw : undefined;

  const result = await roomService.listRooms(req.user.id, { cursor, limit });
  res.json({ data: result.items, meta: { nextCursor: result.nextCursor } });
});

export const getRoom = asyncHandler(async (req, res) => {
  if (!req.user) throw AppError.unauthorized('Not authenticated');
  const room = await roomService.getRoom(req.user.id, requireParam(req, 'id'));
  res.json({ data: room });
});

export const updateRoom = asyncHandler(async (req, res) => {
  if (!req.user) throw AppError.unauthorized('Not authenticated');
  const { name } = req.body as UpdateRoomInput;
  const room = await roomService.updateRoom(req.user.id, requireParam(req, 'id'), name);
  res.json({ data: room });
});

export const addMember = asyncHandler(async (req, res) => {
  if (!req.user) throw AppError.unauthorized('Not authenticated');
  const room = await roomService.addMember(req.user.id, requireParam(req, 'id'), req.body as AddMemberInput);
  res.status(201).json({ data: room });
});

export const removeMember = asyncHandler(async (req, res) => {
  if (!req.user) throw AppError.unauthorized('Not authenticated');
  const room = await roomService.removeMember(
    req.user.id,
    requireParam(req, 'id'),
    requireParam(req, 'userId')
  );
  res.json({ data: room });
});
