import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getNotifications);
router.put('/:id/read', authMiddleware, markAsRead);
router.put('/read-all', authMiddleware, markAllAsRead);
router.delete('/:id', authMiddleware, deleteNotification);

export default router;
