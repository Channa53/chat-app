import { type UpdateMeInput } from '@/schemas/user-schemas.js';
import * as userService from '@/services/user-service.js';
import { AppError } from '@/utils/app-error.js';
import { asyncHandler } from '@/utils/async-handler.js';

export const getMe = asyncHandler(async (req, res) => {
  if (!req.user) throw AppError.unauthorized('Not authenticated');
  const user = await userService.getById(req.user.id);
  res.json({ data: user });
});

export const updateMe = asyncHandler(async (req, res) => {
  if (!req.user) throw AppError.unauthorized('Not authenticated');
  const user = await userService.updateProfile(req.user.id, req.body as UpdateMeInput);
  res.json({ data: user });
});

export const uploadAvatarHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw AppError.unauthorized('Not authenticated');
  if (!req.file) throw AppError.badRequest('Avatar file is required', 'MISSING_FILE');

  const avatarUrl = `/api/avatars/${req.file.filename}`;
  const user = await userService.setAvatar(req.user.id, avatarUrl);
  res.json({ data: user });
});
