import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ordersService } from "@/services/orders.service"
import { logger } from "@/lib/logger"
import type { Order } from "@/types"

interface OrdersState {
  orders: Order[]
  isLoading: boolean
  error: string | null
  
  // Paginated list state (Admin and User)
  paginatedOrders: Order[]
  totalOrders: number
  currentPage: number
  totalPages: number
  limit: number

  // Actions
  fetchMyOrders: () => Promise<void>
  fetchPaginatedOrders: (page?: number, limit?: number) => Promise<void>
  addOrder: (order: Order) => void
  getUserOrders: (userId: string | null) => Order[]
  clearOrdersError: () => void
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,
      error: null,

      // Paginated list defaults
      paginatedOrders: [],
      totalOrders: 0,
      currentPage: 1,
      totalPages: 1,
      limit: 20,

      fetchMyOrders: async () => {
        set({ isLoading: true, error: null })
        try {
          const fetchedOrders = await ordersService.getUserOrders()
          set({ orders: fetchedOrders, isLoading: false })
        } catch (err: any) {
          logger.error('ordersStore - fetchMyOrders failed:', err)
          set({ 
            error: err?.message || 'Failed to fetch your reservations.', 
            isLoading: false 
          })
        }
      },

      fetchPaginatedOrders: async (page = 1, limit = 20) => {
        set({ isLoading: true, error: null })
        try {
          const result = await ordersService.getAdminOrders(page, limit)
          set({
            paginatedOrders: result.orders,
            totalOrders: result.total,
            currentPage: result.page,
            limit: result.limit,
            totalPages: Math.ceil(result.total / result.limit),
            isLoading: false
          })
        } catch (err: any) {
          logger.error('ordersStore - fetchPaginatedOrders failed:', err)
          set({
            error: err?.message || 'Failed to fetch paginated orders.',
            isLoading: false
          })
        }
      },

      addOrder: (order) => set((state) => {
        // Prevent duplicates
        if (state.orders.some(o => o.stripeSessionId === order.stripeSessionId || o.id === order.id)) {
          return state;
        }
        
        // Also save to localStorage mock Stripe cache in case user refreshes in mock mode
        const localOrdersStr = localStorage.getItem('mock_stripe_orders') || '[]';
        try {
          const localOrders: Order[] = JSON.parse(localOrdersStr);
          if (!localOrders.find(o => o.id === order.id)) {
            localOrders.unshift(order);
            localStorage.setItem('mock_stripe_orders', JSON.stringify(localOrders));
          }
        } catch (e) {
          logger.error('Failed to sync added order with local storage', e);
        }

        return { orders: [order, ...state.orders] };
      }),

      getUserOrders: () => {
        // Since orders are already filtered by the authenticated user's JWT at the API layer,
        // we can just return all active orders. We keep the parameter signature for backward compatibility.
        return get().orders
      },

      clearOrdersError: () => set({ error: null })
    }),
    {
      name: 'orders-storage'
    }
  )
)
