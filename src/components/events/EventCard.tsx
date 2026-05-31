import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, Ticket } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatTime, formatCurrency } from '@/lib/utils'
import type { Event } from '@/types'

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate()
  const urgencyBadge = event.ticketsLeftPercent <= 5

  const handleCardClick = () => {
    navigate(`/event/${event.id}`)
  }

  return (
    <Card 
      onClick={handleCardClick}
      className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      <CardContent className="p-0">
        {/* Always horizontal - removed flex-col sm:flex-row, now always flex-row */}
        <div className="flex flex-row">
          
          {/* Date Badge - Smaller on mobile */}
          <div className="flex-shrink-0 bg-muted p-2 md:p-3 flex flex-col items-center justify-center min-w-[60px] md:min-w-[70px] lg:min-w-[80px]">
            <span className="text-[10px] md:text-xs lg:text-sm font-medium text-muted-foreground">
              {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
            </span>
            <span className="text-base md:text-xl lg:text-2xl font-bold">
              {new Date(event.date).getDate()}
            </span>
            <span className="text-[8px] md:text-[10px] lg:text-xs text-muted-foreground">
              {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
          </div>

          {/* Event Info - Responsive padding */}
          <div className="flex-1 p-2 md:p-3 lg:p-4">
            <div className="flex items-start gap-1.5 md:gap-2 lg:gap-3">
              
              {/* Team Flags - Responsive sizing */}
              <div className="flex -space-x-1 md:-space-x-2">
                {(event.teams || []).map((team, idx) => (
                  <div
                    key={idx}
                    className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 bg-muted rounded-full overflow-hidden border-2 border-background flex items-center justify-center p-0.5"
                    title={team.name}
                  >
                    {team.flag?.startsWith('http') ? (
                      <img 
                        src={team.flag} 
                        alt={team.name} 
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-sm md:text-base lg:text-lg">{team.flag}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1 md:gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-xs md:text-base lg:text-lg group-hover:text-primary transition-colors line-clamp-2 md:line-clamp-1">
                      {event.teams?.[0]?.name || 'TBD'} vs.{' '}
                      {event.teams?.[1]?.name || 'TBD'}
                    </h3>
                    <p className="text-[10px] md:text-xs lg:text-sm text-muted-foreground line-clamp-1">
                      {event.stage}
                    </p>
                  </div>
                </div>

                {/* Event details row - responsive text and spacing */}
                <div className="flex flex-wrap items-center gap-x-2 md:gap-x-3 gap-y-0.5 md:gap-y-1 mt-1 md:mt-1.5">
                  <span className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs lg:text-sm text-muted-foreground">
                    <Clock className="h-2.5 w-2.5 md:h-3 md:w-3 lg:h-3.5 lg:w-3.5" />
                    {formatTime(event.time)}
                  </span>
                  <span className="text-[10px] md:text-xs lg:text-sm text-muted-foreground hidden sm:inline">•</span>
                  <span className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs lg:text-sm text-muted-foreground">
                    <MapPin className="h-2.5 w-2.5 md:h-3 md:w-3 lg:h-3.5 lg:w-3.5" />
                    <span className="line-clamp-1">{event.city}</span>
                  </span>
                </div>

                {/* Urgency Badge - responsive */}
                {urgencyBadge && (
                  <Badge className="mt-1 md:mt-1.5 bg-red-400/50 text-red-500 text-[8px] md:text-[10px] lg:text-xs px-1 md:px-1.5 py-0">
                    <Ticket className="h-2 w-2 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3 mr-0.5 md:mr-1" />
                    Only {event.ticketsLeftPercent}% left
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Price & Action - Responsive width and padding */}
          <div className="flex-shrink-0 p-2 md:p-3 lg:p-4 flex flex-col items-end justify-between border-l bg-muted/30 min-w-[80px] md:min-w-[100px] lg:min-w-[120px]">
            <div className="text-right">
              <p className="text-[9px] md:text-xs text-muted-foreground">From</p>
              <p className="text-sm md:text-lg lg:text-xl font-bold text-primary whitespace-nowrap">
                {formatCurrency(event.priceRange.min)}
              </p>
            </div>
            <Button 
              size="sm" 
              className="mt-1 md:mt-2 text-[10px] md:text-xs h-6 md:h-7 lg:h-9 px-2 md:px-3 lg:px-4 transition-all duration-200 group-hover:bg-primary group-hover:text-white group-hover:scale-105"
            >
              See tickets
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}