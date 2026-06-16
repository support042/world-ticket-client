import { apiClient } from '@/lib/api';
import { logger } from '@/lib/logger';
import type { 
  Order, 
  CreateCheckoutSessionResponse, 
  StripeSessionDetails,
  ContactInfo,
  CreatePaymentIntentResponse
} from '@/types';

// ─── Legacy/Admin Response type shapes (Kept to prevent admin build breaks) ─────
export interface InitiatedUser {
  initiationId: number | string;
  userId: string;
  sectionId: string;
  paymentLink?: string;
  status: 'initiated' | 'paid' | 'failed' | string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
  section?: {
    id: string;
    name?: string;
    price?: number;
    eventTitle?: string;
    eventId?: string;
  };
}

export interface PaginatedInitiatedUsersResponse {
  data: InitiatedUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Service ─────────────────────────────────────────────────────────────────
export const paymentService = {
  /**
   * Create a Stripe Payment Intent.
   * POST /checkout/intent
   */
  createPaymentIntent: async (
    eventId: string,
    sectionId: string,
    quantity: number,
    currency: string = 'usd'
  ): Promise<CreatePaymentIntentResponse> => {
    try {
      logger.log('paymentService - Creating Payment Intent:', { eventId, sectionId, quantity, currency });
      
      const response = await apiClient.post<{ success: boolean; data: CreatePaymentIntentResponse }>('/checkout/intent', {
        eventId,
        sectionId,
        quantity,
        currency: currency.toLowerCase(),
      });

      // Unpack envelope
      const payload = response.data?.success && response.data?.data 
        ? response.data.data 
        : (response.data as unknown as CreatePaymentIntentResponse);

      if (payload && payload.clientSecret) {
        return payload;
      }
      throw new Error('No clientSecret returned from server');
    } catch (error: any) {
      logger.warn('Backend /checkout/intent API failed. Falling back to mock clientSecret.', error);
      
      // Simulate clientSecret for testing offline/mock checkout flows
      const mockClientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(2, 9)}`;
      const amountCents = 120 * quantity * 100; // default $120/ticket in cents
      
      return {
        clientSecret: mockClientSecret,
        amount: amountCents,
        currency: 'usd'
      };
    }
  },

  /**
   * Confirm and record order after payment.
   * POST /orders
   */
  confirmOrder: async (payload: {
    eventId: string;
    sectionId: string;
    quantity: number;
    totalAmount: number;
    paymentMethod: string;
    stripePaymentIntentId: string;
    contactInfo: ContactInfo;
  }): Promise<Order> => {
    try {
      logger.log('paymentService - Confirming Order:', payload);
      const response = await apiClient.post<{ success: boolean; data: { order: Order } }>('/orders', payload);
      
      const order = response.data?.success && response.data?.data?.order
        ? response.data.data.order
        : (response.data as unknown as Order);

      if (order && order.id) {
        // Cache order in local storage so My Tickets page can list it
        const localOrdersStr = localStorage.getItem('mock_stripe_orders') || '[]';
        try {
          const localOrders: Order[] = JSON.parse(localOrdersStr);
          if (!localOrders.find(o => o.id === order.id)) {
            localOrders.unshift(order);
            localStorage.setItem('mock_stripe_orders', JSON.stringify(localOrders));
          }
        } catch (e) {
          logger.error('Failed to sync confirmed order with localStorage', e);
        }
        return order;
      }
      throw new Error('Failed to parse confirmed order from server response');
    } catch (error: any) {
      logger.error('Backend POST /orders failed.', error);

      // If this is a real transaction (does not start with 'pi_mock_'), propagate the error
      if (payload.stripePaymentIntentId && !payload.stripePaymentIntentId.startsWith('pi_mock_')) {
        throw error;
      }

      logger.warn('Reconstructing mock order locally for mock transaction.', error);

      // Reconstruct mock order details
      const mockOrder: Order = {
        id: `ord_mock_${Date.now()}`,
        stripePaymentIntentId: payload.stripePaymentIntentId,
        status: 'completed',
        quantity: payload.quantity,
        totalAmount: payload.totalAmount,
        contactInfo: payload.contactInfo,
        section: {
          id: payload.sectionId,
          name: 'Category A',
          row: 'Block 102',
          eventTitle: 'FIFA World Cup Match',
          eventDate: new Date().toISOString(),
          eventVenue: 'Lusail Stadium',
          eventCity: 'Lusail',
          eventCountry: 'Qatar'
        },
        createdAt: new Date().toISOString()
      };

      // Store mock order locally so it can also be listed in getMyOrders fallback
      const localOrdersStr = localStorage.getItem('mock_stripe_orders') || '[]';
      try {
        const localOrders: Order[] = JSON.parse(localOrdersStr);
        if (!localOrders.find(o => o.id === mockOrder.id)) {
          localOrders.unshift(mockOrder);
          localStorage.setItem('mock_stripe_orders', JSON.stringify(localOrders));
        }
      } catch (e) {
        logger.error('Failed to update mock stripe orders cache', e);
      }

      return mockOrder;
    }
  },

  /**
   * Create a Stripe Checkout session.
   * POST /payments/create-checkout-session
   * @deprecated — No longer used. The inline PaymentElement flow
   *               replaced this. Kept to avoid breaking any remaining callers.
   */
  createCheckoutSession: async (
    sectionId: string,
    quantity: number,
    contactInfo: ContactInfo,
    giftOption: boolean,
    teamSupport: string | null
  ): Promise<CreateCheckoutSessionResponse> => {
    try {
      logger.log('paymentService - Creating checkout session (legacy):', { sectionId, quantity, contactInfo, giftOption, teamSupport });
      
      const response = await apiClient.post<CreateCheckoutSessionResponse>(
        '/payments/create-checkout-session',
        { sectionId, quantity, contactInfo, giftOption, teamSupport }
      );
      
      return response.data;
    } catch (error: unknown) {
      logger.warn('Backend create-checkout-session API failed or not yet implemented. Falling back to frontend mock redirect.', error);
      
      const mockSessionId = `cs_test_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      const checkoutUrl = `${appUrl}/payment/success?session_id=${mockSessionId}`;
      
      sessionStorage.setItem(`mock_session_${mockSessionId}`, JSON.stringify({
        sectionId,
        quantity,
        contactInfo,
        giftOption,
        teamSupport,
        createdAt: new Date().toISOString()
      }));

      return {
        sessionId: mockSessionId,
        checkoutUrl
      };
    }
  },

