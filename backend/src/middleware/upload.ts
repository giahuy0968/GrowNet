import fs from 'fs';
import path from 'path';
import multer from 'multer';

const ensureDir = (dir: string): string => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const uploadRoot = path.resolve(__dirname, '..', '..', 'uploads');
const chatDir = ensureDir(path.join(uploadRoot, 'chat'));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, chatDir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '';
    cb(null, `${unique}${ext}`);
  }
});

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain'
]);

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const isImage = file.mimetype.startsWith('image/');
  if (isImage || allowedMimeTypes.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'));
  }
};

export const chatAttachmentUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(process.env.CHAT_ATTACHMENT_MAX_BYTES) || 25 * 1024 * 1024
  }
});
