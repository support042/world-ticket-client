import { useState } from 'react'
import { Heart, Users, CheckCircle, Ticket, ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import EventCard from '@/components/events/EventCard'
import EventFilters from '@/components/events/EventFilters'
import FeaturedEventGridCard from '@/components/events/FeaturedEventGridCard'
import { useEventsStore } from '@/store/eventsStore'
import { useAuthStore } from '@/store/authStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import AuthForm from '@/components/auth/AuthForm'
import type { AuthMode } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { tournaments } from '@/data/events'
import SEO from '@/components/common/SEO'
import WorldCupDialog from '@/components/tournament/WorldCupDialog'

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
  const { 
    getFilteredEvents, 
    searchQuery, 
    isFetching, 
    currentPage, 
    totalPages, 
    goToPage 
  } = useEventsStore()
  
  const { isAuthenticated } = useAuthStore()
  
  const [showWorldCupDialog, setShowWorldCupDialog] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('signin')
  const [resellEmail, setResellEmail] = useState('')
  const [resellSubmitted, setResellSubmitted] = useState(false)

  const handleResellSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setResellSubmitted(true)
    setResellEmail('')
    setTimeout(() => {
      setResellSubmitted(false)
    }, 5000)
  }
  
  const displayedEvents = getFilteredEvents()
  const tournament = tournaments[0]

  // Helper to generate the exact page numbers array with ellipses
  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      if (start > 2) {
        pages.push('...')
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (end < totalPages - 1) {
        pages.push('...')
      }
      
      pages.push(totalPages)
    }
    return pages
  }

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
            <div className="flex flex-col justify-between">
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

                {/* Sell Tickets CTA Block */}
                <div className="mt-5 p-5 rounded-2xl border border-primary/20 bg-linear-to-r from-primary/[0.04] via-primary/[0.02] to-transparent dark:from-primary/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all duration-300 hover:border-primary/30">
                  <div className="space-y-1.5 md:max-w-[60%] flex-1">
                    <div className="flex items-center gap-1.5 text-primary font-bold text-xs tracking-wider uppercase">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>100% Safe Buy & Resell Guarantee</span>
                    </div>
                    <h3 className="font-extrabold text-base md:text-lg text-foreground tracking-tight">
                      Got Tickets to Sell? List on Ticketapoint
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Ticketapoint is the #1 secure ticket exchange. Turn your spare match tickets into cash safely. Enter your email below to get an instant buyout quote.
                    </p>
                  </div>
                  
                  <div className="w-full md:w-auto md:min-w-[320px] flex flex-col">
                    <form onSubmit={handleResellSubmit} className="flex gap-2 w-full">
                      <div className="relative flex-1">
                        <input
                          type="email"
                          placeholder="Enter your email to sell"
                          value={resellEmail}
                          onChange={(e) => setResellEmail(e.target.value)}
                          required
                          className="w-full h-10 px-3.5 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs px-4 h-10 rounded-xl transition-all hover:scale-[1.02] active:scale-98 cursor-pointer whitespace-nowrap"
                      >
                        Get Cash Offer
                      </button>
                    </form>
                    {resellSubmitted && (
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-2 flex items-center gap-1 animate-in fade-in duration-300">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Resale request received! We'll email you shortly.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Filters */}
                <div id="filters-section" className="mt-6 scroll-mt-24">
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
                      {isFetching && displayedEvents.length === 0 ? (
                        <Skeleton className="h-6 w-48" />
                      ) : displayedEvents.length > 0 ? (
                        <>
                          {displayedEvents.length === 1
                            ? 'No events near you'
                            : `${displayedEvents.length} events in all locations`}
                        </>
                      ) : (
                        'No events found'
                      )}
                    </h2>
                  </div>

                  <div className={`space-y-4 transition-all duration-200 ${isFetching ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
                    {isFetching && displayedEvents.length === 0
                      ? Array.from({ length: 4 }).map((_, i) => <EventCardSkeleton key={i} />)
                      : displayedEvents.map((event) => (
                          <EventCard key={event.id} event={event} />
                        ))
                    }
                  </div>

                  {/* Numbered Pagination Section */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1.5 mt-8 mb-4">
                      {/* Previous Button */}
                      <button
                        onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
                        disabled={currentPage === 1 || isFetching}
                        className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        aria-label="Previous page"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      {/* Page Numbers */}
                      {getPageNumbers().map((pageNum, idx) => {
                        if (pageNum === '...') {
                          return (
                            <span 
                              key={`ellipsis-${idx}`} 
                              className="px-2 py-1 text-muted-foreground select-none"
                            >
                              ...
                            </span>
                          )
                        }

                        const isPageActive = pageNum === currentPage
                        return (
                          <button
                            key={`page-${pageNum}`}
                            onClick={() => goToPage(pageNum as number)}
                            disabled={isFetching}
                            className={`w-9 h-9 flex items-center justify-center rounded-full font-bold text-sm transition-all cursor-pointer ${
                              isPageActive 
                                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-105' 
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}

                      {/* Next Button */}
                      <button
                        onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages || isFetching}
                        className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        aria-label="Next page"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {!isFetching && displayedEvents.length === 0 && (
                    <Card className="p-8 text-center mt-4">
                      <p className="text-muted-foreground">
                        No events match your filters. Try adjusting your search criteria.
                      </p>
                    </Card>
                  )}
                </div>

                {/* Mobile-only About World Cup Card */}
                <div className="mt-6 lg:hidden">
                  <Card className="p-5 border border-border/80 bg-card rounded-2xl shadow-xs">
                    <h3 className="font-bold text-base text-foreground mb-2.5">
                      About World Cup
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Get ready for the ultimate soccer spectacle of 2026, spanning the United States, Canada, and Mexico, where 48 nations will compete across 104 matches in 39 unforgettable days. The...{' '}
                      <button
                        onClick={() => setShowWorldCupDialog(true)}
                        className="text-primary hover:underline font-semibold cursor-pointer inline-flex items-center text-xs"
                      >
                        Read more
                      </button>
                    </p>
                    
                    <div className="mt-5 flex justify-center">
                      <button
                        onClick={() => {
                          const element = document.getElementById('filters-section');
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          } else {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className="bg-muted hover:bg-muted/80 text-foreground font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
                      >
                        See events
                      </button>
                    </div>
                  </Card>
                </div>
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
                  <button 
                    onClick={() => setShowWorldCupDialog(true)}
                    className="text-sm text-primary hover:underline font-semibold mt-2 cursor-pointer"
                  >
                    See more
                  </button>

                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Ticketapoint Guarantee</h3>
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

      {/* Featured updates just for you section */}
      <section className="border-t bg-muted/10 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight mb-8 text-foreground">
            Event updates just for you
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {isFetching && displayedEvents.length === 0 ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="space-y-3">
                  <Skeleton className="aspect-square rounded-2xl w-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))
            ) : (
              displayedEvents.slice(0, 4).map((event) => (
                <FeaturedEventGridCard key={event.id} event={event} />
              ))
            )}
          </div>

          {/* Recommendation Banner */}
          {!isAuthenticated && (
            <div className="mt-8 bg-[#ecfcce] dark:bg-lime-950/25 border border-[#d2f3a4] dark:border-lime-900/40 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 shadow-xs">
              <div className="flex items-center gap-3">
                <Ticket className="h-6 w-6 text-[#3a690d] dark:text-lime-400 rotate-12 shrink-0" />
                <span className="text-[#2b4d0a] dark:text-lime-200 font-extrabold text-sm md:text-base tracking-tight text-center md:text-left">
                  Want better ticket recommendations?
                </span>
              </div>
              
              <div className="hidden md:block h-6 w-[1px] bg-[#2b4d0a]/20 dark:bg-lime-400/20 mx-2" />
              
              <button
                onClick={() => {
                  setAuthMode('signin')
                  setAuthDialogOpen(true)
                }}
                className="bg-[#3a690d] hover:bg-[#2b4e09] dark:bg-lime-600 dark:hover:bg-lime-700 text-white font-bold text-xs md:text-sm px-6 py-2.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
              >
                Sign in / Create an account
              </button>
            </div>
          )}
        </div>
      </section>

      {/* World Cup Dialog */}
      <WorldCupDialog
        open={showWorldCupDialog}
        onOpenChange={setShowWorldCupDialog}
      />

      {/* Auth Dialog */}
      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {authMode === 'signin' ? 'Sign In' : 'Create Account'}
            </DialogTitle>
          </DialogHeader>
          <AuthForm
            mode={authMode}
            onToggleMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
            onSuccess={() => setAuthDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}