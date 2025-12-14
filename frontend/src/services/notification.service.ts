import apiService, { ApiResponse } from './api.service';

export interface Notification {
  _id: string;
  userId: string;
  type: 'like' | 'comment' | 'connection' | 'message';
  message: string;
  relatedId?: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationListResult {
  notifications: Notification[];
  count: number;
  unreadCount: number;
}

class NotificationService {
  async getNotifications(limit: number = 20): Promise<NotificationListResult> {
    const response = await apiService.get<
      ApiResponse<Notification[], { count: number; unreadCount: number }>
    >(`/notifications?limit=${limit}`);

    return {
      notifications: response.data,
      count: response.meta?.count ?? response.data.length,
      unreadCount: response.meta?.unreadCount ?? 0
    };
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await apiService.put<ApiResponse<Notification>>(`/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllAsRead(): Promise<string> {
    const response = await apiService.put<ApiResponse<null>>('/notifications/read-all');
    return response.message || 'All notifications marked as read';
  }

  async deleteNotification(notificationId: string): Promise<string> {
    const response = await apiService.delete<ApiResponse<null>>(`/notifications/${notificationId}`);
    return response.message || 'Notification deleted';
  }
}

export default new NotificationService();
