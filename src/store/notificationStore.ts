import { create } from 'zustand';
import { Notification } from '../types';
import notificationService from '../services/notificationService';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  
  fetchNotifications: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await notificationService.getNotifications(userId);
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch notifications', isLoading: false });
    }
  },
  
  markAsRead: async (id) => {
    try {
      await notificationService.markAsRead(id);
      const notifications = get().notifications.map((n) => {
        if (n.id === id) return { ...n, is_read: true };
        return n;
      });
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      set({ notifications, unreadCount });
    } catch (err: any) {
      set({ error: err.message || 'Failed to mark notification as read' });
    }
  },
  
  markAllAsRead: async (userId) => {
    try {
      await notificationService.markAllAsRead(userId);
      const notifications = get().notifications.map((n) => ({ ...n, is_read: true }));
      set({ notifications, unreadCount: 0 });
    } catch (err: any) {
      set({ error: err.message || 'Failed to mark all notifications as read' });
    }
  }
}));
export default useNotificationStore;
