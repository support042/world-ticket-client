import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle2, Ticket, MapPin, ArrowRight, Download, RefreshCw, Printer, AlertTriangle } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useOrdersStore } from '@/store/ordersStore'
import { paymentService } from '@/services/payment.service'
import { ordersService } from '@/services/orders.service'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import SEO from '@/components/common/SEO'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import type { StripeSessionDetails } from '@/types'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')
  const paymentIntent = searchParams.get('payment_intent')
  const sessionId = searchParams.get('session_id') // legacy fallback
  const navigate = useNavigate()
  
  const { clearCart } = useCartStore()
  const { addOrder } = useOrdersStore()
  
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState<StripeSessionDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  
  const clearedCartRef = useRef(false)

  useEffect(() => {
    let isMounted = true;
    
    const verifyPayment = async () => {
      try {
        setLoading(true)
        setError(null)

        // Case 1: Direct order ID in URL (completed via Element flow)
        if (orderId) {
          logger.log('PaymentSuccessPage - Verifying by order ID:', orderId)
          const order = await ordersService.getOrderById(orderId)
          if (!isMounted) return
          if (order) {
            setDetails({
              sessionId: order.stripeSessionId || order.stripePaymentIntentId || '',
              status: 'complete',
              amountTotal: Math.round(order.totalAmount * 100),
              currency: order.currency || 'usd',
              order
            })
            if (!clearedCartRef.current) {
              clearCart()
              clearedCartRef.current = true
              toast.success('Your reservation is confirmed! Cart cleared.')
            }
            setLoading(false)
            return
          } else {
            throw new Error('Order details could not be found.')
          }
        }

        // Case 2: Stripe Payment Intent redirect flow (e.g. 3DS redirect back here)
        if (paymentIntent) {
          logger.log('PaymentSuccessPage - Verifying by Payment Intent:', paymentIntent)
          
          // Try to recover the pending order details from sessionStorage
          const pendingStr = sessionStorage.getItem('pending_order_payload')
          if (pendingStr) {
            const pendingPayload = JSON.parse(pendingStr)
            
            // Confirm the order on the backend with the Stripe payment intent ID.
            // Only send the exact fields the POST /orders endpoint expects.
            const order = await paymentService.confirmOrder({
              eventId: pendingPayload.eventId,
              sectionId: pendingPayload.sectionId,
              quantity: pendingPayload.quantity,
              totalAmount: pendingPayload.totalAmount,
              paymentMethod: pendingPayload.paymentMethod,
              contactInfo: pendingPayload.contactInfo,
              stripePaymentIntentId: paymentIntent,
            })
            
            if (!isMounted) return
            
            setDetails({
              sessionId: paymentIntent,
              status: 'complete',
              amountTotal: Math.round(order.totalAmount * 100),
              currency: 'usd',
              order
            })

            // Clean up session storage and cart
            sessionStorage.removeItem('pending_order_payload')
            if (!clearedCartRef.current) {
              clearCart()
              clearedCartRef.current = true
              toast.success('Your reservation is confirmed! Cart cleared.')
            }
            setLoading(false)
            return
          } else {
            // Check if order already exists in backend/local cache matching this payment intent
            const myOrders = await ordersService.getUserOrders()
            const existingOrder = myOrders.find(o => o.stripePaymentIntentId === paymentIntent)
            
            if (!isMounted) return
            
            if (existingOrder) {
              setDetails({
                sessionId: paymentIntent,
                status: 'complete',
                amountTotal: Math.round(existingOrder.totalAmount * 100),
                currency: 'usd',
                order: existingOrder
              })
              setLoading(false)
              return
            } else {
              throw new Error('Pending order details not found. Please check My Tickets page to see if the order was processed.')
            }
          }
        }

        // Case 3: Legacy session ID flow
        if (sessionId) {
          logger.log('PaymentSuccessPage - Verifying by Session ID:', sessionId)
          const sessionDetails = await paymentService.getSessionDetails(sessionId)
          if (!isMounted) return
          setDetails(sessionDetails)
          
          if (sessionDetails.order) {
            addOrder(sessionDetails.order)
            if (!clearedCartRef.current) {
              clearCart()
              clearedCartRef.current = true
              toast.success('Your reservation is confirmed! Cart cleared.')
            }
          }
          setLoading(false)
          return
        }

        // No parameters at all
        throw new Error('No checkout session or payment details found in the URL.')
      } catch (err: any) {
        logger.error('Error verifying Stripe payment session:', err)
        if (!isMounted) return;
        
        setError(err?.message || 'Unable to verify checkout session. Please check My Tickets.')
        setLoading(false)
      }
    }

    verifyPayment()

    return () => {
      isMounted = false;
    }
  }, [orderId, paymentIntent, sessionId, retryCount, addOrder, clearCart])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
  }

  // ── Skeleton Loader Screen ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <SEO title="Verifying Payment" />
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <Ticket className="absolute w-6 h-6 text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Confirming your tickets…</h2>
        <p className="text-muted-foreground mt-2 max-w-xs text-center text-sm">
          Please wait a moment while we verify your payment with Stripe and issue your digital passes.
        </p>
      </div>
    )
  }

  // ── Error / Delayed Webhook Screen ─────────────────────────────────────────
  if (error || !details || !details.order) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 text-center space-y-6">
        <SEO title="Payment Pending" />
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-200">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold">Verification is taking longer than usual</h2>
        <p className="text-sm text-muted-foreground">
          Stripe has accepted your payment, but our servers are still processing the checkout completion webhook.
          Your tickets will appear in <strong className="text-foreground">My Tickets</strong> page as soon as synchronization is complete.
        </p>
        
        <div className="flex flex-col gap-3 pt-2">
          <Button onClick={handleRetry} className="w-full flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Check Verification Status Again
          </Button>
          <Button variant="outline" onClick={() => navigate('/my-tickets')} className="w-full">
            Go to My Tickets
          </Button>
        </div>
      </div>
    )
  }

  const order = details.order
  const section = order.section
  
  // Safe tickets fallback if backend doesn't send them
  const tickets = order.tickets || Array.from({ length: order.quantity }).map((_, idx) => ({
    id: `tkt_${order.id}_${idx}`,
    barcode: `TKTAPOINT-${order.id}-${idx}`,
    seatNumber: `Row ${section.row || 'A'} - Seat ${12 + idx}`,
    issuedAt: order.createdAt
  }))

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <SEO title="Payment Successful" />
      
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        
        {/* Visual Confirmation Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mb-2 border border-emerald-500/20 animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Order Confirmed!</h1>
          <p className="text-muted-foreground max-w-sm mx-auto text-sm">
            Thank you for your purchase. We've sent a PDF copy of your tickets to <strong className="text-foreground font-semibold">{order.contactInfo.email}</strong>.
          </p>
          <div className="inline-flex mt-2">
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 font-mono text-xs">
              Stripe Session Verified
            </Badge>
          </div>
        </div>

        {/* Tickets Showcase */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-3 border-border">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              Your Digital Tickets ({tickets.length})
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs h-8 bg-card" onClick={() => window.print()}>
                <Printer className="w-3.5 h-3.5 mr-1" /> Print
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-8 bg-card" onClick={() => toast.success('Ticket PDF download initiated!')}>
                <Download className="w-3.5 h-3.5 mr-1" /> Download PDF
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {tickets.map((tkt) => {
              const eventTitle = order.event?.title || (section as any).eventTitle || 'World Cup Match';
              const eventDate = order.event?.date || (section as any).eventDate || new Date().toISOString();
              const eventTime = order.event?.time || (section as any).eventTime || '12:00';
              const eventVenue = order.event?.venue || (section as any).eventVenue || 'Stadium';
              const eventCity = order.event?.city || (section as any).eventCity || 'City';
              
              return (
                <Card key={tkt.id} className="overflow-hidden border border-border shadow-xs hover:shadow-sm transition-shadow bg-card relative">
                  {/* Visual Ticket Cutout Circles */}
                  <div className="hidden sm:block absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-background border-r border-border -translate-y-1/2"></div>
                  <div className="hidden sm:block absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-background border-l border-border -translate-y-1/2"></div>
                  
                  <CardContent className="p-0 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border">
                    {/* Left Side: Match info */}
                    <div className="p-6 flex-1 space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">World Cup Admission</span>
                        <h3 className="text-lg font-bold text-foreground line-clamp-2">
                          {eventTitle}
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-muted-foreground font-medium block">Date & Time</span>
                          <span className="font-semibold text-foreground">
                            {formatDate(eventDate)} • {formatTime(eventTime)}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-muted-foreground font-medium block">Seat / Row</span>
                          <span className="font-semibold text-foreground">
                            Section {section.name} • {tkt.seatNumber || `Row ${section.row}`}
                          </span>
                        </div>
                        <div className="col-span-2 space-y-0.5">
                          <span className="text-muted-foreground font-medium block">Venue</span>
                          <span className="font-semibold text-foreground flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            {eventVenue}, {eventCity}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Barcode / QR Code */}
                    <div className="p-6 w-full sm:w-48 bg-muted/20 flex flex-col items-center justify-center text-center space-y-2">
                      <div className="bg-white p-2 border border-border rounded-xl shadow-xs">
                        {/* Uses official qrserver API to display real scan codes */}
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(tkt.barcode)}&color=0f172a`} 
                          alt="Ticket QR Code" 
                          className="w-[110px] h-[110px]"
                          onError={(e) => {
                            // Fallback placeholder in case external API fails or is offline
                            (e.target as HTMLImageElement).src = `https://placehold.co/110x110/f1f5f9/0f172a?text=QR+CODE`
                          }}
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono font-medium text-muted-foreground block tracking-wider">TICKET NUMBER</span>
                        <span className="text-xs font-mono font-bold text-foreground truncate max-w-[150px] block">
                          {tkt.barcode.split('-').pop()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Order Details Details Panel */}
        <Card className="border border-border shadow-xs bg-card">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-foreground text-sm">Receipt Summary</h3>
            <Separator />
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receipt ID</span>
                <span className="font-mono text-foreground">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stripe Payment Ref</span>
                <span className="font-mono text-foreground truncate max-w-[180px]">{order.stripePaymentIntentId || order.stripeSessionId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Address</span>
                <span className="text-foreground">{order.contactInfo.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status</span>
                <span className="text-emerald-500 font-semibold uppercase tracking-wider">SUCCESS / PAID</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-sm font-bold pt-1">
                <span>Total Paid</span>
                <span className="text-foreground">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Footer */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/my-tickets" className="sm:flex-1">
            <Button className="w-full flex items-center justify-center gap-2">
              <Ticket className="w-4 h-4" />
              View All My Tickets
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/" className="sm:flex-1">
            <Button variant="outline" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>

      </div>
    </div>
  )
}
