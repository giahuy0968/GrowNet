import { Response } from 'express';
import mongoose from 'mongoose';
import Chat from '../models/Chat';
import Message from '../models/Message';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';

// Get or create chat
export const getOrCreateChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!req.userId) {
      throw new AppError('Unauthorized', 401);
    }

    // Find existing chat
    let chat = await Chat.findOne({
      type: 'private',
      participants: { $all: [req.userId, userId] }
    }).populate('participants', '-password');

    // Create new chat if not exists
    if (!chat) {
      const createdChat = new Chat({
        type: 'private',
        participants: [req.userId, userId]
      });
      await createdChat.save();
      chat = await Chat.findById(createdChat._id).populate('participants', '-password');
    }

    sendSuccess(res, chat);
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Get all chats
export const getAllChats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      throw new AppError('Unauthorized', 401);
    }
    const chats = await Chat.find({
      participants: req.userId
    })
      .populate('participants', '-password')
      .sort({ updatedAt: -1 });

    sendSuccess(res, chats, {
      meta: {
        count: chats.length
      }
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Get messages
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const { limit = 50 } = req.query;
    if (!req.userId) {
      throw new AppError('Unauthorized', 401);
    }

    // Verify user is participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.userId
    });

    if (!chat) {
      throw new AppError('Chat not found or unauthorized', 404);
    }

    const messages = await Message.find({ chatId })
      .populate('senderId', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const orderedMessages = messages.reverse();
    sendSuccess(res, orderedMessages, {
      meta: {
        count: orderedMessages.length
      }
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Send message
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const { content, type = 'text', fileUrl } = req.body;
    if (!req.userId) {
      throw new AppError('Unauthorized', 401);
    }

    // Verify user is participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.userId
    });

    if (!chat) {
      throw new AppError('Chat not found or unauthorized', 404);
    }

    const requesterId = new mongoose.Types.ObjectId(req.userId);

    // Create message
    const message = new Message({
      chatId: new mongoose.Types.ObjectId(chatId),
      senderId: requesterId,
      content,
      type,
      fileUrl,
      readBy: [requesterId]
    });
    await message.save();

    // Update chat last message
    chat.lastMessage = {
      content,
      senderId: requesterId,
      timestamp: new Date()
    };
    chat.updatedAt = new Date();
    await chat.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'username fullName avatar');

    sendSuccess(res, populatedMessage, {
      status: 201,
      message: 'Message sent successfully'
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Mark messages as read
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    if (!req.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const requesterId = new mongoose.Types.ObjectId(req.userId);

    await Message.updateMany(
      {
        chatId: new mongoose.Types.ObjectId(chatId),
        readBy: { $ne: requesterId }
      },
      {
        $addToSet: { readBy: requesterId }
      }
    );

    sendSuccess(res, null, { message: 'Messages marked as read' });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};
