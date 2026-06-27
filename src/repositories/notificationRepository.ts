import { Notification } from '../types';

const NOTIFICATIONS_KEY = 'lifeos_notifications_db';

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    user_id: 'ak', // You
    type: 'payment',
    title: 'Payment Received',
    message: 'Rahul Patel paid ₹2,100 for Goa Hotel.',
    reference_id: 'e1',
    reference_type: 'Expense',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'n2',
    user_id: 'ak',
    type: 'reminder',
    title: 'Payment Request Overdue',
    message: 'You owe ₹300 to Riya Joshi for Cab to Airport. Payment overdue.',
    reference_id: 'e3',
    reference_type: 'Expense',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
  },
  {
    id: 'n3',
    user_id: 'ak',
    type: 'group_invite',
    title: 'Added to Group',
    message: 'Karan Mehta was added to Goa Trip.',
    reference_id: 'g1',
    reference_type: 'Group',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
  },
  {
    id: 'n4',
    user_id: 'ak',
    type: 'request',
    title: 'New Expense Created',
    message: 'Goa Hotel expense of ₹8,400 created. Your share: ₹2,100.',
    reference_id: 'e1',
    reference_type: 'Expense',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 'n5',
    user_id: 'ak',
    type: 'payment_verified',
    title: 'Expense Settled',
    message: 'Sunday Dinner has been fully settled.',
    reference_id: 'e2',
    reference_type: 'Expense',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hours ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString()
  }
];

export const notificationRepository = {
  getNotifications: (): Notification[] => {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!data) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    return JSON.parse(data);
  },
  
  saveNotifications: (notifications: Notification[]): void => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  },
  
  getNotificationsForUser: (userId: string): Notification[] => {
    const notifications = notificationRepository.getNotifications();
    return notifications.filter((n) => n.user_id === userId).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },
  
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>): Notification => {
    const notifications = notificationRepository.getNotifications();
    const newNotif: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    notifications.push(newNotif);
    notificationRepository.saveNotifications(notifications);
    return newNotif;
  },
  
  markAsRead: (id: string): void => {
    const notifications = notificationRepository.getNotifications();
    const notif = notifications.find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
      notif.updated_at = new Date().toISOString();
      notificationRepository.saveNotifications(notifications);
    }
  },
  
  markAllAsReadForUser: (userId: string): void => {
    const notifications = notificationRepository.getNotifications();
    notifications.forEach((n) => {
      if (n.user_id === userId) {
        n.is_read = true;
        n.updated_at = new Date().toISOString();
      }
    });
    notificationRepository.saveNotifications(notifications);
  }
};

export default notificationRepository;
