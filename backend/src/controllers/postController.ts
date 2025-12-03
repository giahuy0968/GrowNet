import { Response } from 'express';
import Post from '../models/Post';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

// Create post
export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, images } = req.body;

    const post = await Post.create({
      authorId: req.userId,
      content,
      images: images || [],
      likes: [],
      comments: []
    });

    const populatedPost = await Post.findById(post._id).populate('authorId', '-password');

    res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Get all posts (feed)
export const getAllPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const posts = await Post.find()
      .populate('authorId', '-password')
      .populate('comments.userId', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Post.countDocuments();

    res.json({
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Get post by ID
export const getPostById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate('authorId', '-password')
      .populate('comments.userId', 'username fullName avatar');

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    res.json({ post });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Get user posts
export const getUserPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({ authorId: userId })
      .populate('authorId', '-password')
      .populate('comments.userId', 'username fullName avatar')
      .sort({ createdAt: -1 });

    res.json({ posts, count: posts.length });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Update post
export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content, images } = req.body;

    const post = await Post.findOne({ _id: id, authorId: req.userId });

    if (!post) {
      throw new AppError('Post not found or unauthorized', 404);
    }

    post.content = content;
    post.images = images || post.images;
    await post.save();

    const updatedPost = await Post.findById(id).populate('authorId', '-password');

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Delete post
export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const post = await Post.findOneAndDelete({ _id: id, authorId: req.userId });

    if (!post) {
      throw new AppError('Post not found or unauthorized', 404);
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Like/Unlike post
export const toggleLike = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    const userIdObj = req.userId as any;
    const likeIndex = post.likes.findIndex((like: any) => like.toString() === userIdObj);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(userIdObj);

      // Create notification
      if (post.authorId.toString() !== userIdObj) {
        await Notification.create({
          userId: post.authorId,
          type: 'like',
          message: 'liked your post',
          relatedId: post._id,
          read: false
        });
      }
    }

    await post.save();

    res.json({
      message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
      likes: post.likes.length
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Add comment
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const post = await Post.findById(id);

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    post.comments.push({
      userId: req.userId as any,
      content,
      createdAt: new Date()
    });

    await post.save();

    // Create notification
    if (post.authorId.toString() !== req.userId) {
      await Notification.create({
        userId: post.authorId,
        type: 'comment',
        message: 'commented on your post',
        relatedId: post._id,
        read: false
      });
    }

    const updatedPost = await Post.findById(id)
      .populate('authorId', '-password')
      .populate('comments.userId', 'username fullName avatar');

    res.status(201).json({
      message: 'Comment added successfully',
      post: updatedPost
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Delete comment
export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, commentId } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    const commentIndex = post.comments.findIndex(
      (c: any) => c._id?.toString() === commentId && c.userId.toString() === req.userId
    );

    if (commentIndex === -1) {
      throw new AppError('Comment not found or unauthorized', 404);
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};
