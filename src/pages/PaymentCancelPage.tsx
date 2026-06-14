import { XCircle, ArrowRight, ShoppingCart } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/components/ui/button'
import SEO from '@/components/common/SEO'

export default function PaymentCancelPage() {
  const navigate = useNavigate()
  const { selectedEvent, selectedSection, quantity } = useCartStore()

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50/50 py-12 px-4">
      <SEO title="Payment Cancelled" />
      
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-lg p-8 text-center space-y-6 animate-fade-in">
        {/* Cancel Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 text-rose-500 border border-rose-100">
          <XCircle className="w-8 h-8" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Checkout Cancelled</h1>
          <p className="text-sm text-slate-500">
            Your payment request was cancelled. No charges were made to your account.
          </p>
        </div>

        {/* Selected Event Context (if exists) */}
        {selectedEvent && selectedSection && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-left space-y-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 uppercase tracking-wider">
              <ShoppingCart className="w-3.5 h-3.5" />
              Held In Your Cart
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{selectedEvent.title}</h3>
              <p className="text-xs text-muted-foreground">
                Section {selectedSection.name} • {quantity} Ticket{quantity !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Informative text */}
        <p className="text-xs text-slate-400">
          Your reservation is still active in your checkout session. You can retry the payment or adjust your details.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <Button 
            onClick={() => navigate('/checkout')} 
            className="w-full flex items-center justify-center gap-2 font-medium"
          >
            Return to Checkout
            <ArrowRight className="w-4.5 h-4.5" />
          </Button>
          
          <Link to="/" className="w-full">
            <Button variant="outline" className="w-full">
              Continue Browsing Matches
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
