import { apiClient } from './apiClient';
import { User } from '../store/slices/userSlice';

export const userService = {
  async getUsers(params: { page?: number; limit?: number; search?: string }) {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  async getUserById(id: string) {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  async updateUser(id: string, userData: Partial<User>) {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};
