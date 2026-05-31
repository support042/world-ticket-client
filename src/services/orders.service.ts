import { apiClient } from '@/lib/api';
import type { Order } from '@/store/ordersStore';

const USE_SHADOW = true;

export const ordersService = {
  // GET /orders
  getUserOrders: async (): Promise<Order[]> => {
    if (USE_SHADOW) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // In a real flow, the backend filters by the JWT token.
      // So no UserId parameter is actually needed in the real API request!
      return []; // Return mock or empty, since ordersStore handles local persistence
    }
    
    const response = await apiClient.get<{ orders: Order[] }>('/orders');
    return response.data.orders;
  },

  // POST /orders
  createOrder: async (orderData: Partial<Order>): Promise<Order> => {
    if (USE_SHADOW) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...(orderData as Order), id: `ord_${Date.now()}` };
    }
    
    // When the physical backend confirms Stripe's success, 
    // it will actually create the ticket record and return it.
    const response = await apiClient.post<Order>('/orders', orderData);
    return response.data;
  }
};
