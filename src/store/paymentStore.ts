import { create } from 'zustand';
import { paymentService } from '@/services/payment.service';
import { logger } from '@/lib/logger';
import type { ContactInfo, Order, CreatePaymentIntentResponse } from '@/types';

// ─── State shape ─────────────────────────────────────────────────────────────

interface PaymentState {
  // ── New Stripe Checkout ──────────────────────────────────────────────────
  isCreatingSession: boolean;
  sessionError: string | null;
  createCheckoutSession: (
    sectionId: string,
    quantity: number,
    contactInfo: ContactInfo,
    giftOption: boolean,
    teamSupport: string | null
  ) => Promise<{ sessionId: string; checkoutUrl: string }>;
  clearSessionError: () => void;

  // ── Stripe Payment Intents & Orders ──────────────────────────────────────
  isCreatingIntent: boolean;
  intentError: string | null;
  createPaymentIntent: (
    eventId: string,
    sectionId: string,
    quantity: number,
    currency?: string
  ) => Promise<CreatePaymentIntentResponse>;
  
  isConfirmingOrder: boolean;
  confirmOrderError: string | null;
  confirmOrder: (payload: {
    eventId: string;
    sectionId: string;
    quantity: number;
    totalAmount: number;
    paymentMethod: string;
    stripePaymentIntentId: string;
    contactInfo: ContactInfo;
  }) => Promise<Order>;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const usePaymentStore = create<PaymentState>((set) => ({
  // New state
  isCreatingSession: false,
  sessionError: null,

  createCheckoutSession: async (sectionId, quantity, contactInfo, giftOption, teamSupport) => {
    set({ isCreatingSession: true, sessionError: null });
    try {
      const result = await paymentService.createCheckoutSession(
        sectionId,
        quantity,
        contactInfo,
        giftOption,
        teamSupport
      );
      set({ isCreatingSession: false });
      return result;
    } catch (error: any) {
      logger.error('Failed to create checkout session:', error);
      const errMsg = error?.message ?? 'Failed to create checkout session. Please try again.';
      set({ sessionError: errMsg, isCreatingSession: false });
      throw error;
    }
  },

  clearSessionError: () => set({ sessionError: null }),

  // Stripe Payment Intents & Orders
  isCreatingIntent: false,
  intentError: null,
  isConfirmingOrder: false,
  confirmOrderError: null,

  createPaymentIntent: async (eventId, sectionId, quantity, currency = 'usd') => {
    set({ isCreatingIntent: true, intentError: null });
    try {
      const result = await paymentService.createPaymentIntent(eventId, sectionId, quantity, currency);
      set({ isCreatingIntent: false });
      return result;
    } catch (error: any) {
      logger.error('Failed to create payment intent:', error);
      const errMsg = error?.message ?? 'Failed to initialize payment. Please try again.';
      set({ intentError: errMsg, isCreatingIntent: false });
      throw error;
    }
  },

  confirmOrder: async (payload) => {
    set({ isConfirmingOrder: true, confirmOrderError: null });
    try {
      const result = await paymentService.confirmOrder(payload);
      set({ isConfirmingOrder: false });
      return result;
    } catch (error: any) {
      logger.error('Failed to confirm order:', error);
      const errMsg = error?.message ?? 'Failed to complete order booking. Please contact support.';
      set({ confirmOrderError: errMsg, isConfirmingOrder: false });
      throw error;
    }
  },
}));
