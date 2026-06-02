import { ShoppingBag, Trash2, ChevronRight, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { calculateFees } from '@/lib/utils'
import SEO from '@/components/common/SEO'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, removeFromCart, clearCart } = useCartStore()

  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0)
  const allFees = items.reduce((acc, item) => {
    const fees = calculateFees(item.subtotal)
    return {
      tax: acc.tax + fees.tax,
      handlingFee: acc.handlingFee + fees.handlingFee,
      bookingFee: acc.bookingFee + fees.bookingFee,
      total: acc.total + fees.total
    }
  }, { tax: 0, handlingFee: 0, bookingFee: 0, total: 0 })

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <SEO title="Your Cart is Empty" />
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">
          Looks like you haven't added any tickets yet. Explore our top events and grab yours today!
        </p>
        <Link to="/">
          <Button size="lg" className="rounded-full px-8">Browse Events</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="py-8 lg:py-12">
      <SEO title="Shopping Cart" />
      
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-black tracking-tight">Shopping Cart</h1>
        <Badge variant="secondary" className="bg-primary/10 text-primary font-black ml-2">
          {items.length} {items.length === 1 ? 'Event' : 'Events'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Ticket Details</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearCart}
              className="text-xs text-destructive hover:text-destructive hover:bg-destructive/5 font-bold"
            >
              Clear Cart
            </Button>
          </div>

          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden border-border/50 group hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Left Side: Info */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
                          {item.eventDate} • {item.eventTime}
                        </p>
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                          {item.eventTitle}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.venue}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 px-4 bg-muted/30 rounded-xl border border-border/40">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Section</p>
                        <p className="text-sm font-bold mt-1">{item.section}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quantity</p>
                        <p className="text-sm font-bold mt-1">{item.quantity} Tickets</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Price</p>
                        <p className="text-sm font-bold mt-1">${item.pricePerTicket}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Subtotal</p>
                        <p className="text-sm font-bold mt-1 text-primary">${item.subtotal}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
          <Card className="border-border/50 shadow-xl shadow-primary/5 rounded-2xl overflow-hidden">
            <div className="p-6 bg-primary/5 border-b border-primary/10">
              <h2 className="text-lg font-black tracking-tight">Order Summary</h2>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tickets Subtotal</span>
                  <span className="font-bold font-mono">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-bold font-mono">${allFees.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Handling Fee</span>
                  <span className="font-bold font-mono">${allFees.handlingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booking Fee</span>
                  <span className="font-bold font-mono">${allFees.bookingFee.toFixed(2)}</span>
                </div>
              </div>
              
              <Separator className="bg-border/60" />
              
              <div className="pt-2">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-bold">Estimated Total</span>
                  <span className="text-2xl font-black text-primary font-mono tabular-nums tracking-tighter">
                    ${allFees.total.toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground text-right italic font-medium">
                  All prices in USD. Digital delivery included.
                </p>
              </div>

              <div className="space-y-3 pt-4">
                  <Button className="w-full" size="lg"
                  onClick={() => navigate('/checkout')}
                  >
                    Proceed to Checkout
                    <ChevronRight className="ml-2 h-5 w-5" />

                  </Button>
                {/* <Button 
                  className="w-full h-12 rounded-xl text-md font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-[0.98]"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button> */}
                <Link to="/">
                  <Button variant="ghost" className="w-full text-xs font-bold text-muted-foreground hover:bg-muted/30">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </CardContent>

            <div className="p-4 bg-muted/30 border-t flex items-center justify-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1.5 grayscale opacity-50">
                <div className="w-8 h-4 bg-foreground rounded-xs" /> {/* Visa Mock icon */}
                <div className="w-8 h-4 bg-foreground rounded-xs" /> {/* Mastercard Mock icon */}
                <div className="w-8 h-4 bg-foreground rounded-xs" /> {/* ApplePay Mock icon */}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
