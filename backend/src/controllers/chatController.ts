import { Response } from 'express';
import Chat from '../models/Chat';
import Message from '../models/Message';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

// Get or create chat
export const getOrCreateChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Find existing chat
    let chat = await Chat.findOne({
      type: 'private',
      participants: { $all: [req.userId, userId] }
    }).populate('participants', '-password');

    // Create new chat if not exists
    if (!chat) {
      chat = await Chat.create({
        type: 'private',
        participants: [req.userId, userId]
      });

      chat = await Chat.findById(chat._id).populate('participants', '-password');
    }

    res.json({ chat });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Get all chats
export const getAllChats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chats = await Chat.find({
      participants: req.userId
    })
      .populate('participants', '-password')
      .sort({ updatedAt: -1 });

    res.json({ chats, count: chats.length });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Get messages
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const { limit = 50 } = req.query;

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

    res.json({ messages: messages.reverse(), count: messages.length });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Send message
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const { content, type = 'text', fileUrl } = req.body;

    // Verify user is participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.userId
    });

    if (!chat) {
      throw new AppError('Chat not found or unauthorized', 404);
    }

    // Create message
    const message = await Message.create({
      chatId,
      senderId: req.userId,
      content,
      type,
      fileUrl,
      readBy: [req.userId]
    });

    // Update chat last message
    chat.lastMessage = {
      content,
      senderId: req.userId as any,
      timestamp: new Date()
    };
    chat.updatedAt = new Date();
    await chat.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'username fullName avatar');

    res.status(201).json({
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Mark messages as read
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;

    await Message.updateMany(
      {
        chatId,
        readBy: { $ne: req.userId }
      },
      {
        $addToSet: { readBy: req.userId }
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};
