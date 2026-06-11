import { create } from 'zustand'
import { persist } from 'zustand/middleware'
// import { events as initialEvents } from '@/data/events'  // COMMENTED OUT - using API only
import type { EventsState, Event, Section, EventFilters } from '@/types'
import { eventsService } from '@/services/events.service'
import { logger } from '@/lib/logger'

const defaultFilters: EventFilters = {
  location: '',
  team: '',
  round: '',
  dateRange: '',
  priceRange: { min: 0, max: 50000 }
}

// Helper to retry asynchronous API operations with exponential backoff.
// Helps handle backend cold-starts on serverless/free hosting tiers.
async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1500): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) throw error
    logger.warn(`[api-retry] Request failed, retrying in ${delayMs}ms... (${retries} retries left)`)
    await new Promise(resolve => setTimeout(resolve, delayMs))
    return fetchWithRetry(fn, retries - 1, delayMs * 1.5)
  }
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      events: [],  // ← CHANGED: Start with empty array, not dummy data
      filters: defaultFilters,
      searchQuery: '',
      isLoading: false,
      isFetching: false,
      fetchError: null,
      
      // Pagination State
      currentPage: 1,
      totalPages: 1,
      hasMore: false,
      eventsPerPage: 6,
      totalResults: 0,

      clearFetchError: () => set({ fetchError: null }),

      fetchInitialEvents: async () => {
        set({ isFetching: true, currentPage: 1, fetchError: null })
        try {
          const { filters, searchQuery, eventsPerPage } = get()
          const { events, total } = await fetchWithRetry(() =>
            eventsService.getEvents(filters, searchQuery, 1, eventsPerPage)
          )
          
          set({ 
            events: events || [], 
            totalResults: total || (events ? events.length : 0),
            totalPages: Math.ceil((total || (events ? events.length : 0)) / eventsPerPage),
            hasMore: (total || (events ? events.length : 0)) > eventsPerPage,
            isFetching: false 
          })
        } catch (error: any) {
          logger.error('Failed to fetch events from API:', error)
          set({ 
            isFetching: false,
            fetchError: error?.message || 'Failed to load events. Please try again.'
          })
        }
      },

      loadMoreEvents: async () => {
        const { currentPage, totalPages, isFetching, filters, searchQuery, eventsPerPage, events: currentEvents } = get()
        
        if (isFetching || currentPage >= totalPages) return

        set({ isFetching: true })
        try {
          const nextPage = currentPage + 1
          const { events: newEvents, total } = await fetchWithRetry(() =>
            eventsService.getEvents(filters, searchQuery, nextPage, eventsPerPage)
          )
          
          set({ 
            events: [...currentEvents, ...(newEvents || [])],
            currentPage: nextPage,
            totalResults: total || currentEvents.length + (newEvents ? newEvents.length : 0),
            hasMore: total ? (currentEvents.length + (newEvents ? newEvents.length : 0)) < total : false,
            isFetching: false 
          })
        } catch (error) {
          logger.error('Failed to load more events:', error)
          set({ isFetching: false })
        }
      },

      goToPage: async (page: number) => {
        const { isFetching, filters, searchQuery, eventsPerPage } = get()
        if (isFetching) return

        set({ isFetching: true, fetchError: null })
        try {
          const { events, total } = await fetchWithRetry(() =>
            eventsService.getEvents(filters, searchQuery, page, eventsPerPage)
          )
          set({ 
            events: events || [], 
            currentPage: page,
            totalResults: total || (events ? events.length : 0),
            totalPages: Math.ceil((total || (events ? events.length : 0)) / eventsPerPage),
            hasMore: total ? (page * eventsPerPage) < total : false,
            isFetching: false 
          })
        } catch (error: any) {
          logger.error('Failed to fetch page events:', error)
          set({ 
            isFetching: false,
            fetchError: error?.message || 'Failed to load page. Please try again.'
          })
        }
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query })
        get().fetchInitialEvents()
      },

      setFilters: (newFilters: Partial<EventFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        }))
        get().fetchInitialEvents()
      },

      clearFilters: () => {
        set({ filters: defaultFilters, searchQuery: '' })
        get().fetchInitialEvents()
      },

      getFilteredEvents: (): Event[] => {
        const { events, filters, searchQuery } = get()

        return events.filter(event => {
          if (searchQuery) {
            const query = searchQuery.toLowerCase()
            const matchesSearch =
              event.title.toLowerCase().includes(query) ||
              event.venue.toLowerCase().includes(query) ||
              event.city.toLowerCase().includes(query) ||
              event.teams.some(team => team.name.toLowerCase().includes(query))
            if (!matchesSearch) return false
          }

          if (filters.location &&
            !event.city.toLowerCase().includes(filters.location.toLowerCase()) &&
            !event.country.toLowerCase().includes(filters.location.toLowerCase())) {
            return false
          }

          if (filters.team &&
            !event.teams.some(team =>
              team.name.toLowerCase().includes(filters.team.toLowerCase()) ||
              team.code.toLowerCase() === filters.team.toLowerCase()
            )) {
            return false
          }

          if (filters.round && !event.stage.toLowerCase().includes(filters.round.toLowerCase())) {
            return false
          }

          if (event.priceRange.min < filters.priceRange.min ||
            event.priceRange.max > filters.priceRange.max) {
            return false
          }

          return true
        })
      },

      onRehydrateStorage: () => () => {
        // Don't fallback to dummy data - we want real API data only
      },

    //   getEventById: (id: string): Event | undefined => {
    //     return get().events.find(event => event.id === id)
    //   },
        fetchEventById: async (id: string) => {
          set({ isLoading: true })
          try {
            const fullEvent = await fetchWithRetry(() => eventsService.getEvent(id))
            set((state: EventsState) => ({
              events: state.events.some(e => e.id === id)
                ? state.events.map(e => (e.id === id ? fullEvent : e))
                : [fullEvent, ...state.events],
              isLoading: false,
            }))
            return fullEvent
          } catch (error) {
            logger.error('Failed to fetch full event:', error)
            set({ isLoading: false })
            return null
          }
        },

        getEventById: (id: string): Event | undefined => {
            const events = get().events

            if (!events || events.length === 0) {
                // Try searching in initial/mock data if store is empty
                return undefined 
            }

            return events.find(event => event.id === id)
        },

      addEvent: async (eventData: Partial<Event>) => {
        set({ isLoading: true })
        try {
          const createdEvent = await eventsService.createEvent(eventData)
          // Ensure createdEvent has necessary arrays for rendering
          const normalizedEvent = {
            ...createdEvent,
            teams: createdEvent.teams || [],
            sections: createdEvent.sections || [],
            priceRange: createdEvent.priceRange || { min: 0, max: 0 }
          };
          
          set((state) => ({ 
            events: [normalizedEvent, ...state.events], 
            isLoading: false 
          }))
          return normalizedEvent
        } catch (error) {
          logger.error('Failed to create event:', error)
          set({ isLoading: false })
          throw error
        }
      },

      updateEvent: async (eventId: string, updates: Partial<Event>) => {
        set({ isLoading: true })
        try {
          const updatedEvent = await eventsService.updateEvent(eventId, updates)
          set((state) => ({
            events: state.events.map(event =>
              event.id === eventId ? updatedEvent : event
            ),
            isLoading: false
          }))
        } catch (error) {
          logger.error('Failed to update event:', error)
          set({ isLoading: false })
          throw error
        }
      },

      deleteEvent: async (eventId: string) => {
        set({ isLoading: true })
        try {
          await eventsService.deleteEvent(eventId)
          set((state) => ({
            events: state.events.filter(event => event.id !== eventId),
            isLoading: false
          }))
        } catch (error) {
          logger.error('Failed to delete event:', error)
          set({ isLoading: false })
          throw error
        }
      },

      addSection: async (eventId: string, sectionData: Partial<Section>) => {
        logger.log('addSection called. Event:', eventId, 'Data:', sectionData)
        set({ isLoading: true })
        try {
          const rawSection = await eventsService.addSection(eventId, sectionData)
          const newSection = {
            ...rawSection,
            id: rawSection.id || `temp-${Date.now()}`,
          }
          logger.log('Section added & normalized:', newSection)
          set((state) => ({
            events: state.events.map(event =>
              event.id === eventId
                ? { ...event, sections: [...(event.sections || []), newSection] }
                : event,
            ),
            isLoading: false,
          }))
          return newSection
        } catch (error) {
          logger.error('Failed to add section:', error)
          set({ isLoading: false })
          throw error
        }
      },

      updateSection: async (eventId: string, sectionId: string, updates: Partial<Section>) => {
        set({ isLoading: true })
        try {
          const updatedSection = await eventsService.updateSection(eventId, sectionId, updates)
          logger.log('Section updated from server:', updatedSection)

          set((state) => ({
            events: state.events.map(event =>
              event.id === eventId
                ? {
                    ...event,
                    sections: event.sections.map(section =>
                      section.id === sectionId
                        ? {
                            // Keep every existing field (guards against a partial server response),
                            // then overlay what the server returned, then overlay the local edits.
                            // This is what prevents the card from disappearing when the server
                            // returns fewer fields than the full section object.
                            ...section,
                            ...updatedSection,
                            id: sectionId, // always guarantee the ID is stable
                          }
                        : section,
                    ),
                  }
                : event,
            ),
            isLoading: false,
          }))
        } catch (error) {
          logger.error('Failed to update section:', error)
          set({ isLoading: false })
          throw error
        }
      },

      deleteSection: async (eventId: string, sectionId: string) => {
        set({ isLoading: true })
        try {
          await eventsService.deleteSection(eventId, sectionId)
          set((state) => ({
            events: state.events.map(event =>
              event.id === eventId
                ? { ...event, sections: event.sections.filter(s => s.id !== sectionId) }
                : event
            ),
            isLoading: false
          }))
        } catch (error) {
          logger.error('Failed to delete section:', error)
          set({ isLoading: false })
          throw error
        }
      }
    }),
    {
      name: 'events-storage',
      version: 1,  // Increment this when you want to clear old cached data
      partialize: (state) => ({ events: state.events }),
      migrate: (persistedState, version) => {
        // This runs if version doesn't match - good place to reset data
        if (version !== 1) {
          return { events: [] }  // Clear events on version mismatch
        }
        return persistedState as EventsState
      }
    }
  )
)