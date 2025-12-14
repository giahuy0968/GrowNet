import { Router } from 'express';
import {
  listAdminUsers,
  updateUserRole,
  updateAccountStatus,
  updateProfileModeration,
  resetUserPassword,
  deleteUser
} from '../controllers/adminUserController';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.get('/users', authMiddleware, requireRole(['admin', 'moderator']), listAdminUsers);
router.patch('/users/:id/role', authMiddleware, requireRole(['admin']), updateUserRole);
router.patch('/users/:id/status', authMiddleware, requireRole(['admin', 'moderator']), updateAccountStatus);
router.patch('/users/:id/profile-review', authMiddleware, requireRole(['admin', 'moderator']), updateProfileModeration);
router.post('/users/:id/reset-password', authMiddleware, requireRole(['admin']), resetUserPassword);
router.delete('/users/:id', authMiddleware, requireRole(['admin']), deleteUser);

export default router;
