import { Router } from 'express';
import {
  getOrCreateChat,
  getAllChats,
  getMessages,
  sendMessage,
  sendAttachmentMessage,
  markAsRead
} from '../controllers/chatController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';
import { body } from 'express-validator';
import { chatAttachmentUpload } from '../middleware/upload';

const router = Router();

// Validation
const messageValidation = [
  body('content').trim().notEmpty().withMessage('Message content is required')
    .isLength({ max: 5000 }).withMessage('Message must be less than 5000 characters'),
  body('type').optional().isIn(['text', 'image', 'file']).withMessage('Invalid message type')
];

// Routes
router.get('/', authMiddleware, getAllChats);
router.get('/with/:userId', authMiddleware, getOrCreateChat);
router.get('/:chatId/messages', authMiddleware, getMessages);
router.post('/:chatId/messages', authMiddleware, messageValidation, validateRequest, sendMessage);
router.post('/:chatId/attachments', authMiddleware, chatAttachmentUpload.single('file'), sendAttachmentMessage);
router.put('/:chatId/read', authMiddleware, markAsRead);

export default router;
