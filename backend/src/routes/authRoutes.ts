import { Router } from 'express';
import { register, login, getCurrentUser, updateProfile, changePassword, getCaptcha } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';
import { body } from 'express-validator';

const router = Router();

// Registration validation
const registerValidation = [
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
  body('email').trim().isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').trim().notEmpty().withMessage('Full name is required')
];

// Login validation
const loginValidation = [
  body('email').trim().isEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

// Update profile validation
const updateProfileValidation = [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('age').optional().isInt({ min: 13, max: 120 }).withMessage('Invalid age'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender')
];

// Change password validation
const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

// Routes
router.get('/captcha', getCaptcha);
router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.get('/me', authMiddleware, getCurrentUser);
router.put('/profile', authMiddleware, updateProfileValidation, validateRequest, updateProfile);
router.put('/password', authMiddleware, changePasswordValidation, validateRequest, changePassword);

export default router;
