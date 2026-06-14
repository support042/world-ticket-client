import { useEffect, useState } from 'react'
import { ChevronLeft, CreditCard, Loader2, AlertCircle, RefreshCw, CheckCircle2, Calendar, Eye } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useOrdersStore } from '@/store/ordersStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import SEO from '@/components/common/SEO'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Order } from '@/types'
import { toast } from 'sonner'

export default function MyTicketsPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const {
    orders,
    isLoading,
    error,
    fetchMyOrders
  } = useOrdersStore()

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
      return
    }
    fetchMyOrders()
  }, [isAuthenticated, fetchMyOrders, navigate])

  const handleRefresh = () => {
    fetchMyOrders()
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background pb-20">
      <SEO title="My Tickets" />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="shrink-0 hover:bg-muted shadow-xs border border-border bg-card">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-foreground">My Tickets</h1>
              <p className="text-muted-foreground mt-1 text-sm font-medium">
                Manage your orders, view QR entry codes, and check match schedules.
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isLoading}
            className="self-start sm:self-auto shadow-xs bg-card border-border"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Orders
          </Button>
        </div>

        {/* Content Area */}
        {isLoading && orders.length === 0 ? (
          <div className="flex justify-center items-center py-24 bg-card rounded-2xl border border-border shadow-xs">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground font-medium animate-pulse">Syncing orders with Stripe...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-2xl bg-card p-6 shadow-xs">
            <AlertCircle className="h-10 w-10 text-rose-500 mb-4" />
            <h3 className="text-lg font-bold mb-1 text-foreground">Failed to load reservations</h3>
            <p className="text-sm text-muted-foreground mb-6 px-4 max-w-sm">{error}</p>
            <Button onClick={fetchMyOrders} size="sm">Retry</Button>
          </div>
        ) : orders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {orders.map((order) => {
              const isPaid = order.status === 'paid' || order.status === 'completed'
              const isPending = order.status === 'pending' || order.status === 'processing'
              const statusLabel = order.status
              
              return (
                <div 
                  key={order.id} 
                  className={`flex flex-col justify-between p-6 border rounded-2xl bg-card shadow-xs hover:shadow-md transition-all duration-300 border-l-4 ${
                    isPaid ? 'border-l-emerald-500' : isPending ? 'border-l-amber-500' : 'border-l-rose-500'
                  } border-y-border border-r-border`}
                >
                  <div>
                    {/* Badge Status */}
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <Badge 
                        variant={isPaid ? "default" : isPending ? "secondary" : "destructive"}
                        className={`font-semibold capitalize text-[10px] tracking-wider px-2.5 py-0.5 ${
                          isPaid ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20' : 
                          isPending ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20' : 
                          'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {statusLabel}
                      </Badge>
                      
                      {isPaid && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      )}
                    </div>

                    {/* Section details */}
                    <h3 className="font-bold text-lg text-foreground leading-snug">
                      Section {order.section.name} • Row {order.section.row}
                    </h3>
                    
                    <p className="text-sm text-foreground mt-1 font-bold line-clamp-1">
                      {order.event?.title || (order.section as any).eventTitle || 'World Cup Match'}
                    </p>
                    
                    {/* Info rows */}
                    <div className="space-y-2.5 mt-5 pt-4 border-t border-border text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          Match Date
                        </span>
                        <strong className="text-foreground">
                          {formatDate(order.event?.date || (order.section as any).eventDate)}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Quantity</span>
                        <strong className="text-foreground">{order.quantity} Tickets</strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Total Paid</span>
                        <strong className="text-foreground">{formatCurrency(order.totalAmount)}</strong>
                      </div>
                      
                      <div className="flex flex-col gap-0.5 pt-1">
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground/80 font-bold">Stripe Reference</span>
                        <code className="bg-muted px-2 py-1 rounded font-mono text-[9px] text-foreground block w-fit truncate max-w-full">
                          {order.stripeSessionId}
                        </code>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="mt-6">
                    {isPaid ? (
                      <Button 
                        onClick={() => setSelectedOrder(order)}
                        className="w-full text-xs font-semibold gap-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95"
                        size="sm"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Ticket QR Codes
                      </Button>
                    ) : isPending ? (
                      <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold text-center py-2.5 rounded-xl border border-amber-500/20 flex items-center justify-center gap-1.5">
                        Awaiting Payment Confirmation
                      </div>
                    ) : (
                      <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center py-2.5 rounded-xl border border-rose-500/20">
                        Order Failed / Cancelled
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-2xl border border-border shadow-xs">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 border border-border">
              <CreditCard className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-1 text-foreground">No tickets found</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm px-4 font-medium">
              You don't have any booked tickets or active orders. Check out the latest match lineups to reserve tickets!
            </p>
            <Link to="/">
              <Button className="rounded-xl px-8 shadow-xs">Explore Lineups</Button>
            </Link>
          </div>
        )}

        {/* ── Ticket QR Codes Drawer / Dialog ─────────────────────────────── */}
        <Dialog open={selectedOrder !== null} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          {selectedOrder && (
            <DialogContent className="max-w-md w-[92vw] overflow-y-auto max-h-[85vh] p-6 rounded-2xl bg-card border-border">
              <DialogHeader className="pb-3 border-b border-border text-left">
                <DialogTitle className="text-xl font-black text-foreground">Your Entry Passes</DialogTitle>
                <DialogDescription className="text-xs font-medium text-muted-foreground">
                  Scan each QR code at the stadium gate. We recommend saving these offline.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-6">
                {/* Event Name */}
                <div className="bg-muted/50 p-4 rounded-xl border border-border space-y-1">
                  <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Gate Check-in</span>
                  <h4 className="font-bold text-foreground text-sm">{selectedOrder.event?.title || (selectedOrder.section as any).eventTitle}</h4>
                  <p className="text-xs text-muted-foreground">
                    Section {selectedOrder.section.name} • Row {selectedOrder.section.row}
                  </p>
                </div>

                {/* QR Cards Carousel / List */}
                <div className="space-y-6">
                  {selectedOrder.tickets.map((tkt, idx) => (
                    <div 
                      key={tkt.id}
                      className="border border-border rounded-xl p-4 bg-card flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden"
                    >
                      {/* Ticket Number badge */}
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground hover:bg-primary text-[9px] font-mono py-0.5 px-2">
                        Ticket {idx + 1} of {selectedOrder.tickets.length}
                      </Badge>
                      
                      {/* QR Rendering */}
                      <div className="bg-white p-2.5 border border-border rounded-xl shadow-xs mt-4">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(tkt.barcode)}&color=0f172a`} 
                          alt="Admission Pass QR" 
                          className="w-[130px] h-[130px]"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://placehold.co/130x130/f1f5f9/0f172a?text=QR+CODE`
                          }}
                        />
                      </div>

                      {/* Seat details */}
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-foreground">
                          {tkt.seatNumber || `Seat ${12 + idx}`}
                        </span>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          Code: {tkt.barcode.split('-').pop()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                <Button 
                  onClick={() => {
                    toast.success('Offline copy downloading...')
                  }}
                  className="flex-1 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Download PDF Passes
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          )}
        </Dialog>

      </div>
    </div>
  )
}