  /**
   * Retrieve Stripe session and associated order details.
   * GET /payments/session/:sessionId
   * @deprecated — Only used by the legacy session_id URL flow on
   *               PaymentSuccessPage. No new code should call this.
   */
  getSessionDetails: async (sessionId: string): Promise<StripeSessionDetails> => {
    try {
      if (sessionId.startsWith('cs_test_mock_')) {
        throw new Error('Mock session detected');
      }

      const response = await apiClient.get<StripeSessionDetails>(`/payments/session/${sessionId}`);
      return response.data;
    } catch (error: unknown) {
      logger.warn(`Failed to fetch real Stripe session details for ${sessionId}. Reconstructing mock data.`, error);
      
      const storedMock = sessionStorage.getItem(`mock_session_${sessionId}`);
      let mockMetadata: Record<string, unknown> = {};
      if (storedMock) {
        try {
          mockMetadata = JSON.parse(storedMock);
        } catch (e) {
          logger.error('Failed to parse mock session metadata', e);
        }
      }

      const quantity = (mockMetadata.quantity as number) || 2;
      const subtotal = 120 * quantity;
      const totalAmount = subtotal * 1.13;

      const mockOrder: Order = {
        id: `ord_mock_${Date.now()}`,
        stripeSessionId: sessionId,
        stripePaymentIntentId: `pi_mock_${sessionId}`,
        status: 'completed',
        quantity,
        totalAmount,
        section: {
          id: (mockMetadata.sectionId as string) || 'mock-section-id',
          name: 'Category A',
          row: 'Block 102',
          eventTitle: 'World Cup Match Event',
          eventDate: (mockMetadata.createdAt as string) || new Date().toISOString(),
          eventVenue: 'Lusail Stadium',
          eventCity: 'Lusail',
          eventCountry: 'Qatar'
        },
        contactInfo: (mockMetadata.contactInfo as ContactInfo) || {
          firstName: 'Guest',
          lastName: 'User',
          email: 'guest@example.com',
          phone: '+23480000000'
        },
        createdAt: (mockMetadata.createdAt as string) || new Date().toISOString()
      };

      const localOrdersStr = localStorage.getItem('mock_stripe_orders') || '[]';
      try {
        const localOrders: Order[] = JSON.parse(localOrdersStr);
        if (!localOrders.find(o => o.stripeSessionId === sessionId)) {
          localOrders.unshift(mockOrder);
          localStorage.setItem('mock_stripe_orders', JSON.stringify(localOrders));
        }
      } catch (e) {
        logger.error('Failed to update mock stripe orders cache', e);
      }

      return {
        sessionId,
        status: 'complete',
        amountTotal: Math.round(totalAmount * 100),
        currency: 'usd',
        order: mockOrder
      };
    }
  },



  /**
   * These codes are deprecated but i just want to keep them for future purpose and refrece
   * so they are just there and deprecated
   */

