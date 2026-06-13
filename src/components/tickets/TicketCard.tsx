import { MapPin, User, CalendarDays, CheckCircle2, Clock } from 'lucide-react'
import type { Order } from '@/types'
import { formatDate, formatTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export default function TicketCard({ order }: { order: Order }) {
  const { section, quantity, contactInfo, id } = order
  const now = new Date()
  const eventDate = section.eventDate && section.eventTime 
    ? new Date(`${section.eventDate}T${section.eventTime}`) 
    : now
  const isPast = eventDate < now

  return (
    <div className="relative w-full max-w-[360px] mx-auto group">
      {/* Glow Effect on Hover */}
      <div className="absolute -inset-1 bg-linear-to-r from-primary/20 to-primary/0 rounded-4xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Ticket Container */}
      <div className="relative bg-card text-card-foreground rounded-4xl shadow-lg overflow-hidden border border-border/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-20">
          <Badge 
            variant={isPast ? "secondary" : "default"} 
            className={`px-2 py-0.5 text-[10px] uppercase tracking-tighter ${!isPast ? "bg-primary text-primary-foreground" : "opacity-80"}`}
          >
            {isPast ? (
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Attended</span>
            ) : (
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Upcoming</span>
            )}
          </Badge>
        </div>

        {/* Ticket Header (Event Banner) */}
        <div className="relative h-28 bg-muted overflow-hidden">
           <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-black/20 bg-slate-900" />
           <div className="absolute bottom-3 left-6 right-6">
             <div className="text-[9px] font-black tracking-[0.2em] text-primary uppercase mb-0.5 opacity-95">FIFA WORLD CUP</div>
             <div className="text-lg font-black leading-none truncate tracking-tight text-white">{section.eventTitle || 'World Cup Match'}</div>
           </div>
        </div>

        {/* Perforation Line 1 */}
        <div className="relative flex items-center h-4 bg-card">
           <div className="absolute -left-2 w-4 h-4 rounded-full bg-background border-r border-border/40" />
           <div className="w-full border-t border-dashed border-border/80 mx-4" />
           <div className="absolute -right-2 w-4 h-4 rounded-full bg-background border-l border-border/40" />
        </div>

        {/* Ticket Details */}
        <div className="px-6 py-2 space-y-4">
          {/* Time & Place */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-0.5">
               <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-black text-muted-foreground/60">
                  <CalendarDays className="w-2.5 h-2.5" /> Date
               </div>
               <div className="text-xs font-bold leading-tight">{section.eventDate ? formatDate(section.eventDate) : 'TBD'}</div>
               <div className="text-[10px] text-muted-foreground font-medium">{section.eventTime ? formatTime(section.eventTime) : 'TBD'}</div>
            </div>
            <div className="space-y-0.5">
               <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-black text-muted-foreground/60">
                  <MapPin className="w-2.5 h-2.5" /> Venue
               </div>
               <div className="text-xs font-bold leading-tight truncate">{section.eventVenue || 'TBD Stadium'}</div>
               <div className="text-[10px] text-muted-foreground font-medium truncate">{section.eventCity || 'Qatar'}</div>
            </div>
          </div>

          {/* Seat Grid - Industrial Look */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/40">
            <div className="text-center">
              <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-0.5">Section</div>
              <div className="font-black text-base text-primary leading-none">{section.name.replace('Section ', '')}</div>
            </div>
            <div className="text-center border-x border-border/40">
              <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-0.5">Row</div>
              <div className="font-black text-base leading-none">{section.row}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-0.5">Qty</div>
              <div className="font-black text-base leading-none">{quantity}</div>
            </div>
          </div>
        </div>

        {/* Perforation Line 2 */}
        <div className="relative flex items-center h-4 bg-card">
           <div className="absolute -left-2 w-4 h-4 rounded-full bg-background border-r border-border/40" />
           <div className="w-full border-t border-dashed border-border/80 mx-4" />
           <div className="absolute -right-2 w-4 h-4 rounded-full bg-background border-l border-border/40" />
        </div>

        {/* Footer (Scanning) */}
        <div className="px-6 py-4 flex flex-col items-center">
           {/* Deterministic Barcode based on ID */}
           <div className="w-full h-12 opacity-90 mb-3 px-2">
              <div className="w-full h-full bg-foreground flex items-center justify-around gap-px p-px">
                {Array.from({ length: 40 }).map((_, i) => {
                  const charCode = id.charCodeAt(i % id.length)
                  const width = (charCode % 4) + 1
                  return (
                    <div 
                      key={i} 
                      className="bg-background h-full transition-all" 
                      style={{ width: `${width}px`, opacity: width > 2 ? 1 : 0.8 }} 
                    />
                  )
                })}
              </div>
           </div>
           
           <div className="flex justify-between items-center w-full px-1 text-[10px] text-muted-foreground font-bold tracking-tight">
             <div className="flex items-center gap-1.5 uppercase opacity-70">
               <User className="w-3 h-3"/> {contactInfo.firstName} {contactInfo.lastName}
             </div>
             <div className="font-mono bg-muted px-2 py-0.5 rounded uppercase tracking-tighter">
               #{id.substring(0, 8)}
             </div>
           </div>
        </div>

      </div>
    </div>
  )
}
