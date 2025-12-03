import { Router } from 'express';
import {
  createPost,
  getAllPosts,
  getPostById,
  getUserPosts,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment
} from '../controllers/postController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';
import { body } from 'express-validator';

const router = Router();

// Validation
const postValidation = [
  body('content').trim().notEmpty().withMessage('Content is required')
    .isLength({ max: 5000 }).withMessage('Content must be less than 5000 characters')
];

const commentValidation = [
  body('content').trim().notEmpty().withMessage('Comment content is required')
    .isLength({ max: 500 }).withMessage('Comment must be less than 500 characters')
];

// Routes
router.post('/', authMiddleware, postValidation, validateRequest, createPost);
router.get('/', authMiddleware, getAllPosts);
router.get('/:id', authMiddleware, getPostById);
router.get('/user/:userId', authMiddleware, getUserPosts);
router.put('/:id', authMiddleware, postValidation, validateRequest, updatePost);
router.delete('/:id', authMiddleware, deletePost);
router.post('/:id/like', authMiddleware, toggleLike);
router.post('/:id/comment', authMiddleware, commentValidation, validateRequest, addComment);
router.delete('/:id/comment/:commentId', authMiddleware, deleteComment);

export default router;
