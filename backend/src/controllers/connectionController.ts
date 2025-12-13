import { Response } from 'express';
import mongoose from 'mongoose';
import Connection from '../models/Connection';
import Notification from '../models/Notification';
import User from '../models/User';
import Chat from '../models/Chat';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';
import { emitToUser } from '../config/socket';

const populateConnection = async (connection: any) => connection.populate([
  { path: 'userId1', select: '-password' },
  { path: 'userId2', select: '-password' }
]);

const getOrCreatePrivateChat = async (userA: string, userB: string) => {
  const participants = [userA, userB].map((id) => new mongoose.Types.ObjectId(id));

  let chat = await Chat.findOne({
    type: 'private',
    participants: { $all: participants }
  }).populate('participants', '-password');

  if (!chat) {
    const created = await Chat.create({
      type: 'private',
      participants
    });
    chat = await Chat.findById(created._id).populate('participants', '-password');
  }

  return chat!;
};

const emitChatRefresh = (chatId: string, userIds: string[]) => {
  userIds.forEach(userId => emitToUser(userId, 'chat:updated', { chatId }));
};

// Send friend request
export const sendRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!req.userId) {
      throw new AppError('Unauthorized', 401);
    }

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
      if (existing.status === 'accepted') {
        throw new AppError('Connection already exists', 400);
      }

      const initiatorId = existing.userId1.toString();
      const receiverId = existing.userId2.toString();

      // Current user already sent request previously
      if (initiatorId === req.userId) {
        throw new AppError('Friend request already sent', 400);
      }

      // Mutual interest -> auto accept and open chat
      if (receiverId === req.userId) {
        existing.status = 'accepted';
        await existing.save();

        const chat = await getOrCreatePrivateChat(initiatorId, receiverId);
        emitChatRefresh(chat._id.toString(), [initiatorId, receiverId]);

        const accepter = await User.findById(req.userId).select('fullName username');
        const accepterName = accepter?.fullName || accepter?.username || 'Someone';

        const notification = await Notification.create({
          userId: initiatorId,
          type: 'connection',
          message: `${accepterName} cũng quan tâm bạn! Hai bạn đã match và có thể trò chuyện.`,
          relatedId: existing._id,
          read: false
        });
        emitToUser(initiatorId, 'notification:new', notification.toObject());

        const populated = await populateConnection(existing);

        sendSuccess(res, {
          connection: populated,
          matched: true,
          chat
        }, {
          message: 'It’s a match! Chat is ready.'
        });
        return;
      }

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

    const populatedConnection = await populateConnection(connection);

    sendSuccess(res, {
      connection: populatedConnection,
      matched: false
    }, {
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

    const initiatorId = connection.userId1.toString();
    const accepterId = connection.userId2.toString();

    // Tạo thông báo cho người gửi request
    const accepter = await User.findById(req.userId).select('fullName username avatar');
    const accepterName = accepter?.fullName || accepter?.username || 'Someone';
    
    const notification = await Notification.create({
      userId: connection.userId1,
      type: 'connection',
      message: `${accepterName} accepted your connection request`,
      relatedId: connection._id,
      read: false
    });

    // Gửi notification realtime cho người gửi request
    emitToUser(initiatorId, 'notification:new', notification.toObject());

    const chat = await getOrCreatePrivateChat(initiatorId, accepterId);
    emitChatRefresh(chat._id.toString(), [initiatorId, accepterId]);

    const populatedConnection = await populateConnection(connection);

    sendSuccess(res, {
      connection: populatedConnection,
      matched: true,
      chat
    }, { message: 'Friend request accepted' });
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
