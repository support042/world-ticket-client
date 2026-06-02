import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { events as initialEvents } from '@/data/events'
import type { EventsState, Event, Section, EventFilters } from '@/types'
import { eventsService } from '@/services/events.service'

const defaultFilters: EventFilters = {
  location: '',
  team: '',
  round: '',
  dateRange: '',
  priceRange: { min: 0, max: 50000 }
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      events: initialEvents,
      filters: defaultFilters,
      searchQuery: '',
      isLoading: false,
      isFetching: false,
      
      // Pagination State
      currentPage: 1,
      totalPages: 1,
      hasMore: false,
      eventsPerPage: 20,
      totalResults: 0,

      fetchInitialEvents: async () => {
        set({ isFetching: true, currentPage: 1 })
        try {
          const { filters, searchQuery, eventsPerPage } = get()
          const { events, total } = await eventsService.getEvents(filters, searchQuery, 1, eventsPerPage)
          
          set({ 
            events: events || [], 
            totalResults: total || (events ? events.length : 0),
            totalPages: Math.ceil((total || (events ? events.length : 0)) / eventsPerPage),
            hasMore: (total || (events ? events.length : 0)) > eventsPerPage,
            isFetching: false 
          })
        } catch (error) {
          console.error("Failed to fetch events from API:", error)
          set({ isFetching: false })
        }
      },

      loadMoreEvents: async () => {
        const { currentPage, totalPages, isFetching, filters, searchQuery, eventsPerPage, events: currentEvents } = get()
        
        if (isFetching || currentPage >= totalPages) return

        set({ isFetching: true })
        try {
          const nextPage = currentPage + 1
          const { events: newEvents, total } = await eventsService.getEvents(filters, searchQuery, nextPage, eventsPerPage)
          
          set({ 
            events: [...currentEvents, ...(newEvents || [])],
            currentPage: nextPage,
            totalResults: total || currentEvents.length + (newEvents ? newEvents.length : 0),
            hasMore: total ? (currentEvents.length + (newEvents ? newEvents.length : 0)) < total : false,
            isFetching: false 
          })
        } catch (error) {
          console.error("Failed to load more events:", error)
          set({ isFetching: false })
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

      onRehydrateStorage: () => (state) => {
        if (!state?.events || state.events.length === 0) {
            state.events = initialEvents
        }
      },

    //   getEventById: (id: string): Event | undefined => {
    //     return get().events.find(event => event.id === id)
    //   },
        fetchEventById: async (id: string) => {
          set({ isLoading: true })
          try {
            const fullEvent = await eventsService.getEvent(id)
            set((state: EventsState) => ({
              events: state.events.some(e => e.id === id) 
                ? state.events.map(e => e.id === id ? fullEvent : e)
                : [fullEvent, ...state.events],
              isLoading: false
            }))
            return fullEvent
          } catch (error) {
            console.error("Failed to fetch full event:", error)
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
          console.error("Failed to create event:", error)
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
          console.error("Failed to update event:", error)
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
          console.error("Failed to delete event:", error)
          set({ isLoading: false })
          throw error
        }
      },

      addSection: async (eventId: string, sectionData: Partial<Section>) => {
        console.log("Adding Section to Server. Event:", eventId, "Data:", sectionData);
        set({ isLoading: true })
        try {
          const rawSection = await eventsService.addSection(eventId, sectionData)
          // Ensure it has an ID for React keys
          const newSection = {
            ...rawSection,
            id: rawSection.id || `temp-${Date.now()}`
          };
          
          console.log("Section Added & Normalized:", newSection);
          set((state) => ({
            events: state.events.map(event =>
              event.id === eventId
                ? { ...event, sections: [...(event.sections || []), newSection] }
                : event
            ),
            isLoading: false
          }))
          return newSection
        } catch (error) {
          console.error("Failed to add section:", error)
          set({ isLoading: false })
          throw error
        }
      },

      updateSection: async (eventId: string, sectionId: string, updates: Partial<Section>) => {
        set({ isLoading: true })
        try {
          const updatedSection = await eventsService.updateSection(eventId, sectionId, updates)
          
          set((state) => ({
            events: state.events.map(event =>
              event.id === eventId
                ? {
                  ...event,
                  sections: event.sections.map(section =>
                    section.id === sectionId ? { ...section, ...updatedSection } : section
                  )
                }
                : event
            ),
            isLoading: false
          }))
        } catch (error) {
          console.error("Failed to update section:", error)
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
          console.error("Failed to delete section:", error)
          set({ isLoading: false })
          throw error
        }
      }
    }),
    {
      name: 'events-storage',
      partialize: (state) => ({ events: state.events })
    }
  )
)