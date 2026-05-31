import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calculateFees } from '@/lib/utils'
import type { CartState, CartItem, Event, Section, ContactInfo } from '@/types'

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedEvent: null,
      selectedSection: null,
      quantity: 2,
      contactInfo: null,
      paymentMethod: null,
      giftOption: false,
      teamSupport: null,
      newsletterOptIn: false,

      setSelectedEvent: (event: Event) => set({ selectedEvent: event }),

      setSelectedSection: (section: Section) => set({ selectedSection: section }),

      setQuantity: (quantity: number) =>
        set({ quantity: Math.max(1, Math.min(10, quantity)) }),

      addToCart: (event: Event, section: Section, qty: number): CartItem => {
        const item: CartItem = {
          id: `${event.id}-${section.id}-${Date.now()}`,
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.date,
          eventTime: event.time,
          venue: event.venue,
          section: section.name,
          row: section.row,
          quantity: qty,
          pricePerTicket: section.price,
          subtotal: section.price * qty,
          sectionImage: section.sectionImage,
          addedAt: new Date().toISOString()
        }

        set((state) => ({
          items: [...state.items, item],
          selectedEvent: event,
          selectedSection: section,
          quantity: qty
        }))

        return item
      },

      removeFromCart: (itemId: string) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== itemId)
        }))
      },

      clearCart: () => {
        set({
          items: [],
          selectedEvent: null,
          selectedSection: null,
          quantity: 2,
          contactInfo: null,
          paymentMethod: null,
          giftOption: false,
          teamSupport: null
        })
      },

      setContactInfo: (info: ContactInfo) => set({ contactInfo: info }),

      setPaymentMethod: (method: string) => set({ paymentMethod: method }),

      setGiftOption: (isGift: boolean) => set({ giftOption: isGift }),

      setTeamSupport: (team: string) => set({ teamSupport: team }),

      setNewsletterOptIn: (optIn: boolean) => set({ newsletterOptIn: optIn }),

      getOrderSummary: () => {
        const state = get()
        if (!state.selectedSection || !state.selectedEvent) return null

        const subtotal = state.selectedSection.price * state.quantity
        const fees = calculateFees(subtotal)

        return {
          event: state.selectedEvent,
          section: state.selectedSection,
          quantity: state.quantity,
          pricePerTicket: state.selectedSection.price,
          subtotal,
          ...fees
        }
      },

      getCartTotal: (): number => {
        const state = get()
        return state.items.reduce((total, item) => {
          const fees = calculateFees(item.subtotal)
          return total + fees.total
        }, 0)
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        selectedEvent: state.selectedEvent,
        selectedSection: state.selectedSection,
        quantity: state.quantity,
        contactInfo: state.contactInfo
      })
    }
  )
)