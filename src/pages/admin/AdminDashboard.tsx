import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminStore } from '@/store/authStore'
import { useEventsStore } from '@/store/eventsStore'
import AdminHeader from '@/components/admin/AdminHeader'
import StatsCards from '@/components/admin/StatsCards'
import AdminEventCard from '@/components/admin/AdminEventCard'
import EventFilters from '@/components/events/EventFilters'
import EventDialog from '@/components/admin/EventDialog'
import SectionDialog from '@/components/admin/sectionDialog'
import type { Event, Section, DeleteTarget } from '@/types'
import DeleteDialog from '@/components/admin/deleteDialog'
import { toast } from 'sonner'
import type { CreateEventPayload, CreateSectionPayload } from '@/lib/validations'

const defaultDeleteTarget: DeleteTarget = { type: null, id: null, eventId: null }

// Temporary mock helpers - backend will generate these values when API is ready
function generateEventId() { return 'event-' + Date.now().toString() }
function generateMockViews() { return Math.trunc(50000 * Math.random()) }
function generateMockFavorites() { return Math.trunc(100000 * Math.random()) }

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { admin, isAdminAuthenticated, adminLogout } = useAdminStore()
  const { 
    events, 
    addEvent, 
    updateEvent, 
    deleteEvent, 
    addSection, 
    updateSection, 
    deleteSection,
    searchQuery,
    setSearchQuery,
    hasMore,
    isFetching,
    loadMoreEvents,
    fetchInitialEvents,
    totalResults
  } = useEventsStore()

  const [showEventDialog, setShowEventDialog] = useState(false)
  const [showSectionDialog, setShowSectionDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(defaultDeleteTarget)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login')
    } else {
      // Load initial events for admin view if not already loaded or to ensure sync
      fetchInitialEvents()
    }
  }, [isAdminAuthenticated, navigate, fetchInitialEvents])

  if (!isAdminAuthenticated) return null

  const totalEvents = totalResults || events.length
  const totalTickets = events.reduce((acc, e) =>
    acc + (e.sections?.reduce((a, s) => a + s.available, 0) || 0), 0)
  const totalRevenue = events.reduce((acc, e) =>
    acc + (e.sections?.reduce((a, s) => a + s.price * s.available, 0) || 0), 0)

  const handleLogout = () => { 
    adminLogout(); 
    navigate('/admin/login') 
    toast.success('Logged out successfully')
  }

  const handleEventSubmit = async (data: CreateEventPayload) => {
    setIsSubmitting(true)

    const eventId = editingEvent?.id ?? generateEventId()
    const viewsLastHour = editingEvent?.viewsLastHour ?? generateMockViews()
    const favorites = editingEvent?.favorites ?? generateMockFavorites()

    const eventData: Partial<Event> = {
      id: eventId,
      title: data.title,
      tournament: data.tournament,
      stage: data.stage,
      date: data.date,
      time: data.time,
      venue: data.venue,
      city: data.city,
      state: data.state,
      country: data.country,
      ticketsLeftPercent: data.ticketsLeftPercent,
      priceRange: { min: data.priceMin, max: data.priceMax },
      image: data.image,
      viewsLastHour,
      favorites,
      teams: [
        { name: data.team1Name, flag: data.team1Flag, code: data.team1Code },
        { name: data.team2Name, flag: data.team2Flag, code: data.team2Code }
      ],
      categories: editingEvent?.categories ?? [
        { id: 1, name: 'Category 1', price: data.priceMax, color: '#e91e63', available: 10 },
        { id: 2, name: 'Category 2', price: Math.floor((data.priceMin + data.priceMax) / 2), color: '#a67c52', available: 20 },
        { id: 3, name: 'Category 3', price: data.priceMin, color: '#2196f3', available: 30 },
      ],
      sections: editingEvent?.sections ?? []
    }

    console.log("Submitting Event Payload:", eventData);

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData)
        toast.success('Event updated successfully')
      } else {
        await addEvent(eventData)
        toast.success('Event created successfully')
      }
      setEditingEvent(null)
    } catch (err) {
      console.error('Failed to save event:', err)
      toast.error('Failed to save event: ' + (err instanceof Error ? err.message : 'Unknown error'))
      // Re-throw so the dialog knows NOT to close
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSectionSubmit = async (data: CreateSectionPayload) => {
    if (!selectedEventId) return
    setIsSubmitting(true)

    const sectionId = editingSection?.id ?? `sec-${Date.now()}`
    const ticketsSoldLastHour = editingSection?.ticketsSoldLastHour ?? Math.floor(Math.random() * 10)

    const sectionData: Partial<Section> = {
      id: sectionId,
      name: data.name,
      row: data.row,
      price: data.price,
      available: data.available,
      features: data.features ? data.features.split(',').map(f => f.trim()).filter(Boolean) : [],
      ticketsSoldLastHour,
      sectionImage: data.sectionImage
    }

    try {
      if (editingSection) {
        await updateSection(selectedEventId, editingSection.id, sectionData)
        toast.success('Section updated successfully')
      } else {
        await addSection(selectedEventId, sectionData)
        toast.success('Section added successfully')
      }
      setEditingSection(null)
      setSelectedEventId(null)
    } catch (err) {
      console.error('Failed to save section:', err)
      toast.error('Failed to save section')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (deleteTarget.type === 'event' && deleteTarget.id) {
      try {
        await deleteEvent(deleteTarget.id)
        toast.success('Event deleted successfully')
      } catch {
        toast.error('Failed to delete event')
      }
    } else if (deleteTarget.type === 'section' && deleteTarget.id && deleteTarget.eventId) {
      try {
        await deleteSection(deleteTarget.eventId, deleteTarget.id)
        toast.success('Section deleted successfully')
      } catch {
        toast.error('Failed to delete section')
      }
    }
    setShowDeleteDialog(false)
    setDeleteTarget(defaultDeleteTarget)
  }

  const openEditEvent = (event: Event) => {
    setEditingEvent(event)
    setShowEventDialog(true)
  }

  const openDeleteEvent = (eventId: string) => {
    setDeleteTarget({ type: 'event', id: eventId, eventId: null })
    setShowDeleteDialog(true)
  }

  // const openAddSection = (eventId: string) => {
  //   setSelectedEventId(eventId)
  //   setEditingSection(null)
  //   setShowSectionDialog(true)
  // }

  // const openEditSection = (eventId: string, section: Section) => {
  //   setSelectedEventId(eventId)
  //   setEditingSection(section)
  //   setShowSectionDialog(true)
  // }

  // const openDeleteSection = (eventId: string, sectionId: string) => {
  //   setDeleteTarget({ type: 'section', id: sectionId, eventId })
  //   setShowDeleteDialog(true)
  // }

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <AdminHeader admin={admin} onLogout={handleLogout} />

      <main className="container mx-auto px-4 xl:px-8 2xl:px-12 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button
            onClick={() => { setEditingEvent(null); setShowEventDialog(true) }}
            disabled={isSubmitting}
            size="lg"
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus className="h-5 w-5 mr-2" />
            {isSubmitting ? 'Saving...' : 'Add New Event'}
          </Button>
        </div>

        <StatsCards
          totalEvents={totalEvents}
          totalTickets={totalTickets}
          totalRevenue={totalRevenue}
        />

        <div className="mt-12 space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search events by team, city, venue or tournament..."
                className="pl-10 h-12 bg-card border-muted-foreground/20 focus-visible:ring-primary shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
              <span>Showing <strong>{events.length}</strong> of <strong>{totalResults}</strong> events</span>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-muted-foreground/10 shadow-sm">
            <EventFilters />
          </div>

          <Card className="border-none shadow-md overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle>Event Management</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-muted-foreground/10">
                {isSubmitting && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 bg-primary/5 animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Processing changes...
                  </div>
                )}
                
                <div className="p-4 sm:p-6 space-y-4">
                  {events.map((event) => (
                    <AdminEventCard
                      key={event.id}
                      event={event}
                      onEditEvent={openEditEvent}
                      onDeleteEvent={openDeleteEvent}
                    />
                  ))}

                  {events.length === 0 && !isFetching && !isSubmitting && (
                    <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                          <Search className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                        <div>
                          <p className="text-xl font-semibold">No events found</p>
                          <p className="text-muted-foreground mt-1 max-w-xs mx-auto">
                            Try adjusting your search query or add a new event to the system.
                          </p>
                        </div>
                        <Button 
                          onClick={() => { setSearchQuery(''); fetchInitialEvents() }} 
                          variant="ghost" 
                          className="mt-2"
                        >
                          Clear Search
                        </Button>
                      </div>
                    </div>
                  )}

                  {isFetching && events.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
                      <p className="text-muted-foreground animate-pulse">Loading events...</p>
                    </div>
                  )}

                  {hasMore && (
                    <div className="pt-8 flex justify-center border-t border-muted-foreground/5 mt-8">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={loadMoreEvents}
                        disabled={isFetching}
                        className="min-w-[240px] h-12 shadow-sm hover:shadow-md transition-all hover:bg-primary hover:text-primary-foreground border-primary/20"
                      >
                        {isFetching ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading More...
                          </>
                        ) : (
                          'Show More Events'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <EventDialog
        open={showEventDialog}
        onOpenChange={setShowEventDialog}
        editingEvent={editingEvent}
        onSubmit={handleEventSubmit}
        isSubmitting={isSubmitting}
      />

      <SectionDialog
        open={showSectionDialog}
        onOpenChange={setShowSectionDialog}
        editingSection={editingSection}
        onSubmit={handleSectionSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        targetType={deleteTarget.type}
        onConfirm={handleDelete}
      />
    </div>
  )
}
