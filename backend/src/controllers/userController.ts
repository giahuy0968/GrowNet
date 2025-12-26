import { Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Connection from '../models/Connection';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';

// Get user by ID
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    sendSuccess(res, user);
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Search users
export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q, interests, location } = req.query;
    const query: any = {};

    if (req.userId) {
      query._id = { $ne: req.userId };
    }

    if (q) {
      query.$or = [
        { username: { $regex: q, $options: 'i' } },
        { fullName: { $regex: q, $options: 'i' } }
      ];
    }

    if (interests) {
      const interestsArray = (interests as string).split(',');
      query.interests = { $in: interestsArray };
    }

    if (location) {
      query['location.city'] = { $regex: location, $options: 'i' };
    }

    const users = await User.find(query)
      .select('-password')
      .limit(20)
      .sort({ createdAt: -1 });

    sendSuccess(res, users, {
      meta: {
        count: users.length
      }
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Get suggested users (based on interests)
export const getSuggestedUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const currentUser = await User.findById(req.userId);

    if (!currentUser) {
      throw new AppError('User not found', 404);
    }

    const connections = await Connection.find({
      status: 'accepted',
      $or: [{ userId1: req.userId }, { userId2: req.userId }]
    }).select('userId1 userId2');

    const excludedIds = new Set<string>([req.userId]);
    connections.forEach(conn => {
      excludedIds.add(conn.userId1.toString());
      excludedIds.add(conn.userId2.toString());
    });

    const excludedObjectIds = Array.from(excludedIds).map(id => new mongoose.Types.ObjectId(id));
    const interestFilter = currentUser.interests?.length
      ? { $in: currentUser.interests }
      : { $exists: true };

    // Get users with similar interests
    const suggested = await User.find({
      _id: { $nin: excludedObjectIds },
      interests: interestFilter
    })
      .select('-password')
      .limit(10)
      .sort({ lastActive: -1 });

    sendSuccess(res, suggested);
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Get user stats
export const getUserStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [connectionCount, postCount] = await Promise.all([
      Connection.countDocuments({
        $or: [{ userId1: id }, { userId2: id }],
        status: 'accepted'
      }),
      // Will add Post count when Post controller is created
      Promise.resolve(0)
    ]);

    sendSuccess(res, {
      connections: connectionCount,
      posts: postCount
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};
