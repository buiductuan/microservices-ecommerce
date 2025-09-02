import { apiClient } from './apiClient';
import { Notification } from '../store/slices/notificationSlice';

export const notificationService = {
  async getNotifications(params: { page?: number; limit?: number; type?: string; status?: string }) {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  async sendNotification(notificationData: Omit<Notification, 'id' | 'status' | 'createdAt' | 'sentAt'>) {
    const response = await apiClient.post('/notifications', notificationData);
    return response.data;
  },

  async getNotificationById(id: string) {
    const response = await apiClient.get(`/notifications/${id}`);
    return response.data;
  },

  async getNotificationStats() {
    const response = await apiClient.get('/notifications/stats');
    return response.data;
  },
};
