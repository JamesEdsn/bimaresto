import api from '../api';
import { Order } from '../../types/database';

export const orderService = {
  getOrders: async () => {
    const res = await api.get<{ success: boolean; data: Order[] }>('/orders');
    return res.data.data;
  },
  createOrder: async (orderData: any) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },
  updateOrderStatus: async (id: number, status: string) => {
    const res = await api.patch(`/orders/${id}/status`, { status });
    return res.data;
  }
};