import { Router } from 'express';
import { body, param } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';
import {
  createMeeting,
  createInstantMeeting,
  getMeetingsByChat,
  getUserMeetings,
  deleteMeeting
} from '../controllers/meetingController';

const router = Router();

const scheduleValidation = [
  body('chatId').notEmpty().withMessage('chatId is required'),
  body('title').notEmpty().withMessage('title is required'),
  body('startTime').notEmpty().withMessage('startTime is required'),
  body('endTime').notEmpty().withMessage('endTime is required')
];

router.post('/', authMiddleware, scheduleValidation, validateRequest, createMeeting);
router.post('/instant', authMiddleware, [
  body('chatId').notEmpty().withMessage('chatId is required')
], validateRequest, createInstantMeeting);
router.get('/me', authMiddleware, getUserMeetings);
router.get('/chat/:chatId', authMiddleware, [
  param('chatId').notEmpty().withMessage('chatId is required')
], validateRequest, getMeetingsByChat);
router.delete('/:meetingId', authMiddleware, [
  param('meetingId').notEmpty().withMessage('meetingId is required')
], validateRequest, deleteMeeting);

export default router;
