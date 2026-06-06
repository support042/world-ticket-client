import { apiClient } from '@/lib/api';
import { logger } from '@/lib/logger';

// ─── Response type shapes from the API ───────────────────────────────────────

export interface InitiatedUser {
  initiationId: number | string;
  userId: string;
  sectionId: string;
  paymentLink?: string;
  status: 'initiated' | 'paid' | 'failed' | string;
  createdAt?: string;
  updatedAt?: string;
  // Nested relations the backend may include
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
   * Notify the backend that a payment is about to happen for a section.
   * POST /sections/:sectionId/payment-initiated
   */
  paymentInitiated: async (sectionId: string, paymentLink?: string) => {
    const payload = paymentLink ? { paymentLink } : undefined;
    const response = await apiClient.post(
      `/sections/${sectionId}/payment-initiated`,
      payload
    );
    return response.data;
  },

  /**
   * Admin: Mark a payment initiation as paid.
   * POST /admin/section-payments/:initiationId/mark-paid
   */
  markAsPaid: async (initiationId: number | string) => {
    const response = await apiClient.post(
      `/admin/section-payments/${initiationId}/mark-paid`
    );
    return response.data;
  },

  /**
   * Admin: Fetch paginated list of users who have initiated payment.
   * GET /admin/payment-initiated-users?page=1&limit=50
   */
  getInitiatedUsers: async (
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedInitiatedUsersResponse> => {
    const response = await apiClient.get<any>(
      '/admin/payment-initiated-users',
      { params: { page, limit } }
    );

    const apiData = response.data;
    logger.log('/admin/payment-initiated-users API Response Data:', apiData);

    const inner = apiData?.data ?? apiData;
    const usersArray = inner?.users ?? [];

    const normalizedData: InitiatedUser[] = [];

    if (Array.isArray(usersArray)) {
      for (const u of usersArray) {
        const initiatedSections = u.initiatedSections || [];
        for (const s of initiatedSections) {
          // Determine status based on isPaid or status
          let status = 'initiated';
          if (s.isPaid) {
            status = 'paid';
          } else if (s.status) {
            status = s.status;
          }

          normalizedData.push({
            initiationId: s.initiationId ?? s.id ?? s._id,
            userId: u.userId,
            sectionId: s.sectionId,
            paymentLink: s.paymentLink,
            status: status,
            createdAt: s.initiatedAt ?? s.createdAt,
            updatedAt: s.completedAt ?? s.updatedAt,
            user: {
              id: u.userId,
              name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Customer',
              email: u.email,
            },
            section: {
              id: s.sectionId,
              name: s.sectionName || s.name || s.sectionId,
              eventTitle: s.eventTitle,
              eventId: s.eventId,
            }
          });
        }
      }
    }

    logger.log('Normalized Initiated Users Data:', normalizedData);

    return {
      data: normalizedData,
      total: inner?.total ?? normalizedData.length,
      page: inner?.page ?? page,
      limit: inner?.limit ?? limit,
      totalPages: inner?.totalPages ?? Math.ceil((inner?.total ?? normalizedData.length) / limit),
    };
  },

  getMyInitiatedPayments: async (): Promise<InitiatedUser[]> => {
    const response = await apiClient.get<any>('/sections/my-initiated-payments');
    const apiData = response.data;
    logger.log('/sections/my-initiated-payments API Response Data:', apiData);

    const inner = apiData?.data ?? apiData;
    const list = Array.isArray(inner)
      ? inner
      : (Array.isArray(inner?.initiatedSections) ? inner.initiatedSections : []);

    return list.map((s: any) => {
      // Determine status based on isPaid or status
      let status = 'initiated';
      if (s.isPaid) {
        status = 'paid';
      } else if (s.status) {
        status = s.status;
      }

      return {
        initiationId: s.initiationId ?? s.id ?? s._id,
        userId: inner?.user?.userId || s.userId,
        sectionId: s.sectionId,
        paymentLink: s.paymentLink,
        status: status,
        createdAt: s.initiatedAt ?? s.createdAt,
        updatedAt: s.completedAt ?? s.updatedAt,
        section: {
          id: s.sectionId,
          name: s.sectionName || s.name || s.sectionId,
          eventTitle: s.eventTitle,
          eventId: s.eventId,
        },
        user: inner?.user ? {
          id: inner.user.userId,
          email: inner.user.email,
          name: `${inner.user.firstName || ''} ${inner.user.lastName || ''}`.trim() || 'Customer'
        } : undefined
      };
    });
  },
};