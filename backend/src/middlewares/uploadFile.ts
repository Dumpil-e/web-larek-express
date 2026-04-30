import multer from 'multer';
import fs from 'fs';
import path from 'path';
import type { Request } from 'express';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(process.cwd(), 'src', 'public', 'temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (
  _req: Request,
  file: { mimetype: string },
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  const isValid = allowed.includes(file.mimetype);
  cb(isValid ? null : new Error('Допустимы только изображения: JPEG, PNG, WebP, SVG'), isValid);
};

export default multer({
  storage,
  fileFilter: fileFilter as multer.Options['fileFilter'],
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('file');
