import { type LoginInput, type RefreshInput, type RegisterInput } from '@/schemas/auth-schemas.js';
import * as authService from '@/services/auth-service.js';
import { asyncHandler } from '@/utils/async-handler.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body as RegisterInput);
  res.status(201).json({ data: result });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body as LoginInput);
  res.json({ data: result });
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body as RefreshInput;
  const tokens = await authService.refresh(refreshToken);
  res.json({ data: tokens });
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body as RefreshInput;
  await authService.logout(refreshToken);
  res.status(204).end();
});
