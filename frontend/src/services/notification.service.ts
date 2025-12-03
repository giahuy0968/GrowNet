import apiService from './api.service';
import { User } from './auth.service';

export interface Notification {
  _id: string;
  userId: string;
  type: 'connection_request' | 'connection_accepted' | 'post_like' | 'post_comment' | 'message';
  fromUser: User | string;
  relatedId?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

class NotificationService {
  async getNotifications(): Promise<Notification[]> {
    return apiService.get<Notification[]>('/notifications');
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return apiService.put<Notification>(`/notifications/${notificationId}/read`);
  }

  async markAllAsRead(): Promise<{ message: string }> {
    return apiService.put('/notifications/read-all');
  }

  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    return apiService.delete(`/notifications/${notificationId}`);
  }
}

export default new NotificationService();
