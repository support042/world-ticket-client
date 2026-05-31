import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Event, Section, ContactInfo } from "@/types"

export interface Order {
  id: string
  userId: string | null
  event: Event
  section: Section
  quantity: number
  contactInfo: ContactInfo
  totalAmount: number
  status: 'completed' | 'processing' | 'failed'
  createdAt: string
  paymentMethod: string
}

interface OrdersState {
  orders: Order[]
  addOrder: (order: Order) => void
  getUserOrders: (userId: string | null) => Order[]
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      getUserOrders: (userId) => {
        if (!userId) return []
        return get().orders.filter(order => order.userId === userId)
      }
    }),
    {
      name: 'orders-storage'
    }
  )
)
