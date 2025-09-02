import { apiClient } from './apiClient';
import { Order } from '../store/slices/orderSlice';

export const orderService = {
  async getOrders(params: { page?: number; limit?: number; status?: string }) {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },

  async getOrderById(id: string) {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  async updateOrderStatus(id: string, status: Order['status']) {
    const response = await apiClient.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  async getOrderStats() {
    const response = await apiClient.get('/orders/stats');
    return response.data;
  },
};
