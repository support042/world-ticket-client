import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  Ticket,
  MapPin,
  CalendarDays,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Printer,
  Share2,
  ExternalLink,
} from 'lucide-react'
import { ordersService } from '@/services/orders.service'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import SEO from '@/components/common/SEO'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import type { Order } from '@/types'

/** Generate fallback ticket stubs when the backend doesn't include them on the order */
function generateFallbackTickets(order: Order) {
  return Array.from({ length: order.quantity }).map((_, idx) => ({
    id: `tkt_${order.id}_${idx}`,
    barcode: `TKTAPOINT-${order.id}-${idx}`,
    seatNumber: `Row ${order.section.row || 'A'} - Seat ${12 + idx}`,
    issuedAt: order.createdAt,
  }))
}

export default function TicketViewerPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(!!orderId)   // false from the start if no ID
  const [error, setError] = useState<string | null>(orderId ? null : 'No order ID provided.')

  useEffect(() => {
    if (!orderId) return   // no setState needed — error was already initialised above

    let isMounted = true
    ordersService
      .getOrderById(orderId)
      .then((fetchedOrder) => {
        if (!isMounted) return
        if (fetchedOrder) {
          setOrder(fetchedOrder)
        } else {
          setError('Order not found. Please check My Tickets for your reservations.')
        }
        setLoading(false)
      })
      .catch((err: any) => {
        if (!isMounted) return
        logger.error('TicketViewerPage - failed to load order:', err)
        setError(err?.message || 'Failed to load your tickets. Please try again.')
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [orderId])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My World Cup Ticket',
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Ticket link copied to clipboard!')
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
        <SEO title="Loading Ticket..." />
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <Ticket className="absolute w-5 h-5 text-primary animate-pulse" />
        </div>
        <p className="text-sm text-muted-foreground font-medium animate-pulse">Fetching your tickets…</p>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error || !order) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 text-center space-y-5">
        <SEO title="Ticket Not Found" />
        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 rounded-full flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-7 w-7 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Ticket not found</h2>
        <p className="text-sm text-muted-foreground">{error || 'We could not locate this order.'}</p>
        <Link to="/my-tickets">
          <Button className="w-full rounded-xl mt-2">Back to My Tickets</Button>
        </Link>
      </div>
    )
  }

  // ── Order not yet paid ───────────────────────────────────────────────────────
  const isPaid = order.status === 'paid' || order.status === 'completed'
  if (!isPaid) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 text-center space-y-5">
        <SEO title="Tickets Pending" />
        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 rounded-full flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800">
          <Loader2 className="h-7 w-7 text-amber-500 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Tickets not yet issued</h2>
        <p className="text-sm text-muted-foreground">
          This order has status <strong className="uppercase text-foreground">{order.status}</strong>.
          Ticket QR codes are only available for confirmed, paid orders.
        </p>
        <Link to="/my-tickets">
          <Button variant="outline" className="w-full rounded-xl mt-2">Back to My Tickets</Button>
        </Link>
      </div>
    )
  }

  const section = order.section
  const tickets = (order.tickets && order.tickets.length > 0)
    ? order.tickets
    : generateFallbackTickets(order)

  const eventTitle = order.event?.title || (section as any).eventTitle || 'World Cup Match'
  const eventDate = order.event?.date || (section as any).eventDate
  const eventTime = order.event?.time || (section as any).eventTime
  const eventVenue = order.event?.venue || (section as any).eventVenue || 'Stadium'
  const eventCity = order.event?.city || (section as any).eventCity || 'Qatar'

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <SEO title={`Tickets — ${eventTitle}`} />

      <div className="max-w-2xl mx-auto space-y-8">

        {/* ── Back Navigation ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/my-tickets')}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            My Tickets
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 bg-card shadow-xs"
              onClick={() => window.print()}
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 bg-card shadow-xs"
              onClick={handleShare}
            >
              <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share
            </Button>
          </div>
        </div>

        {/* ── Event Header Card ──────────────────────────────────────────── */}
        <div className="rounded-2xl bg-card border border-border shadow-xs overflow-hidden">
          {/* Green confirmed strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Confirmed & Paid
                </Badge>
              </div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">FIFA World Cup 2026</p>
              <h1 className="text-xl font-black text-foreground leading-snug truncate">{eventTitle}</h1>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Total Paid</p>
              <p className="text-2xl font-black text-foreground">{formatCurrency(order.totalAmount)}</p>
            </div>
          </div>

          {/* Event Meta Row */}
          <div className="px-6 pb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="flex items-start gap-2">
              <CalendarDays className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground font-medium">Date</p>
                <p className="font-bold text-foreground">{eventDate ? formatDate(eventDate) : 'TBD'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground font-medium">Kickoff</p>
                <p className="font-bold text-foreground">{eventTime ? formatTime(eventTime) : 'TBD'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground font-medium">Venue</p>
                <p className="font-bold text-foreground truncate">{eventVenue}</p>
                <p className="text-muted-foreground">{eventCity}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Ticket className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground font-medium">Section</p>
                <p className="font-bold text-foreground">Sec {section.name} • Row {section.row}</p>
                <p className="text-muted-foreground">{tickets.length} ticket{tickets.length > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tickets ────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
            <Ticket className="w-4 h-4 text-primary" />
            Entry Passes ({tickets.length})
          </h2>

          {tickets.map((tkt, idx) => (
            <div
              key={tkt.id}
              className="relative bg-card border border-border rounded-2xl shadow-xs overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Ticket side cutouts (visual perforations) */}
              <div className="hidden sm:block absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-background border-r border-border -translate-y-1/2 z-10" />
              <div className="hidden sm:block absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-background border-l border-border -translate-y-1/2 z-10" />

              <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border">
                {/* Left: Match info */}
                <div className="p-5 flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-mono py-0.5">
                      Ticket {idx + 1} of {tickets.length}
                    </Badge>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest">World Cup Admission</p>
                    <h3 className="text-base font-bold text-foreground leading-snug">{eventTitle}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground font-medium mb-0.5">Seat</p>
                      <p className="font-bold text-foreground">{tkt.seatNumber || `Row ${section.row} - Seat ${12 + idx}`}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium mb-0.5">Section / Row</p>
                      <p className="font-bold text-foreground">Sec {section.name} • Row {section.row}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border text-xs text-muted-foreground">
                    <User className="w-3.5 h-3.5" />
                    <span>{order.contactInfo.firstName} {order.contactInfo.lastName}</span>
                  </div>
                </div>

                {/* Right: QR code */}
                <div className="p-5 w-full sm:w-52 bg-muted/20 flex flex-col items-center justify-center text-center gap-3">
                  <div className="bg-white p-2.5 border border-border rounded-xl shadow-xs">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(tkt.barcode)}&color=0f172a`}
                      alt={`Ticket ${idx + 1} QR Code`}
                      className="w-[130px] h-[130px]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/130x130/f1f5f9/0f172a?text=QR+CODE`
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Scan at Gate</p>
                    <p className="text-[10px] font-mono font-bold text-foreground mt-0.5">
                      #{tkt.barcode.split('-').pop()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Receipt Summary ────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl shadow-xs p-5 space-y-3">
          <h3 className="text-sm font-bold text-foreground">Receipt Details</h3>
          <Separator />
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono text-foreground">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stripe Ref</span>
              <span className="font-mono text-foreground truncate max-w-[180px]">
                {order.stripePaymentIntentId || order.stripeSessionId || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="text-foreground">{order.contactInfo.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="text-emerald-500 font-bold uppercase tracking-wider">PAID</span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between text-sm font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <Link to="/my-tickets" className="flex-1">
            <Button variant="outline" className="w-full rounded-xl gap-2 shadow-xs">
              <ChevronLeft className="w-4 h-4" />
              All My Tickets
            </Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button className="w-full rounded-xl gap-2">
              <ExternalLink className="w-4 h-4" />
              Explore More Events
            </Button>
          </Link>
        </div>

      </div>
    </div>
  )
}
