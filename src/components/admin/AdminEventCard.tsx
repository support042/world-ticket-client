// import { Plus, Edit, Trash2, Calendar, MapPin } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import { formatCurrency, formatDate } from '@/lib/utils'
// import type { Event, Section } from '@/types'

// interface AdminEventCardProps {
//   event: Event
//   onAddSection: (eventId: string) => void
//   onEditEvent: (event: Event) => void
//   onDeleteEvent: (eventId: string) => void
//   onEditSection: (eventId: string, section: Section) => void
//   onDeleteSection: (eventId: string, sectionId: string) => void
// }

// export default function AdminEventCard({
//   event,
//   onAddSection,
//   onEditEvent,
//   onDeleteEvent,
//   onEditSection,
//   onDeleteSection
// }: AdminEventCardProps) {
//   return (
//     <div className="border rounded-lg p-4">
//       <div className="flex items-start justify-between gap-4">
//         <div className="flex items-start gap-4">
//           <div className="h-20 w-28 rounded-lg bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
//             <div className="text-center">
//               <div>WORLD</div>
//               <div>CUP</div>
//             </div>
//           </div>

//           <div>
//             <h3 className="font-semibold">{event.title}</h3>
//             <p className="text-sm text-muted-foreground">{event.stage}</p>
//             <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
//               <span className="flex items-center gap-1">
//                 <Calendar className="h-3.5 w-3.5" />
//                 {formatDate(event.date)}
//               </span>
//               <span className="flex items-center gap-1">
//                 <MapPin className="h-3.5 w-3.5" />
//                 {event.city}, {event.country}
//               </span>
//             </div>
//             <div className="flex items-center gap-2 mt-2">
//               <Badge variant="outline">{event.sections.length} sections</Badge>
//               <Badge variant="outline">{event.ticketsLeftPercent}% left</Badge>
//               <Badge variant="outline">
//                 {formatCurrency(event.priceRange.min)} - {formatCurrency(event.priceRange.max)}
//               </Badge>
//             </div>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <Button variant="outline" size="sm" onClick={() => onAddSection(event.id)}>
//             <Plus className="h-4 w-4 mr-1" />
//             Section
//           </Button>
//           <Button variant="outline" size="sm" onClick={() => onEditEvent(event)}>
//             <Edit className="h-4 w-4" />
//           </Button>
//           <Button variant="outline" size="sm" onClick={() => onDeleteEvent(event.id)}>
//             <Trash2 className="h-4 w-4 text-destructive" />
//           </Button>
//         </div>
//       </div>

//       {/* Sections */}
//       {event.sections.length > 0 && (
//         <div className="mt-4 pt-4 border-t">
//           <p className="text-sm font-medium mb-2">Sections:</p>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
//             {event.sections.map((section) => (
//               <div
//                 key={section.id}
//                 className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm"
//               >
//                 <div>
//                   <span className="font-medium">Section {section.name}</span>
//                   <span className="text-muted-foreground"> - Row {section.row}</span>
//                   <span className="text-muted-foreground"> ({section.available} tickets)</span>
//                   <span className="font-medium text-primary ml-2">
//                     {formatCurrency(section.price)}
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="h-7 w-7 p-0"
//                     onClick={() => onEditSection(event.id, section)}
//                   >
//                     <Edit className="h-3 w-3" />
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="h-7 w-7 p-0"
//                     onClick={() => onDeleteSection(event.id, section.id)}
//                   >
//                     <Trash2 className="h-3 w-3 text-destructive" />
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// components/admin/AdminEventCard.tsx
import { useNavigate } from 'react-router-dom'
import { Edit, Trash2, MapPin, Clock, Ticket, Layers } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatTime, formatCurrency } from '@/lib/utils'
import type { Event } from '@/types'

interface AdminEventCardProps {
  event: Event
  onEditEvent: (event: Event) => void
  onDeleteEvent: (eventId: string) => void
}

export default function AdminEventCard({
  event,
  onEditEvent,
  onDeleteEvent
}: AdminEventCardProps) {
  const navigate = useNavigate()
  const urgencyBadge = event.ticketsLeftPercent <= 5

  const handleCardClick = () => {
    navigate(`/admin/events/${event.id}/sections`)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEditEvent(event)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDeleteEvent(event.id)
  }

  return (
    <Card 
      onClick={handleCardClick}
      className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      <CardContent className="p-0">
        <div className="flex flex-row">
          
          {/* Date Badge */}
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

          {/* Event Info */}
          <div className="flex-1 p-2 md:p-3 lg:p-4">
            <div className="flex items-start gap-1.5 md:gap-2 lg:gap-3">
              
              {/* Team Flags */}
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

                {/* Event details */}
                <div className="flex flex-wrap items-center gap-x-2 md:gap-x-3 gap-y-0.5 md:gap-y-1 mt-1 md:mt-1.5">
                  <span className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs lg:text-sm text-muted-foreground">
                    <Clock className="h-2.5 w-2.5 md:h-3 md:w-3 lg:h-3.5 lg:w-3.5" />
                    {formatTime(event.time)}
                  </span>
                  <span className="text-[10px] md:text-xs lg:text-sm text-muted-foreground hidden sm:inline">•</span>
                  <span className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs lg:text-sm text-muted-foreground">
                    <MapPin className="h-2.5 w-2.5 md:h-3 md:w-3 lg:h-3.5 lg:w-3.5" />
                    <span className="line-clamp-1">{event.city}, {event.country}</span>
                  </span>
                </div>

                {/* Badges row - responsive */}
                <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-1.5 md:mt-2">
                  {/* Sections count badge */}
                  <Badge variant="secondary" className="text-[10px] md:text-xs gap-0.5 md:gap-1">
                    <Layers className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    {(event.sections || []).length} sections
                  </Badge>
                  
                  {/* Urgency badge */}
                  {urgencyBadge && (
                    <Badge className="bg-red-400/50 text-red-500 text-[8px] md:text-[10px] lg:text-xs px-1 md:px-1.5 py-0">
                      <Ticket className="h-2 w-2 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3 mr-0.5 md:mr-1" />
                      Only {event.ticketsLeftPercent}% left
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="flex-shrink-0 p-2 md:p-3 lg:p-4 flex flex-col items-end justify-between border-l bg-muted/30 min-w-[80px] md:min-w-[100px] lg:min-w-[120px]">
            <div className="text-right">
              <p className="text-[9px] md:text-xs text-muted-foreground">From</p>
              <p className="text-sm md:text-lg lg:text-xl font-bold text-primary whitespace-nowrap">
                {formatCurrency(event.priceRange?.min || 0)}
              </p>
            </div>
            <div className="flex items-center gap-1 md:gap-2 mt-1 md:mt-2">
              <Button 
                size="sm" 
                variant="ghost"
                className="h-6 md:h-7 lg:h-8 w-6 md:w-7 lg:w-8 p-0"
                onClick={handleEditClick}
              >
                <Edit className="h-3 w-3 md:h-3.5 md:w-3.5" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                className="h-6 md:h-7 lg:h-8 w-6 md:w-7 lg:w-8 p-0 text-destructive hover:text-destructive"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}