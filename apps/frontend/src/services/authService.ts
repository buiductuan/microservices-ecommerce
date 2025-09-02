import { apiClient } from './apiClient';

export const authService = {
  async login(credentials: { email: string; password: string }) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async register(userData: { name: string; email: string; password: string }) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  async refreshToken() {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },
};
