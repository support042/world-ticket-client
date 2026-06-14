import { apiClient } from '@/lib/api';
import { logger } from '@/lib/logger';
import type { Order } from '@/types';

export const ordersService = {
  /**
   * Fetch all orders/reservations for the authenticated user.
   * GET /orders
   */
  getUserOrders: async (): Promise<Order[]> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: { orders: Order[] } }>('/orders');
      logger.log('ordersService - getUserOrders response:', response.data);
      
      const orders = response.data?.success && response.data?.data?.orders
        ? response.data.data.orders
        : (response.data as unknown as { orders: Order[] }).orders;

      return orders || [];
    } catch (error: any) {
      logger.warn('Backend GET /orders failed. Falling back to local mock storage.', error);
      
      const localOrdersStr = localStorage.getItem('mock_stripe_orders') || '[]';
      try {
        return JSON.parse(localOrdersStr) as Order[];
      } catch (e) {
        return [];
      }
    }
  },

  /**
   * Fetch a single order by its ID.
   * GET /orders/:orderId
   */
  getOrderById: async (orderId: string): Promise<Order | null> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: { order: Order } } | Order>(`/orders/${orderId}`);
      
      // Try to unpack using both envelope shapes
      const responseObj = response.data as any;
      const order = responseObj?.success && responseObj?.data?.order
        ? responseObj.data.order
        : (responseObj?.order || responseObj);

      if (order && order.id) {
        return order;
      }
      throw new Error('Order not found in server response');
    } catch (error: any) {
      logger.warn(`Backend GET /orders/${orderId} failed. Checking local mock storage.`, error);
      
      const localOrdersStr = localStorage.getItem('mock_stripe_orders') || '[]';
      try {
        const localOrders = JSON.parse(localOrdersStr) as Order[];
        return localOrders.find(o => o.id === orderId) || null;
      } catch (e) {
        return null;
      }
    }
  },

  /**
   * Fetch paginated list of orders (useful for User and Admin views).
   * GET /orders?page=X&limit=Y
   */
  getOrders: async (page = 1, limit = 20): Promise<{ orders: Order[]; total: number; page: number; limit: number }> => {
    try {
      const response = await apiClient.get<{ 
        success: boolean; 
        data: { 
          orders: Order[]; 
          total: number; 
          page: number; 
          limit: number; 
        } 
      }>('/orders', { params: { page, limit } });
      
      logger.log('ordersService - getOrders response:', response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      
      const rawData = response.data as any;
      return {
        orders: rawData?.orders || [],
        total: rawData?.total ?? (rawData?.orders || []).length,
        page: rawData?.page ?? page,
        limit: rawData?.limit ?? limit
      };
    } catch (error: any) {
      logger.warn('Backend GET /orders failed. Falling back to local mock storage.', error);
      
      const localOrdersStr = localStorage.getItem('mock_stripe_orders') || '[]';
      try {
        const localOrders = JSON.parse(localOrdersStr) as Order[];
        const start = (page - 1) * limit;
        const end = start + limit;
        return {
          orders: localOrders.slice(start, end),
          total: localOrders.length,
          page,
          limit
        };
      } catch (e) {
        return {
          orders: [],
          total: 0,
          page,
          limit
        };
      }
    }
  },

  /**
   * Fetch paginated list of all orders (Admin dashboard).
   * GET /admin/orders?page=X&limit=Y (falls back to GET /orders)
   */

    getAdminOrders: async (page = 1, limit = 20): Promise<{ orders: Order[]; total: number; page: number; limit: number }> => {
    try {
      const response = await apiClient.get<{ 
        success: boolean; 
        data: { 
          orders: Order[]; 
          total: number; 
          page: number; 
          limit: number; 
        } 
      }>('/admin/orders', { params: { page, limit } });
      
      logger.log('ordersService - getAdminOrders response:', response.data);
      
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      
      const rawData = response.data as any;
      return {
        orders: rawData?.orders || [],
        total: rawData?.total ?? (rawData?.orders || []).length,
        page: rawData?.page ?? page,
        limit: rawData?.limit ?? limit
      };
    } catch (error: any) {
      logger.warn('Backend GET /admin/orders failed, falling back to GET /orders.', error);
      return ordersService.getOrders(page, limit);
    }
  }
  
  
};
