import { Router } from 'express';
import { body, param } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import { requireRoles } from '../middleware/roles';
import { validateRequest } from '../middleware/validator';
import {
  issueCertificate,
  listMentorCertificates,
  listMenteeCertificates,
  getCertificateById
} from '../controllers/certificateController';

const router = Router();

router.post(
  '/',
  authMiddleware,
  requireRoles('mentor', 'admin'),
  [
    body('courseId').notEmpty().withMessage('courseId là bắt buộc'),
    body('summary').isLength({ min: 20 }).withMessage('summary quá ngắn'),
    body('skills').isArray({ min: 1 }).withMessage('skills cần ít nhất 1 mục'),
    body('menteeId').optional().isMongoId().withMessage('menteeId không hợp lệ'),
    body('menteeEmail').optional().isEmail().withMessage('Email mentee không hợp lệ')
  ],
  validateRequest,
  issueCertificate
);

router.get('/mentor/me', authMiddleware, requireRoles('mentor', 'admin'), listMentorCertificates);
router.get('/me', authMiddleware, listMenteeCertificates);
router.get(
  '/:id',
  authMiddleware,
  [param('id').isMongoId().withMessage('certificateId không hợp lệ')],
  validateRequest,
  getCertificateById
);

export default router;
