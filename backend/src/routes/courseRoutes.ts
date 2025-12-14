import { Router } from 'express';
import { body, param } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import { requireRoles } from '../middleware/roles';
import { validateRequest } from '../middleware/validator';
import {
  createCourse,
  getCourseById,
  listCourses,
  listMentorCourses
} from '../controllers/courseController';

const router = Router();

router.get('/', authMiddleware, listCourses);
router.get('/mentor/me', authMiddleware, requireRoles('mentor', 'admin'), listMentorCourses);
router.get(
  '/:id',
  authMiddleware,
  [param('id').isMongoId().withMessage('courseId không hợp lệ')],
  validateRequest,
  getCourseById
);

router.post(
  '/',
  authMiddleware,
  requireRoles('mentor', 'admin'),
  [
    body('title').notEmpty().withMessage('Vui lòng nhập tiêu đề'),
    body('description').isLength({ min: 60 }).withMessage('Mô tả cần ít nhất 60 ký tự'),
    body('modules').isArray({ min: 1 }).withMessage('Cần có ít nhất 1 module'),
    body('modules.*.title').notEmpty().withMessage('Module cần tiêu đề'),
    body('modules.*.content').notEmpty().withMessage('Module cần nội dung')
  ],
  validateRequest,
  createCourse
);

export default router;