   /**
   * Retrieve list of orders for current logged-in user.
   * GET /payments/my-orders
   */
  // getMyOrders: async (): Promise<Order[]> => {
  //   try {
  //     const response = await apiClient.get<{ orders: Order[] }>('/payments/my-orders');
  //     return response.data.orders || [];
  //   } catch (error: any) {
  //     logger.warn('Backend GET /payments/my-orders failed. Fetching locally simulated orders.', error);
  //     const localOrdersStr = localStorage.getItem('mock_stripe_orders') || '[]';
  //     try {
  //       return JSON.parse(localOrdersStr) as Order[];
  //     } catch (e) {
  //       return [];
  //     }
  //   }
  // },

  // ─── Legacy/Admin methods (Kept to prevent compilation failures elsewhere) ────
  
  // paymentInitiated: async (sectionId: string, paymentLink?: string) => {
  //   logger.log('paymentInitiated (legacy):', sectionId, paymentLink);
  //   const payload = paymentLink ? { paymentLink } : undefined;
  //   const response = await apiClient.post(
  //     `/sections/${sectionId}/payment-initiated`,
  //     payload
  //   );
  //   return response.data;
  // },

  // markAsPaid: async (initiationId: number | string) => {
  //   logger.log('markAsPaid (legacy):', initiationId);
  //   const response = await apiClient.post(
  //     `/admin/section-payments/${initiationId}/mark-paid`
  //   );
  //   return response.data;
  // },

  // getInitiatedUsers: async (
  //   page: number = 1,
  //   limit: number = 50
  // ): Promise<PaginatedInitiatedUsersResponse> => {
  //   logger.log('getInitiatedUsers (legacy):', page, limit);
  //   const response = await apiClient.get<any>(
  //     '/admin/payment-initiated-users',
  //     { params: { page, limit } }
  //   );
  //   const apiData = response.data;
  //   const inner = apiData?.data ?? apiData;
  //   const usersArray = inner?.users ?? [];
  //   const normalizedData: InitiatedUser[] = [];

  //   if (Array.isArray(usersArray)) {
  //     for (const u of usersArray) {
  //       const initiatedSections = u.initiatedSections || [];
  //       for (const s of initiatedSections) {
  //         let status = 'initiated';
  //         if (s.isPaid) status = 'paid';
  //         else if (s.status) status = s.status;

  //         normalizedData.push({
  //           initiationId: s.initiationId ?? s.id ?? s._id,
  //           userId: u.userId,
  //           sectionId: s.sectionId,
  //           paymentLink: s.paymentLink,
  //           status: status,
  //           createdAt: s.initiatedAt ?? s.createdAt,
  //           updatedAt: s.completedAt ?? s.updatedAt,
  //           user: {
  //             id: u.userId,
  //             name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Customer',
  //             email: u.email,
  //           },
  //           section: {
  //             id: s.sectionId,
  //             name: s.sectionName || s.name || s.sectionId,
  //             eventTitle: s.eventTitle,
  //             eventId: s.eventId,
  //           }
  //         });
  //       }
  //     }
  //   }

  //   return {
  //     data: normalizedData,
  //     total: inner?.total ?? normalizedData.length,
  //     page: inner?.page ?? page,
  //     limit: inner?.limit ?? limit,
  //     totalPages: inner?.totalPages ?? Math.ceil((inner?.total ?? normalizedData.length) / limit),
  //   };
  // },

  // getMyInitiatedPayments: async (): Promise<InitiatedUser[]> => {
  //   logger.log('getMyInitiatedPayments (legacy)');
  //   const response = await apiClient.get<any>('/sections/my-initiated-payments');
  //   const apiData = response.data;
  //   const inner = apiData?.data ?? apiData;
  //   const list = Array.isArray(inner)
  //     ? inner
  //     : (Array.isArray(inner?.initiatedSections) ? inner.initiatedSections : []);

  //   return list.map((s: any) => {
  //     let status = 'initiated';
  //     if (s.isPaid) status = 'paid';
  //     else if (s.status) status = s.status;

  //     return {
  //       initiationId: s.initiationId ?? s.id ?? s._id,
  //       userId: inner?.user?.userId || s.userId,
  //       sectionId: s.sectionId,
  //       paymentLink: s.paymentLink,
  //       status: status,
  //       createdAt: s.initiatedAt ?? s.createdAt,
  //       updatedAt: s.completedAt ?? s.updatedAt,
  //       section: {
  //         id: s.sectionId,
  //         name: s.sectionName || s.name || s.sectionId,
  //         eventTitle: s.eventTitle,
  //         eventId: s.eventId,
  //       },
  //       user: inner?.user ? {
  //         id: inner.user.userId,
  //         email: inner.user.email,
  //         name: `${inner.user.firstName || ''} ${inner.user.lastName || ''}`.trim() || 'Customer'
  //       } : undefined
  //     };
  //   });
  // },
};