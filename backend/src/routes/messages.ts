import { Router } from 'express';
import { body } from 'express-validator';
import { getMessages, sendMessage, markAsRead } from '../controllers/chatController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';

const router = Router();

const messageValidation = [
  body('content').trim().notEmpty().withMessage('Message content is required')
    .isLength({ max: 5000 }).withMessage('Message must be less than 5000 characters'),
  body('type').optional().isIn(['text', 'image', 'file']).withMessage('Invalid message type')
];

router.get('/:chatId', authMiddleware, getMessages);
router.post('/:chatId', authMiddleware, messageValidation, validateRequest, sendMessage);
router.put('/:chatId/read', authMiddleware, markAsRead);

export default router;