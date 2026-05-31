import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Heart, Share2, MapPin, Calendar, Clock,
  SlidersHorizontal,
  ArrowLeft,
  Ticket,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEventsStore } from '@/store/eventsStore'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import SectionCard from '@/components/section/SectionCard'
import SEO from '@/components/common/SEO'

import { Skeleton } from '@/components/ui/skeleton'

function SectionSkeleton() {
  return (
    <div className="p-4 border rounded-xl bg-card animate-pulse space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex justify-between items-end pt-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  )
}

export default function EventTicketPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getEventById, fetchEventById, isLoading } = useEventsStore()

  const [event, setEvent] = useState(id ? getEventById(id) ?? null : null)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [ticketCount, setTicketCount] = useState<number>(2)
  const [isFavorite, setIsFavorite] = useState<boolean>(false)

  // Filter sections based on availability
  const filteredSections = (event?.sections || []).filter(
    (section) => section.available >= ticketCount
  )

  useEffect(() => {
    if (!id) return

    const loadData = async () => {
      // First try local store
      const localEvent = getEventById(id)
      if (localEvent) setEvent(localEvent)

      // Fetch full details from server
      const freshEvent = await fetchEventById(id)
      if (freshEvent) {
        setEvent(freshEvent)
      }
    }

    loadData()
  }, [id, getEventById, fetchEventById])

  if (!event && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SEO title="Event Not Found" />
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Event not found</p>
          <Button asChild className="mt-4">
            <Link to="/">Back to Events</Link>
          </Button>
        </Card>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSectionId(sectionId)
  }

  const getSectionColor = (price: number) => {
    const categories = [...event.categories].sort((a, b) => b.price - a.price)
    for (const category of categories) {
      if (price >= category.price * 0.9) {
        return category.color
      }
    }
    return '#e0e0e0'
  }

  return (
    <div className="min-h-screen bg-background lg:h-screen lg:flex lg:flex-col">
      <SEO 
        title={event.title} 
        description={`Get tickets for ${event.title} at ${event.venue}. ${event.stage} stage of the World Cup 2026.`}
      />
      {/* Event Header - Fixed at top */}
      <div className="border-b bg-card flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="hidden sm:flex h-20 w-20 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-green-400 text-white text-xs font-bold flex-shrink-0">
              <div className="text-center">
                <div>WORLD</div>
                <div>CUP</div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold">{event.title}</h1>
              <p className="text-sm text-muted-foreground">{event.stage}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(event.date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(event.time)}
                </span>
              </div>
              <div className="text-sm text-primary flex items-center gap-1 mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {event.venue}, {event.city}, {event.state}, {event.country}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:overflow-hidden">
        <div className="container mx-auto px-4 py-6 lg:h-full">
          
          {/* Category Legend - Fixed */}
          <div className="flex flex-wrap items-center gap-4 mb-6 flex-shrink-0">
            {event.categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm">{cat.name}</span>
                <span className="text-sm font-semibold">{formatCurrency(cat.price)}</span>
              </div>
            ))}
          </div>

          {/* Two Column Layout - stacks on mobile, side-by-side on desktop */}
          <div className="grid gap-6 lg:grid-cols-2 lg:h-full">
            
            {/* LEFT COLUMN - Stadium Map */}
            <div className="lg:sticky lg:top-6 h-fit">
              <Card className="overflow-hidden">
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-0">
                  <div className="relative w-full">
                    <div className="relative w-full min-h-[260px] md:min-h-[350px] lg:min-h-[400px]">
                      
                      {/* Stadium Background Image */}
                        <div className="absolute inset-0 overflow-hidden">
                            <img 
                            src='/src/assets/images/stadium_img.png'
                            alt={`${event.venue} stadium view`}
                            className="w-full h-full object-cover"
                            />
                            {/* Optional: Dark overlay to make tooltips more visible */}
                            <div className="absolute inset-0 bg-black/20" />
                        </div>

                      {/* Section Tooltips - Now using FILTERED sections */}
                      {filteredSections.map((section, idx) => {
                        const positions = [
                          { top: '5%', left: '45%' },
                          { top: '15%', right: '3%' },
                          { top: '40%', right: '-2%' },
                          { bottom: '15%', right: '3%' },
                          { bottom: '5%', left: '45%' },
                          { bottom: '15%', left: '3%' },
                          { top: '40%', left: '-2%' },
                          { top: '15%', left: '3%' },
                        ]
                        const sectionColor = getSectionColor(section.price)

                        return (
                          <button
                            key={section.id}
                            onClick={() => handleSectionSelect(section.id)}
                            className={`absolute text-xs font-semibold px-2 py-1 rounded-md shadow-md transition-all duration-200 hover:scale-110 z-10 ${
                              selectedSectionId === section.id
                                ? 'ring-2 ring-offset-2 ring-primary scale-110'
                                : 'hover:shadow-lg'
                            }`}
                            style={{
                              ...positions[idx % positions.length],
                              backgroundColor: selectedSectionId === section.id ? '#3b82f6' : 'white',
                              color: selectedSectionId === section.id ? 'white' : '#1f2937',
                              borderLeft: `3px solid ${sectionColor}`,
                            }}
                          >
                            <div className="font-bold">{formatCurrency(section.price)}</div>
                            <div className="text-[10px] font-medium text-green-600">
                              {section.available} left
                            </div>
                          </button>
                        )
                      })}
                    </div>
                
                  </div>
                </div>
              </Card>
            </div>

            {/* RIGHT COLUMN - Scrollable Listings */}
            <div className="flex flex-col h-full overflow-hidden">
              {/* Fixed Header */}
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h2 className="font-semibold">{filteredSections.length} listings</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <Select 
                    value={String(ticketCount)} 
                    onValueChange={(val) => setTicketCount(Number(val))}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <SelectItem key={num} value={String(num)}>
                          {num} ticket{num > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Scrollable Listings Container */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 px-4 py-2 custom-scrollbar">
                {isLoading ? (
                  // Show skeletons while fetching
                  Array.from({ length: 4 }).map((_, i) => <SectionSkeleton key={i} />)
                ) : filteredSections.length > 0 ? (
                  filteredSections.map((section) => (
                    <SectionCard
                        key={section.id}
                        section={section}
                        eventId={event.id}
                        isSelected={selectedSectionId === section.id}
                        ticketCount={ticketCount}
                        onSelect={(section) => handleSectionSelect(section.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed border-muted-foreground/10 mx-2">
                    <div className="flex flex-col items-center gap-3">
                      <Ticket className="h-10 w-10 text-muted-foreground/30" />
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">No tickets found</p>
                        <p className="text-xs text-muted-foreground">
                          Try adjusting your ticket quantity or filters.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}