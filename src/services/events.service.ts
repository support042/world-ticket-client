import { apiClient } from '@/lib/api';
import { logger } from '@/lib/logger';
import type { Event, EventFilters, Section } from '@/types';
import { events as mockData } from '@/data/events';

const USE_SHADOW = false;

// In shadow mode, we maintain an in-memory replica of events so Admin additions persist during session
let shadowEvents = [...mockData];

interface GetEventsResponse {
  events: Event[];
  total: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Normalise a raw section object coming from the server.
 * The server stores the field as `payment_link` (snake_case).
 * Our frontend type uses `paymentLink` (camelCase).
 * We destructure `payment_link` out so it never leaks into the returned object,
 * then expose it as `paymentLink` — giving us one clean key, not two.
 */
function normalizeSection(s: any): Section {
  const { payment_link, ...rest } = s;
  return {
    ...rest,
    id: s.id || s._id,
    paymentLink: s.paymentLink ?? payment_link ?? undefined,
  };
}

export const eventsService = {
  // GET /events/:id
  getEvent: async (id: string): Promise<Event> => {
    logger.log('Fetching full event details for ID:', id);
    const response = await apiClient.get<any>(`/events/${id}`);
    const data = response.data.data || response.data;

    // Some endpoints return { event: { ... } }, others return the event directly
    const event = data.event || data;

    const normalizedEvent = {
      ...event,
      id: event.id || event._id,
      sections: (event.sections || []).map(normalizeSection),
    };

    logger.log('Full event data received & normalized:', normalizedEvent);
    return normalizedEvent;
  },

  // GET /events
  getEvents: async (
    _filters?: Partial<EventFilters>,
    search?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<GetEventsResponse> => {
    if (USE_SHADOW) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let filtered = [...shadowEvents];

      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(
          e =>
            e.title.toLowerCase().includes(query) ||
            e.venue.toLowerCase().includes(query),
        );
      }

      const total = filtered.length;
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);

      return { events: paginated, total };
    }

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await apiClient.get<any>('/events', { params });
    const apiData = response.data;

    let rawEvents: any[] = [];
    let total = 0;

    // Handle { success: true, data: { events: [], total: 0, ... } } or flat arrays
    if (apiData && apiData.success && apiData.data) {
      rawEvents = apiData.data.events || [];
      total = apiData.data.total || 0;
    } else if (Array.isArray(apiData)) {
      rawEvents = apiData;
      total = apiData.length;
    } else {
      rawEvents = apiData.events || [];
      total = apiData.total || (apiData.events ? apiData.events.length : 0);
    }

    const normalizedEvents = rawEvents.map((e: any) => ({
      ...e,
      id: e.id || e._id,
      sections: (e.sections || []).map(normalizeSection),
    }));

    return { events: normalizedEvents, total };
  },

  // GET /events/:id (used by getEventById in store)
  getEventById: async (id: string): Promise<Event> => {
    if (USE_SHADOW) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const evt = shadowEvents.find(e => e.id === id);
      if (!evt) throw new Error('Event not found');
      return evt;
    }
    const response = await apiClient.get<any>(`/events/${id}`);
    const data = response.data.data || response.data;
    const event = data.event || data;

    return {
      ...event,
      id: event.id || event._id,
      sections: (event.sections || []).map(normalizeSection),
    };
  },

  // ADMIN ENDPOINTS
  createEvent: async (eventData: any): Promise<Event> => {
    if (USE_SHADOW) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newEvent = { ...(eventData as Event), id: `evt_${Date.now()}` };
      shadowEvents.push(newEvent);
      return newEvent;
    }

    const payload = {
      ...eventData,
      priceRange: eventData.priceRange || {
        min: eventData.priceMin,
        max: eventData.priceMax,
      },
      categories: eventData.categories || [],
      status: eventData.status || 'upcoming',
    };

    const response = await apiClient.post<any>('/admin/events', payload);
    const data = response.data.data || response.data;
    return { ...data, id: data.id || data._id };
  },

  updateEvent: async (id: string, updates: any): Promise<Event> => {
    if (USE_SHADOW) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const idx = shadowEvents.findIndex(e => e.id === id);
      if (idx === -1) throw new Error('Not found');
      shadowEvents[idx] = { ...shadowEvents[idx], ...updates };
      return shadowEvents[idx];
    }

    const payload = {
      ...updates,
      priceRange:
        updates.priceRange ||
        (updates.priceMin !== undefined
          ? { min: updates.priceMin, max: updates.priceMax }
          : undefined),
    };

    const response = await apiClient.put<any>(`/admin/events/${id}`, payload);
    const data = response.data.data || response.data;
    return { ...data, id: data.id || data._id };
  },

  deleteEvent: async (id: string): Promise<void> => {
    const response = await apiClient.delete<any>(`/admin/events/${id}`);
    return response.data;
  },

  addSection: async (eventId: string, sectionData: any): Promise<Section> => {
    logger.log('Adding section to server. Event:', eventId, 'Data:', sectionData);

    if (USE_SHADOW) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...(sectionData as Section), id: `sec_${Date.now()}` };
    }

    // Destructure camelCase paymentLink out so we can send it as snake_case payment_link.
    // The server silently ignores `paymentLink` (camelCase) and requires `payment_link`.
    const { paymentLink, ...rest } = sectionData as any;
    const payload = {
      ...rest,
      currency: sectionData.currency || 'USD',
      capacity: sectionData.capacity || sectionData.available,
      isPopular: sectionData.isPopular || false,
      isLowestPrice: sectionData.isLowestPrice || false,
      perks: sectionData.perks || [],
      features: sectionData.features || [],
      payment_link: paymentLink || undefined,
    };

    logger.log('addSection payload sent to server:', payload);

    const response = await apiClient.post<any>(`/admin/events/${eventId}/sections`, payload);
    const data = response.data.data || response.data;

    // Normalize the returned section so paymentLink is consistent on the frontend
    return normalizeSection(data);
  },

  updateSection: async (
    eventId: string,
    sectionId: string,
    updates: any,
  ): Promise<Section> => {
    if (USE_SHADOW) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...updates, id: sectionId } as Section;
    }

    // Same snake_case mapping as addSection
    const { paymentLink, ...rest } = updates as any;
    const payload = {
      ...rest,
      payment_link: paymentLink || undefined,
    };

    logger.log('updateSection payload sent to server:', payload);

    const response = await apiClient.put<any>(
      `/admin/events/${eventId}/sections/${sectionId}`,
      payload,
    );
    const data = response.data.data || response.data;

    // normalizeSection strips payment_link and exposes it as paymentLink only
    return normalizeSection(data);
  },

  deleteSection: async (eventId: string, sectionId: string): Promise<void> => {
    const response = await apiClient.delete<any>(
      `/admin/events/${eventId}/sections/${sectionId}`,
    );
    return response.data;
  },
};
