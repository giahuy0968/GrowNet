import { Response } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

// Get notifications
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = 20 } = req.query;

    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({
      userId: req.userId,
      read: false
    });

    res.json({
      notifications,
      count: notifications.length,
      unreadCount
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Mark as read
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Mark all as read
export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.updateMany(
      { userId: req.userId, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Delete notification
export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: req.userId
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    res.json({ message: 'Notification deleted' });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};
