import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Chat from '../models/Chat';
import Message from '../models/Message';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';
import path from 'path';

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
interface PersistMessageInput {
  chatId: string;
  senderId: string;
  content: string;
  type?: 'text' | 'image' | 'file';
  file?: {
    url: string;
    name?: string;
    size?: number;
    mimeType?: string;
  };
}

const persistMessage = async ({ chatId, senderId, content, type = 'text', file }: PersistMessageInput) => {
  const requesterId = new mongoose.Types.ObjectId(senderId);

  const message = new Message({
    chatId: new mongoose.Types.ObjectId(chatId),
    senderId: requesterId,
    content,
    type,
    fileUrl: file?.url,
    fileName: file?.name,
    fileSize: file?.size,
    mimeType: file?.mimeType,
    readBy: [requesterId]
  });
  await message.save();

  const chat = await Chat.findById(chatId);
  if (chat) {
    chat.lastMessage = {
      content,
      senderId: requesterId,
      timestamp: new Date()
    };
    chat.updatedAt = new Date();
    await chat.save();
  }

  return Message.findById(message._id)
    .populate('senderId', 'username fullName avatar');
};

const ensureParticipant = async (chatId: string, userId?: string | null) => {
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  const chat = await Chat.findOne({
    _id: chatId,
    participants: userId
  });

  if (!chat) {
    throw new AppError('Chat not found or unauthorized', 404);
  }

  return chat;
};

const buildFileUrl = (req: Request, fileName: string) => {
  const base = process.env.FILE_BASE_URL || `${req.protocol}://${req.get('host')}`;
  const relativePath = `/uploads/chat/${fileName}`;
  return `${base}${relativePath}`;
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const { content, type = 'text', fileUrl } = req.body;
    await ensureParticipant(chatId, req.userId);

    const populatedMessage = await persistMessage({
      chatId,
      senderId: req.userId!,
      content,
      type,
      file: fileUrl ? { url: fileUrl } : undefined
    });

    sendSuccess(res, populatedMessage, {
      status: 201,
      message: 'Message sent successfully'
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const sendAttachmentMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    await ensureParticipant(chatId, req.userId);

    const file = req.file;
    if (!file) {
      throw new AppError('File is required', 400);
    }

    const caption = (req.body.caption as string | undefined)?.trim();
    const url = buildFileUrl(req as unknown as Request, path.basename(file.path));
    const messageType = file.mimetype.startsWith('image/') ? 'image' : 'file';

    const populatedMessage = await persistMessage({
      chatId,
      senderId: req.userId!,
      content: caption || file.originalname,
      type: messageType,
      file: {
        url,
        name: file.originalname,
        size: file.size,
        mimeType: file.mimetype
      }
    });

    sendSuccess(res, populatedMessage, {
      status: 201,
      message: 'Attachment uploaded'
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
