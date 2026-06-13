// import { useState, useEffect } from 'react'
// import { useNavigate, Link } from 'react-router-dom'
// import { Clock, Info, Shield, RefreshCw, CheckCircle, Flame } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { Separator } from '@/components/ui/separator'
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from '@/components/ui/dialog'
// import { useTheme } from '@/components/ThemeProvider'
// import { useCartStore } from '@/store/cartStore'
// import { formatCurrency, formatDate, formatTime, calculateFees } from '@/lib/utils'
// import SectionDetailsDialog from '@/components/section/SectionDetailsDialog'
// import { useOrdersStore } from '@/store/ordersStore'
// import { useAuthStore } from '@/store/authStore'
// import { toast } from 'sonner'
// import { loadStripe } from '@stripe/stripe-js'
// import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

// // Standard Stripe public test key used for developer mock setups
// const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx')

// function StripeCheckoutForm({ amount, onSuccess }: { amount: number, onSuccess: () => void }) {
//   const stripe = useStripe()
//   const elements = useElements()
//   const [isProcessing, setIsProcessing] = useState(false)
//   const [errorMessage, setErrorMessage] = useState('')

//   const handlePayment = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!stripe || !elements) return

//     setIsProcessing(true)
//     setErrorMessage('')

//     // Trigger form validation and wallet collection
//     const { error: submitError } = await elements.submit()
//     if (submitError) {
//       setErrorMessage(submitError.message ?? 'An error occurred')
//       setIsProcessing(false)
//       toast.error(submitError.message ?? 'Payment failed')
//       return
//     }

//     // Since we don't have a backend to issue a client_secret, we simulate the payment confirmation delay
//     await new Promise(resolve => setTimeout(resolve, 2000))

//     setIsProcessing(false)
//     onSuccess()
//   }

//   return (
//     <form onSubmit={handlePayment} className="space-y-6">
//       <PaymentElement />
//       {errorMessage && <div className="text-sm text-destructive">{errorMessage}</div>}
//       <Button type="submit" className="w-full" size="lg" disabled={!stripe || isProcessing}>
//         {isProcessing ? 'Processing...' : `Pay ${formatCurrency(amount)}`}
//       </Button>
//     </form>
//   )
// }

// export default function PaymentPage() {
//   const navigate = useNavigate()
//   const { theme } = useTheme()
//   const activeTheme = theme === 'system' 
//     ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light') 
//     : theme
//   const stripeTheme = activeTheme === 'dark' ? 'night' : 'stripe'
  
//   const {
//     selectedEvent,
//     selectedSection,
//     quantity,
//     contactInfo,
//     clearCart
//   } = useCartStore()
  
//   const { user } = useAuthStore()
//   const { addOrder } = useOrdersStore()

