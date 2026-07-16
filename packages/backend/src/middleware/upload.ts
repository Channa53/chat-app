import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

import multer from 'multer';

import { AppError } from '@/utils/app-error.js';

export const UPLOADS_ROOT = path.resolve(process.cwd(), 'uploads');
const AVATAR_DIR = path.join(UPLOADS_ROOT, 'avatars');

if (!existsSync(AVATAR_DIR)) {
  mkdirSync(AVATAR_DIR, { recursive: true });
}

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 2 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, AVATAR_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 8) || '.bin';
    const userId = req.user?.id ?? 'anon';
    cb(null, `${userId}-${Date.now()}${ext}`);
  },
});

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(AppError.badRequest('Only JPEG, PNG, or WebP images are allowed', 'INVALID_FILE_TYPE'));
      return;
    }
    cb(null, true);
  },
}).single('avatar');
