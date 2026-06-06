import { Calendar, Ticket, DollarSign, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface StatsCardsProps {
  totalEvents: number
  totalTickets: number
  totalRevenue: number
}

export default function StatsCards({ totalEvents, totalTickets, totalRevenue }: StatsCardsProps) {
  // Sections are not embedded in the list API response so ticket count and revenue
  // are derived from ticketsLeftPercent + priceRange — flag them as estimates.
  const hasEstimates = true

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Events — exact from API */}
        <Card className="border-border/50 shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold tabular-nums">{totalEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Tickets — estimated from ticketsLeftPercent */}
        <Card className="border-border/50 shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Ticket className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm text-muted-foreground">Available Tickets</p>
                  {hasEstimates && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px] text-xs">
                        Estimated from ticket availability percentage. Exact count available per event section.
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <p className="text-2xl font-bold tabular-nums">
                  {totalTickets > 0
                    ? <>~ {totalTickets.toLocaleString()}</>
                    : <span className="text-muted-foreground text-lg">—</span>
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Potential Revenue — estimated from priceRange midpoint */}
        <Card className="border-border/50 shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm text-muted-foreground">Potential Revenue</p>
                  {hasEstimates && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[220px] text-xs">
                        Estimated from average ticket price × available tickets. Exact figures available per section.
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <p className="text-2xl font-bold tabular-nums">
                  {totalRevenue > 0
                    ? <>~ {formatCurrency(totalRevenue)}</>
                    : <span className="text-muted-foreground text-lg">—</span>
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}