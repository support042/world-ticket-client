import { apiClient } from '@/lib/api';
import type { Event, EventFilters, Section } from '@/types';
import { events as mockData } from '@/data/events';

const USE_SHADOW = false;

// In shadow mode, we maintain an in-memory replica of events so Admin additions persist during session
let shadowEvents = [...mockData];

interface GetEventsResponse {
  events: Event[];
  total: number;
}

export const eventsService = {
  // GET /events/:id
  getEvent: async (id: string): Promise<Event> => {
    console.log("Fetching Full Event Details for ID:", id);
    const response = await apiClient.get<any>(`/events/${id}`);
    const data = response.data.data || response.data;
    
    // Some endpoints return { event: { ... } }, others return the event directly
    const event = data.event || data;
    
    console.log("Full Event Data Received & Normalized:", event);
    return { ...event, id: event.id || event._id };
  },

  // GET /events
  getEvents: async (_filters?: Partial<EventFilters>, search?: string, page: number = 1, limit: number = 20): Promise<GetEventsResponse> => {
    if (USE_SHADOW) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Normally, your backend handles the filtering using SQL/NoSQL.
      // Here we proxy the mock data.
      let filtered = [...shadowEvents];
      
      // Basic filtering simulation
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(e => 
          e.title.toLowerCase().includes(query) || 
          e.venue.toLowerCase().includes(query)
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
    // ... append other filters
    
    const response = await apiClient.get<any>('/events', { params });
    const apiData = response.data;
    
    // Handle the specific structure: { success: true, data: { events: [], total: 0, ... } }
    if (apiData && apiData.success && apiData.data) {
      return {
        events: apiData.data.events || [],
        total: apiData.data.total || 0
      };
    }

    // Fallback normalization: handle direct array responses
    if (Array.isArray(apiData)) {
      return { events: apiData, total: apiData.length };
    }
    
    // Final fallback: check for events directly on data or return empty
    return { 
      events: apiData.events || [], 
      total: apiData.total || (apiData.events ? apiData.events.length : 0) 
    };
  },

  // GET /events/:id
  getEventById: async (id: string): Promise<Event> => {
    if (USE_SHADOW) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const evt = shadowEvents.find(e => e.id === id);
      if (!evt) throw new Error('Event not found');
      return evt;
    }
    const response = await apiClient.get<any>(`/events/${id}`);
    return response.data.data || response.data;
  },

  // ADMIN ENDPOINTS
  createEvent: async (eventData: any): Promise<Event> => {
    if (USE_SHADOW) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newEvent = { ...(eventData as Event), id: `evt_${Date.now()}` };
      shadowEvents.push(newEvent);
      return newEvent;
    }

    // Map to the exact structure the backend wants
    const payload = {
      ...eventData,
      // If priceRange is already present (from Dashboard), use it. 
      // Otherwise, try to construct it from individual fields.
      priceRange: eventData.priceRange || {
        min: eventData.priceMin,
        max: eventData.priceMax
      },
      categories: eventData.categories || [],
      status: eventData.status || 'upcoming'
    };

    const response = await apiClient.post<any>('/admin/events', payload);
    return response.data.data || response.data;
  },
  
  updateEvent: async (id: string, updates: any): Promise<Event> => {
    if (USE_SHADOW) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const idx = shadowEvents.findIndex(e => e.id === id);
      if (idx === -1) throw new Error('Not found');
      shadowEvents[idx] = { ...shadowEvents[idx], ...updates };
      return shadowEvents[idx];
    }

    // Map to the exact structure the backend wants
    const payload = {
      ...updates,
      priceRange: updates.priceRange || (updates.priceMin !== undefined ? {
        min: updates.priceMin,
        max: updates.priceMax
      } : undefined)
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
    console.log("Adding Section to Server. Event:", eventId, "Data:", sectionData);
    if (USE_SHADOW) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newSection = { ...(sectionData as Section), id: `sec_${Date.now()}` };
      return newSection;
    }

    // Matches Section sample perfectly
    const payload = {
      ...sectionData,
      currency: sectionData.currency || 'USD',
      capacity: sectionData.capacity || sectionData.available, // Fallback to available if capacity missing
      isPopular: sectionData.isPopular || false,
      isLowestPrice: sectionData.isLowestPrice || false,
      perks: sectionData.perks || [],
      features: sectionData.features || []
    };

    const response = await apiClient.post<any>(`/admin/events/${eventId}/sections`, payload);
    return response.data.data || response.data;
  },

  updateSection: async (eventId: string, sectionId: string, updates: any): Promise<Section> => {
    if (USE_SHADOW) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...updates, id: sectionId } as Section;
    }
    const response = await apiClient.put<any>(`/admin/events/${eventId}/sections/${sectionId}`, updates);
    return response.data.data || response.data;
  },

  deleteSection: async (eventId: string, sectionId: string): Promise<void> => {
    const response = await apiClient.delete<any>(`/admin/events/${eventId}/sections/${sectionId}`);
    return response.data;
  }
};
