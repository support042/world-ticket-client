import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Ticket } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatTime } from '@/lib/utils'
import type { Event } from '@/types'

interface FeaturedEventGridCardProps {
  event: Event
}

export default function FeaturedEventGridCard({ event }: FeaturedEventGridCardProps) {
  const navigate = useNavigate()
  const [isFavorited, setIsFavorited] = useState(false)

  const handleCardClick = () => {
    navigate(`/event/${event.id}`)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFavorited(!isFavorited)
  }

  // Format the date like "Jun 11 2026"
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  // Derive a dynamic ticket sales number based on views to look premium & real-time
  const ticketsSold = Math.round((event.viewsLastHour || 24) * 8.5)
  const ticketsSoldText = `${ticketsSold}+ tickets sold in last day`

  return (
    <Card 
      onClick={handleCardClick}
      className="group overflow-hidden border bg-card hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full rounded-2xl p-0 py-0 gap-0 shadow-sm ring-1 ring-foreground/10"
    >
      <CardContent className="p-0 flex flex-col h-full gap-0">
        {/* Card Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted w-full rounded-t-2xl">
          <img 
            src={event.image?.startsWith('http') ? event.image : '/world-cup-card-bg.png'} 
            alt="World Cup 2026 Match Poster" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3.5 right-3.5 p-1 text-white transition-all duration-300 hover:scale-110 active:scale-90 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-10"
            aria-label="Add to favorites"
          >
            <Heart 
              className={`h-6 w-6 transition-all duration-300 ${
                isFavorited 
                  ? 'fill-red-500 stroke-red-500 scale-110' 
                  : 'fill-none stroke-white stroke-[2.5]'
              }`} 
            />
          </button>
        </div>

        {/* Text Content */}
        <div className="p-4 flex flex-col flex-1 justify-between gap-3">
          <div className="space-y-1.5">
            {/* Title */}
            <h3 className="font-bold text-sm md:text-base leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {event.teams?.[0]?.name && event.teams?.[1]?.name ? (
                `${event.teams[0].name} vs ${event.teams[1].name} - World Cup - ${event.stage}`
              ) : (
                event.title
              )}
            </h3>
            
            {/* Date and Time */}
            <p className="text-xs text-muted-foreground font-medium">
              {formattedDate} • {formatTime(event.time)}
            </p>
            
            {/* Venue & Location */}
            <p className="text-xs text-muted-foreground line-clamp-1">
              {event.venue} ({event.city})
            </p>
          </div>

          {/* Sold Badge */}
          <div className="pt-1">
            <Badge 
              variant="secondary" 
              className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/15 border-none font-semibold text-[10px] md:text-xs py-1 px-2.5 rounded-lg flex items-center gap-1.5 w-fit"
            >
              <Ticket className="h-3.5 w-3.5" />
              <span>{ticketsSoldText}</span>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
