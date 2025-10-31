// Add notification-related API endpoints
export const notificationApi = {
  getNotifications: async (page = 1, limit = 20) => {
    const response = await fetch(`/api/v1/notifications?page=${page}&limit=${limit}`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  },

  getUnreadCount: async () => {
    const response = await fetch('/api/v1/notifications/unread-count', {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch unread count');
    return response.json();
  },

  markAsRead: async (notificationId: number) => {
    const response = await fetch(`/api/v1/notifications/${notificationId}/read`, {
      method: 'PATCH',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return response.json();
  },

  markAllAsRead: async () => {
    const response = await fetch('/api/v1/notifications/mark-all-read', {
      method: 'PATCH',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to mark all notifications as read');
    return response.json();
  },

  deleteNotification: async (notificationId: number) => {
    const response = await fetch(`/api/v1/notifications/${notificationId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete notification');
    return response.json();
  }
};