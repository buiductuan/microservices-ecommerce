import { apiClient } from './apiClient';
import { Product } from '../store/slices/productSlice';

export const productService = {
  async getProducts(params: { page?: number; limit?: number; search?: string; category?: string }) {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  async getProductById(id: string) {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await apiClient.post('/products', productData);
    return response.data;
  },

  async updateProduct(id: string, productData: Partial<Product>) {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  },

  async deleteProduct(id: string) {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  async getCategories() {
    const response = await apiClient.get('/products/categories');
    return response.data;
  },
};
