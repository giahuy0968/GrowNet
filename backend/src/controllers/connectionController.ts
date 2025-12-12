import { Response } from 'express';
import Connection from '../models/Connection';
import Notification from '../models/Notification';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';
import { emitToUser } from '../config/socket';

// Send friend request
export const sendRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (userId === req.userId) {
      throw new AppError('Cannot send friend request to yourself', 400);
    }

    // Check if connection already exists
    const existing = await Connection.findOne({
      $or: [
        { userId1: req.userId, userId2: userId },
        { userId1: userId, userId2: req.userId }
      ]
    });

    if (existing) {
      throw new AppError('Connection already exists', 400);
    }

    const [connection, requester] = await Promise.all([
      Connection.create({
        userId1: req.userId,
        userId2: userId,
        status: 'pending'
      }),
      User.findById(req.userId).select('fullName username')
    ]);

    const requesterName = requester?.fullName || requester?.username || 'Someone';
    const notification = await Notification.create({
      userId: userId,
      type: 'connection',
      message: `${requesterName} sent you a connection request`,
      relatedId: connection._id,
      read: false
    });

    emitToUser(userId, 'notification:new', notification.toObject());

    sendSuccess(res, connection, {
      status: 201,
      message: 'Friend request sent successfully'
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Accept friend request
export const acceptRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const connection = await Connection.findOne({
      _id: id,
      userId2: req.userId,
      status: 'pending'
    });

    if (!connection) {
      throw new AppError('Friend request not found', 404);
    }

    connection.status = 'accepted';
    await connection.save();

    sendSuccess(res, connection, { message: 'Friend request accepted' });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Reject friend request
export const rejectRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const connection = await Connection.findOneAndDelete({
      _id: id,
      userId2: req.userId,
      status: 'pending'
    });

    if (!connection) {
      throw new AppError('Friend request not found', 404);
    }

    sendSuccess(res, null, { message: 'Friend request rejected' });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Get friends
export const getFriends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const connections = await Connection.find({
      $or: [{ userId1: req.userId }, { userId2: req.userId }],
      status: 'accepted'
    })
      .populate('userId1', '-password')
      .populate('userId2', '-password');

    const friends = connections.map((conn: any) => {
      return conn.userId1._id.toString() === req.userId ? conn.userId2 : conn.userId1;
    });

    sendSuccess(res, friends, {
      meta: {
        count: friends.length
      }
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Get pending requests
export const getPendingRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await Connection.find({
      userId2: req.userId,
      status: 'pending'
    })
      .populate('userId1', '-password')
      .sort({ createdAt: -1 });

    sendSuccess(res, requests, {
      meta: {
        count: requests.length
      }
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Remove friend
export const removeFriend = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const connection = await Connection.findOneAndDelete({
      $or: [
        { userId1: req.userId, userId2: userId },
        { userId1: userId, userId2: req.userId }
      ],
      status: 'accepted'
    });

    if (!connection) {
      throw new AppError('Friendship not found', 404);
    }

    sendSuccess(res, null, { message: 'Friend removed successfully' });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};
