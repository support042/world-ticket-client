import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Heart, Share2, MapPin, Calendar, Clock, Eye, Ticket,
  Plus, Minus, ThumbsUp, DollarSign, Users,
  SlidersHorizontal, Star, Shield, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEventsStore } from '@/store/eventsStore'
import { useCartStore } from '@/store/cartStore'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getEventById } = useEventsStore()
  const { setSelectedEvent, setSelectedSection, setQuantity, addToCart } = useCartStore()


  const event = id ? getEventById(id) ?? null : null

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [ticketCount, setTicketCount] = useState<number>(2)
  const [isFavorite, setIsFavorite] = useState<boolean>(false)

  // Debug (safe)
  useEffect(() => {
    console.log('Event ID:', id)
    console.log('Event:', event)
  }, [id, event])

  console.log('ID:', id)
  console.log('Events in store:', useEventsStore.getState().events)

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Event not found</p>
          <Button asChild className="mt-4">
            <Link to="/">Back to Events</Link>
          </Button>
        </Card>
      </div>
    )
  }

  // ✅ Derived state (core fix)
  const selectedSection =
    event.sections.find(s => s.id === selectedSectionId) ??
    event.sections[0] ??
    null

  const urgencyBadge = event.ticketsLeftPercent <= 5

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSectionId(sectionId)
  }

  const handleContinue = () => {
    if (!selectedSection) return

    setSelectedEvent(event)
    setSelectedSection(selectedSection)
    setQuantity(ticketCount)

    addToCart(event, selectedSection, ticketCount)
    navigate('/checkout')
  }

  const handleTicketCountChange = (delta: number) => {
    if (!selectedSection) return

    setTicketCount(prev =>
      Math.max(1, Math.min(selectedSection?.available ?? 10, prev + delta))
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Event Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-green-400 text-white text-xs font-bold flex-shrink-0">
              <div className="text-center">
                <div>WORLD</div>
                <div>CUP</div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <Link to={`/event/${event.id}`} className="text-lg font-semibold text-primary hover:underline">
                {event.title}
              </Link>
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
              <Link to="#" className="text-sm text-primary hover:underline flex items-center gap-1 mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {event.venue}, {event.city}, {event.state}, {event.country}
              </Link>

              {urgencyBadge && (
                <Badge className="mt-2 bg-red-500 hover:bg-red-600 text-white">
                  <Ticket className="h-3 w-3 mr-1" />
                  Only {event.ticketsLeftPercent}% of tickets left
                </Badge>
              )}
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
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Left - Stadium View & Listings */}
          <div className="space-y-6">
            {/* Category Legend */}
            <div className="flex flex-wrap items-center gap-4">
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

            {/* Stadium Map */}
            <Card className="overflow-hidden">
              <div className="relative bg-gradient-to-b from-green-100 to-green-50 p-8">
                <div className="relative mx-auto max-w-lg">
                  <div className="relative aspect-[4/3] rounded-[100px] border-[20px] border-pink-200 bg-gradient-to-b from-green-200 to-green-100 overflow-hidden">
                    <div className="absolute inset-8 rounded-lg bg-green-500 border-2 border-white">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-16 w-16 rounded-full border-2 border-white" />
                      </div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-24 border-2 border-l-0 border-white rounded-r-lg" />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-24 border-2 border-r-0 border-white rounded-l-lg" />
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-white" />
                    </div>

                    {event.sections.slice(0, 6).map((section, idx) => {
                      const positions: React.CSSProperties[] = [
                        { top: '15%', left: '20%' },
                        { top: '15%', right: '20%' },
                        { top: '50%', left: '10%' },
                        { top: '50%', right: '10%' },
                        { bottom: '15%', left: '25%' },
                        { bottom: '15%', right: '25%' },
                      ]
                      return (
                        <button
                          key={section.id}
                          onClick={() => handleSectionSelect(section.id)}
                          className={`absolute text-xs font-bold px-2 py-1 rounded transition-all hover:scale-110 ${
                            selectedSectionId === section.id
                              ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                              : 'bg-white shadow-md hover:bg-primary/10'
                          }`}
                          style={positions[idx]}
                        >
                          <div>{formatCurrency(section.price)}</div>
                          <div className="text-[10px] text-green-600">{section.available} left</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="absolute right-4 top-4 flex flex-col gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-white">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-white">
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Listings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{event.sections.length} listings</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <Select defaultValue="2">
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

              {event.sections.map((section) => (
                <Card
                  key={section.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedSectionId === section.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSectionSelect(section.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="h-20 w-28 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs flex-shrink-0 overflow-hidden">
                        <div className="text-center">
                          <Users className="h-6 w-6 mx-auto mb-1 opacity-50" />
                          <span className="opacity-70">Section View</span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">Section {section.name}</h3>
                            <p className="text-sm text-muted-foreground">Row {section.row}</p>
                            <p className="text-sm text-muted-foreground">{section.available} tickets</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold">{formatCurrency(section.price)}</p>
                            {section.rating && (
                              <Badge className="mt-1 bg-green-500 hover:bg-green-600 text-white">
                                {section.rating} {section.ratingLabel}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {section.features.map((feature, idx) => (
                            <span key={idx} className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Eye className="h-3 w-3" />
                              {feature}
                            </span>
                          ))}
                        </div>

                        {section.isPopular && (
                          <Badge variant="outline" className="mt-2">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Popular Pick - {section.ticketsSoldLastHour} tickets sold in last hour
                          </Badge>
                        )}

                        {section.isLowestPrice && (
                          <Badge className="mt-2 bg-green-500 hover:bg-green-600 text-white">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Lowest price! Only {section.available} tickets left at this price
                          </Badge>
                        )}

                        {section.isFanFavorite && (
                          <Badge variant="outline" className="mt-2 text-orange-500 border-orange-200">
                            <Star className="h-3 w-3 mr-1 fill-orange-500" />
                            Fan favorite
                          </Badge>
                        )}

                        <p className="text-xs text-green-600 mt-2">
                          {section.available} tickets remaining in this listing
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:sticky lg:top-24 space-y-4 self-start">
            {selectedSection && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Order summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Section {selectedSection.name} - Row {selectedSection.row}</h3>
                    <p className="text-sm text-muted-foreground">{ticketCount} tickets</p>
                  </div>

                  {selectedSection.isPopular && (
                    <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                      <ThumbsUp className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Popular Pick</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedSection.ticketsSoldLastHour} tickets sold in last hour
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedSection.features.includes('Clear view') && (
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span>Clear view</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tickets</span>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleTicketCountChange(-1)}
                        disabled={ticketCount <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{ticketCount}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleTicketCountChange(1)}
                        disabled={ticketCount >= selectedSection.available}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ticket price</span>
                    <span className="font-medium">
                      {ticketCount} x {formatCurrency(selectedSection.price)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tax, handling fee, and booking fee not included
                  </p>

                  <Button className="w-full" size="lg" onClick={handleContinue}>
                    Continue
                  </Button>

                  <div className="space-y-3 pt-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">100% Order Guarantee</p>
                        <p className="text-xs text-muted-foreground">
                          We back every order so you can buy and sell tickets with 100% confidence.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <RefreshCw className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Resell Anytime</p>
                        <p className="text-xs text-muted-foreground">
                          Not sure if you can make it? You can resell your tickets on tickethub at any time.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {urgencyBadge && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-lg">🔥</span>
                  </div>
                  <div>
                    <p className="font-semibold text-orange-800">High demand</p>
                    <p className="text-xs text-orange-600">
                      Only {event.ticketsLeftPercent}% of tickets left
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}