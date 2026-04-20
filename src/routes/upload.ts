import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Разрешены только изображения: JPEG, PNG, GIF, WebP'));
    }
  },
});

// POST /api/upload/image — загрузка изображения (авторизация обязательна)
router.post(
  '/image',
  authenticate,
  (req, res, next) => {
    upload.single('file')(req, res, (err: unknown) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Файл не более 5 МБ' });
          }
        }
        return next(err);
      }
      next();
    });
  },
  (req: AuthRequest, res) => {
    const file = (req as AuthRequest & { file?: Express.Multer.File }).file;
    if (!file) {
      return res.status(400).json({ error: 'Файл не выбран' });
    }
    const envBaseUrl = process.env.BASE_URL?.trim().replace(/\/$/, '');
    const forwardedProto = (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim();
    const forwardedHost = (req.headers['x-forwarded-host'] as string | undefined)?.split(',')[0]?.trim();
    const forwardedPrefix = (req.headers['x-forwarded-prefix'] as string | undefined)?.trim().replace(/\/$/, '');
    const proto = forwardedProto || req.protocol;
    const host = forwardedHost || req.get('host');
    const prefix = forwardedPrefix || '';
    const derivedBase = host ? `${proto}://${host}${prefix}` : '';
    const baseUrl = envBaseUrl || derivedBase;
    const uploadsPath = `/news/uploads/${file.filename}`;
    const url = baseUrl ? `${baseUrl}${uploadsPath}` : uploadsPath;
    res.status(201).json({ url });
  }
);

export default router;
