import { Router } from 'express';
import {
  getUserById,
  searchUsers,
  getSuggestedUsers,
  getUserStats
} from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/search', authMiddleware, searchUsers);
router.get('/suggested', authMiddleware, getSuggestedUsers);
router.get('/:id', authMiddleware, getUserById);
router.get('/:id/stats', authMiddleware, getUserStats);

export default router;
