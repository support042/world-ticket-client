import { useState } from 'react'
import { Heart, Users, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import EventCard from '@/components/events/EventCard'
import EventFilters from '@/components/events/EventFilters'
import { useEventsStore } from '@/store/eventsStore'
import { Skeleton } from '@/components/ui/skeleton'
import { tournaments } from '@/data/events'
import SEO from '@/components/common/SEO'

function EventCardSkeleton() {
  return (
    <div className="flex gap-4 p-4 border rounded-xl bg-card">
      <Skeleton className="w-20 h-20 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  )
}

export default function HomePage() {
  const { getFilteredEvents, searchQuery, isFetching, hasMore, loadMoreEvents } = useEventsStore()
  const [displayCount, setDisplayCount] = useState(4)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  
  const allEvents = getFilteredEvents()
  const events = allEvents.slice(0, displayCount)
  const tournament = tournaments[0]

  const handleShowMore = async () => {
    if (displayCount < allEvents.length) {
      // If we have more events locally, just show them
      setDisplayCount(prev => prev + 8)
    } else if (hasMore) {
      // If we've exhausted local events but server has more
      setIsLoadingMore(true)
      await loadMoreEvents()
      setDisplayCount(prev => prev + 8)
      setIsLoadingMore(false)
    }
  }

  const canShowMore = displayCount < allEvents.length || hasMore

  return (
    <div className="min-h-screen">
      <SEO 
        title="Home"
        description="Experience the thrill of the World Cup 2026. Secure your tickets now for the biggest football event in history."
      />
      {/* Hero Section */}
      <section className="bg-linear-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_460px]">
            {/* Left Content */}
            <div>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl text-balance">
                World Cup Tickets
              </h1>

              <div className="flex items-center gap-4 mt-4">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  <Heart className="h-3 w-3 mr-1 fill-current" />
                  {(tournament.totalEvents * 425).toLocaleString()}
                </Badge>
              </div>

              <div className="flex items-center gap-2 mt-4 p-3 bg-primary/5 rounded-lg text-primary">
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {(38918).toLocaleString()} people viewed World Cup events in the past hour
                </span>
              </div>

              {/* Filters */}
              <div className="mt-6">
                <EventFilters />
              </div>

              {/* Events Section */}
              <div className="mt-8">
                {searchQuery && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Showing results for "{searchQuery}"
                  </p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    {isFetching && events.length === 0 ? (
                      <Skeleton className="h-6 w-48" />
                    ) : allEvents.length > 0 ? (
                      <>
                        {allEvents.length === 1
                          ? 'No events near you'
                          : `${allEvents.length} events in all locations`}
                      </>
                    ) : (
                      'No events found'
                    )}
                  </h2>
                </div>

                <div className="space-y-4">
                  {isFetching && events.length === 0
                    ? Array.from({ length: 4 }).map((_, i) => <EventCardSkeleton key={i} />)
                    : events.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))
                  }
                </div>

                {/* Show More Button */}
                {canShowMore && (
                  <div className="mt-8 flex justify-center">
                    <button 
                      onClick={handleShowMore}
                      disabled={isLoadingMore}
                      className="group relative inline-flex items-center justify-center gap-2 px-8 py-3 font-bold text-white transition-all duration-300 bg-primary rounded-xl hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                    >
                      {isLoadingMore ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Loading More...</span>
                        </>
                      ) : (
                        <>
                          <span>Show More Events</span>
                          <div className="w-4 h-4 transition-transform group-hover:translate-y-1">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                            </svg>
                          </div>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {!isFetching && events.length === 0 && (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No events match your filters. Try adjusting your search criteria.
                    </p>
                  </Card>
                )}
              </div>
            </div>

            {/* Right Sidebar - Tournament Info */}
            <aside className="hidden lg:block lg:col-span-1">
              <Card className="sticky top-24 overflow-hidden w-full max-w-md mx-auto">
                <div className="relative h-54 bg-linear-to-br from-green-600 via-green-500 to-green-400">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-5xl font-bold">WORLD</div>
                      <div className="text-5xl font-bold">CUP</div>
                      <div className="text-lg mt-2">2026</div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/30 transform rotate-45 translate-x-16 -translate-y-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-300/30 transform rotate-45 -translate-x-12 translate-y-12" />
                </div>

                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tournament.description}
                  </p>
                  <button className="text-sm text-primary hover:underline mt-2">
                    See more
                  </button>

                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">TicketHub Guarantee</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          We back every order so you can buy and sell tickets with 100% confidence.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}