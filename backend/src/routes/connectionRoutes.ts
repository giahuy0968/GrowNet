import { Router } from 'express';
import {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getFriends,
  getPendingRequests,
  removeFriend
} from '../controllers/connectionController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/request/:userId', authMiddleware, sendRequest);
router.put('/accept/:id', authMiddleware, acceptRequest);
router.delete('/reject/:id', authMiddleware, rejectRequest);
router.get('/friends', authMiddleware, getFriends);
router.get('/pending', authMiddleware, getPendingRequests);
router.delete('/remove/:userId', authMiddleware, removeFriend);

export default router;
