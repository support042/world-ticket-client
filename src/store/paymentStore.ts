import { create } from 'zustand';
import { paymentService, type InitiatedUser } from '@/services/payment.service';
import { logger } from '@/lib/logger';

// ─── State shape ─────────────────────────────────────────────────────────────

interface PaymentState {
  // ── Initiated-users list (admin) ──────────────────────────────────────────
  initiatedUsers: InitiatedUser[];
  isLoadingUsers: boolean;
  usersError: string | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;

  // ── My initiated payments (user-facing) ────────────────────────────────────
  myInitiatedPayments: InitiatedUser[];
  isLoadingMyPayments: boolean;
  myPaymentsError: string | null;

  // ── Per-action loading flags ───────────────────────────────────────────────
  isMarkingPaid: boolean;
  isInitiating: boolean;
  actionError: string | null;

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Admin: load the paginated list of users who have initiated payment.
   * Replaces the list (for page navigation) rather than appending.
   */
  fetchInitiatedUsers: (page?: number, limit?: number) => Promise<void>;

  /**
   * Admin: mark an initiation record as paid.
   * Optimistically updates the local list and re-fetches if needed.
   */
  markAsPaid: (initiationId: number | string) => Promise<void>;

  /**
   * User-facing: load the list of payments initiated by the current user.
   */
  fetchMyInitiatedPayments: () => Promise<void>;

  /**
   * User-facing: tell the backend a payment for a section is about to happen.
   */
  initiatePayment: (sectionId: string, paymentLink?: string) => Promise<void>;

  /** Clear any action-level error */
  clearActionError: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const usePaymentStore = create<PaymentState>((set, get) => ({
  // Initial state
  initiatedUsers: [],
  isLoadingUsers: false,
  usersError: null,

  currentPage: 1,
  totalPages: 1,
  totalUsers: 0,
  limit: 50,

  myInitiatedPayments: [],
  isLoadingMyPayments: false,
  myPaymentsError: null,

  isMarkingPaid: false,
  isInitiating: false,
  actionError: null,

  // ── fetchInitiatedUsers ──────────────────────────────────────────────────

  fetchInitiatedUsers: async (page = 1, limit = 50) => {
    set({ isLoadingUsers: true, usersError: null });
    try {
      const result = await paymentService.getInitiatedUsers(page, limit);

      set({
        initiatedUsers: result.data,
        currentPage: result.page,
        totalPages: result.totalPages,
        totalUsers: result.total,
        limit: result.limit,
        isLoadingUsers: false,
      });
    } catch (error: any) {
      logger.error('Failed to fetch initiated users:', error);
      set({
        usersError: error?.message ?? 'Failed to load payment initiated users.',
        isLoadingUsers: false,
      });
    }
  },

  // ── markAsPaid ───────────────────────────────────────────────────────────

  markAsPaid: async (initiationId) => {
    set({ isMarkingPaid: true, actionError: null });
    try {
      await paymentService.markAsPaid(initiationId);

      // Optimistically update the local list — flip the matching record to 'paid'
      set((state) => ({
        initiatedUsers: state.initiatedUsers.map((u) =>
          u.initiationId === initiationId ? { ...u, status: 'paid' } : u
        ),
        isMarkingPaid: false,
      }));
    } catch (error: any) {
      logger.error('Failed to mark as paid:', error);
      set({
        actionError: error?.message ?? 'Failed to mark payment as paid.',
        isMarkingPaid: false,
      });
      throw error; // re-throw so the UI can react (e.g. show a toast)
    }
  },

  // ── fetchMyInitiatedPayments ─────────────────────────────────────────────

  fetchMyInitiatedPayments: async () => {
    set({ isLoadingMyPayments: true, myPaymentsError: null });
    try {
      const result = await paymentService.getMyInitiatedPayments();
      set({
        myInitiatedPayments: result,
        isLoadingMyPayments: false,
      });
    } catch (error: any) {
      logger.error('Failed to fetch my initiated payments:', error);
      set({
        myPaymentsError: error?.message ?? 'Failed to load initiated payments.',
        isLoadingMyPayments: false,
      });
    }
  },

  // ── initiatePayment ──────────────────────────────────────────────────────

  initiatePayment: async (sectionId, paymentLink) => {
    set({ isInitiating: true, actionError: null });
    try {
      await paymentService.paymentInitiated(sectionId, paymentLink);
      set({ isInitiating: false });
    } catch (error: any) {
      logger.error('Failed to initiate payment:', error);
      set({
        actionError: error?.message ?? 'Failed to initiate payment.',
        isInitiating: false,
      });
      throw error;
    }
  },

  // ── clearActionError ─────────────────────────────────────────────────────

  clearActionError: () => set({ actionError: null }),
}));