//   const [showSuccess, setShowSuccess] = useState<boolean>(false)
//   const [showSectionDetails, setShowSectionDetails] = useState<boolean>(false)
//   const [countdown, setCountdown] = useState<number>(489)

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCountdown(prev => {
//         if (prev <= 0) { clearInterval(timer); return 0 }
//         return prev - 1
//       })
//     }, 1000)
//     return () => clearInterval(timer)
//   }, [])

//   useEffect(() => {
//     console.log('PaymentPage - Checking data:', {
//       hasEvent: !!selectedEvent,
//       hasSection: !!selectedSection,
//       hasContactInfo: !!contactInfo
//     })
    
//     if (!selectedEvent || !selectedSection || !contactInfo) {
//       console.log('Missing required data, redirecting to checkout')
//       navigate('/checkout')
//     }
//   }, [selectedEvent, selectedSection, contactInfo, navigate])

//   if (!selectedEvent || !selectedSection) return null

//   const subtotal = selectedSection.price * quantity
//   const fees = calculateFees(subtotal)

//   const formatCountdown = (seconds: number): string => {
//     const mins = Math.floor(seconds / 60)
//     const secs = seconds % 60
//     return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
//   }



//   const total = subtotal + fees.tax + fees.handlingFee + fees.bookingFee

//   const handleSuccess = () => {
//     if (selectedEvent && selectedSection && contactInfo) {
//       addOrder({
//         id: `order_${Date.now()}`,
//         userId: user?.id || null,
//         event: selectedEvent,
//         section: selectedSection,
//         quantity,
//         contactInfo,
//         totalAmount: total,
//         status: 'completed',
//         createdAt: new Date().toISOString(),
//         paymentMethod: 'stripe'
//       })
//     }
//     toast.success('Payment completed! Your tickets are ready.')
//     setShowSuccess(true)
//   }

//   const handleSuccessClose = () => {
//     clearCart()
//     navigate('/')
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Event Header */}
//       <div className="border-b bg-card">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center gap-4">
//             <div className="hidden sm:flex h-20 w-20 items-center justify-center rounded-lg bg-linear-to-br from-green-600 to-green-400 text-white text-xs font-bold shrink-0">
//               <div className="text-center"><div>WORLD</div><div>CUP</div></div>
//             </div>

//             <div className="flex-1 min-w-0">
//               <Link to={`/event/${selectedEvent.id}`} className="text-lg font-semibold text-primary hover:underline">
//                 {selectedEvent.title}
//               </Link>
//               <p className="text-sm text-muted-foreground">{selectedEvent.stage}</p>
//               <p className="text-sm text-muted-foreground">
//                 {formatDate(selectedEvent.date)} - {formatTime(selectedEvent.time)}
//               </p>
//               <p className="text-sm text-muted-foreground">
//                 {selectedEvent.venue}, {selectedEvent.city}, {selectedEvent.country}
//               </p>
//               {selectedEvent.ticketsLeftPercent <= 5 && (
//                 <Badge className="mt-2 bg-red-500 hover:bg-red-600 text-white">
//                   Only {selectedEvent.ticketsLeftPercent}% of tickets left
//                 </Badge>
//               )}
//             </div>

//             <div className="flex items-center gap-2 text-muted-foreground">
//               <Clock className="h-4 w-4" />
//               <span className="text-sm font-mono">{formatCountdown(countdown)}</span>
//               <Info className="h-4 w-4" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="container mx-auto px-4 py-6">
//         <div className="grid gap-6 lg:grid-cols-[1fr_460px]">
//           <div className="space-y-6">
//             <h1 className="text-2xl font-bold">Checkout</h1>

//             {/* Stripe Payment Integration */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg">Payment details</CardTitle>
//                 <p className="text-sm text-muted-foreground">All transactions are secure and encrypted.</p>
//               </CardHeader>
//               <CardContent>
//                 <Elements stripe={stripePromise} options={{ 
//                   mode: 'payment', 
//                   amount: Math.round(total * 100), 
//                   currency: 'usd',
//                   appearance: { 
//                     theme: stripeTheme as 'stripe' | 'night',
//                     variables: { colorPrimary: '#16a34a' }
//                   }
//                 }}>
//                   <StripeCheckoutForm amount={total} onSuccess={handleSuccess} />
//                  </Elements>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Right Sidebar */}
//           <div className="lg:sticky lg:top-24 space-y-4 self-start">
//             <Card>
//               <div className="space-y-2 p-4 pb-0">
//                 {selectedEvent.ticketsLeftPercent <= 5 && (
//                   <div className="flex items-center gap-2 text-orange-800 text-xs font-medium bg-orange-50 p-2 rounded-lg w-fit">
//                     <Flame className="h-3.5 w-3.5 text-orange-500" />
//                     <span>High demand</span>
//                   </div>
//                 )}
//               </div>
//               <CardContent className="p-6 space-y-4">
//                 <div className="flex items-start gap-3">
//                   <div className="flex-1">
//                     <h3 className="font-semibold">{selectedEvent.title}</h3>
//                     <p className="text-sm text-muted-foreground">{selectedEvent.stage}</p>
//                     <p className="text-sm text-muted-foreground">
//                       {formatDate(selectedEvent.date)} - {formatTime(selectedEvent.time)}
//                     </p>
//                     <p className="text-sm text-muted-foreground">{selectedEvent.venue}</p>
//                   </div>
//                   <div className="h-15 w-15 rounded-lg bg-linear-to-br from-green-600 to-green-400 text-white text-[8px] font-bold flex items-center justify-center shrink-0">
//                     <div className="text-center"><div>WORLD</div><div>CUP</div></div>
//                   </div>
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="font-semibold">Section {selectedSection.name} - Row {selectedSection.row}</p>
//                     <p className="text-sm text-muted-foreground">{quantity} tickets</p>
//                   </div>
//                   <Button 
//                     variant="outline" 
//                     size="sm"
//                     onClick={() => setShowSectionDetails(true)}
//                   >Details</Button>
//                 </div>

//                 <Separator />

//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-sm">Ticket price</span>
//                     <span className="text-sm">{quantity} x {formatCurrency(selectedSection.price)}</span>
//                   </div>
//                   <p className="text-xs text-muted-foreground">
//                     Tax, handling fee, and booking fee not included
//                   </p>
//                 </div>

//                 <Separator />

//                 <div className="space-y-3">
//                   <div className="flex items-start gap-3">
//                     <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
//                       <Shield className="h-4 w-4 text-primary" />
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium">100% Order Guarantee</p>
//                       <p className="text-xs text-muted-foreground">
//                         We back every order so you can buy and sell tickets with 100% confidence.
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
//                       <RefreshCw className="h-4 w-4 text-primary" />
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium">Resell Anytime</p>
//                       <p className="text-xs text-muted-foreground">
//                         Not sure if you can make it? You can resell your tickets at any time.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>

//       {/* Success Dialog */}
//       <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <div className="flex justify-center mb-4">
//               <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
//                 <CheckCircle className="h-8 w-8 text-green-600" />
//               </div>
//             </div>
//             <DialogTitle className="text-center text-xl">Payment Successful!</DialogTitle>
//             <DialogDescription className="text-center">
//               Your order has been confirmed. You will receive your tickets via email shortly.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4 mt-4">
//             <div className="p-4 bg-muted rounded-lg">
//               <p className="font-semibold">{selectedEvent.title}</p>
//               <p className="text-sm text-muted-foreground">
//                 Section {selectedSection.name} - Row {selectedSection.row}
//               </p>
//               <p className="text-sm text-muted-foreground">{quantity} tickets</p>
//               <p className="text-lg font-bold mt-2">{formatCurrency(fees.total)}</p>
//             </div>
//             <Button className="w-full" onClick={handleSuccessClose}>
//               Continue Shopping
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//       <SectionDetailsDialog 
//         open={showSectionDetails}
//         onOpenChange={setShowSectionDetails}
//         section={selectedSection}
//         eventTitle={selectedEvent.title}
//       />
//     </div>
//   )
// }

// // 4242 4242 4242 4242