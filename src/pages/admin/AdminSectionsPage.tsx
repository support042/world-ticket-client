import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, ArrowLeft, Calendar, MapPin, Ticket, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAdminStore } from '@/store/authStore'
import { useEventsStore } from '@/store/eventsStore'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import { logger } from '@/lib/logger'
import type { Section, DeleteTarget } from '@/types'
import SectionDetailsDialog from '@/components/section/SectionDetailsDialog'
import DeleteDialog from '@/components/admin/deleteDialog'
import SectionDialog from '@/components/admin/sectionDialog'
import { Skeleton } from '@/components/ui/skeleton'
import AdminSectionCard from '@/components/admin/AdminSectionCard'
import type { CreateSectionPayload } from '@/lib/validations'

function AdminSectionSkeleton() {
  return (
    <div className="p-4 border rounded-xl bg-card animate-pulse space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  )
}

const defaultDeleteTarget: DeleteTarget = { type: null, id: null, eventId: null }

export default function AdminSectionsPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { admin, isAdminAuthenticated, adminLogout } = useAdminStore()
  const { getEventById, fetchEventById, updateSection, addSection, deleteSection, isLoading } = useEventsStore()
  
  const [event, setEvent] = useState(getEventById(eventId || ''))
  const [showSectionDialog, setShowSectionDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showSectionDetails, setShowSectionDetails] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(defaultDeleteTarget)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Keep local event state in sync with the store.
  // This runs whenever the store's events array is mutated (add/update/delete section)
  // so we never need to call getEventById() synchronously right after a store mutation
  // (which would grab stale data before Zustand has applied the update).
  const storeEvents = useEventsStore(s => s.events)
  useEffect(() => {
    if (eventId) {
      const fresh = getEventById(eventId)
      if (fresh) setEvent(fresh)
    }
  }, [storeEvents, eventId, getEventById])

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login')
      return
    }

    const loadData = async () => {
      if (!eventId) return

      // First try to get from local store for instant UI
      const localEvent = getEventById(eventId)
      if (localEvent) setEvent(localEvent)

      // Then fetch fresh data from server (including sections)
      const freshEvent = await fetchEventById(eventId)
      if (freshEvent) {
        setEvent(freshEvent)
      } else if (!localEvent) {
        navigate('/admin')
      }
    }

    loadData()
  }, [eventId, fetchEventById, getEventById, isAdminAuthenticated, navigate])

  if (!isAdminAuthenticated || !event) return null

  const urgencyBadge = event.ticketsLeftPercent <= 5

  const handleLogout = () => {
    adminLogout()
    navigate('/admin/login')
  }

  const handleBack = () => {
    navigate('/admin')
  }

  const handleSectionSubmit = async (data: CreateSectionPayload) => {
    if (!event) return
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
      sectionImage: data.sectionImage,
      paymentLink: data.paymentLink,
    }

    try {
      if (editingSection) {
        await updateSection(event.id, editingSection.id, sectionData)
      } else {
        await addSection(event.id, sectionData)
      }
      // No need to call setEvent manually here —
      // the storeEvents useEffect above will pick up the change automatically.
    } catch (err) {
      logger.error('Failed to save section:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = () => {
    if (deleteTarget.type === 'section' && deleteTarget.id && deleteTarget.eventId) {
      deleteSection(deleteTarget.eventId, deleteTarget.id)
      // setEvent will be updated by the storeEvents useEffect automatically
    }
    setShowDeleteDialog(false)
    setDeleteTarget(defaultDeleteTarget)
  }

  const openAddSection = () => {
    setEditingSection(null)
    setShowSectionDialog(true)
  }

  const openEditSection = (section: Section) => {
    setEditingSection(section)
    setShowSectionDialog(true)
  }

  const openDeleteSection = (sectionId: string) => {
    setDeleteTarget({ type: 'section', id: sectionId, eventId: event.id })
    setShowDeleteDialog(true)
  }

  const openSectionDetails = (section: Section) => {
    setSelectedSection(section)
    setShowSectionDetails(true)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader admin={admin} onLogout={handleLogout} />

      <main className="container mx-auto px-4 xl:px-8 2xl:px-12 py-8">
        {/* Back button and header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>

          {/* Event Header Card */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="hidden sm:flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-green-400 text-white text-xs font-bold flex-shrink-0">
                    <div className="text-center">
                      <div>WORLD</div>
                      <div>CUP</div>
                    </div>
                  </div>

                  <div>
                    <h1 className="text-xl md:text-2xl font-bold">{event.title}</h1>
                    <p className="text-sm text-muted-foreground">{event.stage}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(event.date)} at {formatTime(event.time)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.venue}, {event.city}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline" className="gap-1">
                        <Layers className="h-3 w-3" />
                        {event.sections.length} sections
                      </Badge>
                      {urgencyBadge && (
                        <Badge className="bg-red-500 text-white gap-1">
                          <Ticket className="h-3 w-3" />
                          Only {event.ticketsLeftPercent}% left
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        {formatCurrency(event.priceRange.min)} - {formatCurrency(event.priceRange.max)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button onClick={openAddSection}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sections List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Sections</span>
              <Badge variant="secondary" className="text-sm">
                {isLoading ? '...' : (event?.sections?.length || 0)} total
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <AdminSectionSkeleton key={i} />)}
              </div>
            ) : event?.sections && event.sections.length > 0 ? (
              <div className="space-y-3">
                {event.sections.map((section, index) => (
                  <AdminSectionCard
                    key={section.id || section.id || `sec-${index}`}
                    section={section}
                    onViewDetails={openSectionDetails}
                    onEdit={openEditSection}
                    onDelete={openDeleteSection}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                    <Layers className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">No sections yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add your first section to start selling tickets
                    </p>
                  </div>
                  <Button onClick={openAddSection} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Section Dialog */}
      <SectionDialog
        open={showSectionDialog}
        onOpenChange={setShowSectionDialog}
        editingSection={editingSection}
        onSubmit={handleSectionSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        targetType={deleteTarget.type}
        onConfirm={handleDelete}
      />

      {/* Section Details Dialog */}
      <SectionDetailsDialog
        open={showSectionDetails}
        onOpenChange={setShowSectionDetails}
        section={selectedSection}
        eventTitle={event.title}
      />
    </div>
  )
}
