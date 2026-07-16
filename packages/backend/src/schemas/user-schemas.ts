import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_REGEX,
} from '@chat-app/shared/utils/validation';
import { z } from 'zod';

export const updateMeSchema = z
  .object({
    username: z
      .string()
      .min(USERNAME_MIN_LENGTH, `Username must be at least ${USERNAME_MIN_LENGTH} characters`)
      .max(USERNAME_MAX_LENGTH, `Username must be at most ${USERNAME_MAX_LENGTH} characters`)
      .regex(USERNAME_REGEX, 'Username may only contain letters, numbers, dashes, and underscores')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
