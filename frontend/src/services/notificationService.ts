import apiClient from '../api/client';
import notificationRepository from '../repositories/notificationRepository';
import { Notification } from '../types';

export const notificationService = {
  getNotifications: async (userId: string): Promise<Notification[]> => {
    const list = notificationRepository.getNotificationsForUser(userId);
    return apiClient.get(`/notifications?userId=${userId}`, list);
  },
  
  markAsRead: async (id: string): Promise<boolean> => {
    notificationRepository.markAsRead(id);
    return apiClient.patch(`/notifications/${id}/read`, {}, true);
  },
  
  markAllAsRead: async (userId: string): Promise<boolean> => {
    notificationRepository.markAllAsReadForUser(userId);
    return apiClient.patch(`/notifications/read-all`, { userId }, true);
  }
};

export default notificationService;
