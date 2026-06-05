import { useState } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import {
  Heart, Share2, MapPin, Calendar, Clock, Eye, Ticket,
  ThumbsUp, DollarSign, Users,
  Star,
  ArrowLeft,
  CheckCircle,
  Minus,
  Plus,
  Shield,
  RefreshCw,
  Lightbulb,
  Flame,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEventsStore } from '@/store/eventsStore'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/store/cartStore'

export default function SectionDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const location = useLocation()
    const { getEventById } = useEventsStore()
    const { addToCart } = useCartStore()

    const event = id ? getEventById(id) ?? null : null

    // Get selected section from navigation state
    const { selectedSection: initialSection, ticketCount: initialTicketCount } = location.state || {}

    const [selectedSection] = useState(initialSection || null)
    const [ticketCount, setTicketCount] = useState<number>(initialTicketCount || 2)
    const [isFavorite, setIsFavorite] = useState<boolean>(false)
    const [isAddingToCart, setIsAddingToCart] = useState(false)

    if (!event) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="p-8 text-center">
                <p className="text-muted-foreground">Event not found</p>
                <Button asChild className="mt-4">
                    <Link to="/">Back to Events</Link>
                </Button>
                </Card>
            </div>
        )
    }

    if (!selectedSection) {
        return (
        <div className="container mx-auto px-4 py-8">
            <Card className="p-8 text-center">
            <p className="text-muted-foreground">No section selected</p>
            <Button asChild className="mt-4">
                <Link to={`/event/${event.id}/tickets`}>Back to Tickets</Link>
            </Button>
            </Card>
        </div>
        )
    }

    const urgencyBadge = event.ticketsLeftPercent <= 5
    const subtotal = selectedSection.price * ticketCount
    // const tax = subtotal * 0.1 // 10% tax
    // const handlingFee = 5 * ticketCount
    // const bookingFee = subtotal * 0.05 // 5% booking fee
    // const total = subtotal + tax + handlingFee + bookingFee

    const handleTicketCountChange = (delta: number) => {
        const newCount = ticketCount + delta
        if (newCount >= 1 && newCount <= selectedSection.available) {
        setTicketCount(newCount)
        }
    }

    const handleContinue = () => {
        setIsAddingToCart(true)
        
        // Add to cart store
        addToCart(event, selectedSection, ticketCount)
        
        // Navigate to checkout
        setTimeout(() => {
        setIsAddingToCart(false)
        navigate('/checkout', {
            state: {
            event,
            section: selectedSection,
            quantity: ticketCount
            }
        })
        }, 500)
    }

    return (
        <div className="min-h-screen bg-background pb-24 lg:pb-0">
        {/* Event Header */}
        <div className="border-b bg-card sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="shrink-0"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                
                <div className="hidden sm:flex h-20 w-20 items-center justify-center rounded-lg bg-linear-to-br from-green-600 to-green-400 text-white text-xs font-bold shrink-0">
                    <div className="text-center">
                    <div>WORLD</div>
                    <div>CUP</div>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-semibold">{event.title}</h1>
                    <p className="text-sm text-muted-foreground">{event.stage}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(event.date)}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(event.time)}
                    </span>
                    </div>
                    <Link to="#" className="text-sm text-primary hover:underline flex items-center gap-1 mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.venue}, {event.city}, {event.state}, {event.country}
                    </Link>

                    {urgencyBadge && (
                        <Badge className="mt-2 bg-red-500 hover:bg-red-600 text-white">
                        <Ticket className="h-3 w-3 mr-1" />
                        Only {event.ticketsLeftPercent}% of tickets left
                        </Badge>
                    )}
                </div>
                </div>

                <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFavorite(!isFavorite)}
                >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button variant="ghost" size="icon">
                    <Share2 className="h-5 w-5" />
                </Button>
                </div>
            </div>
            </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="container mx-auto px-4 py-6">
            <div className="grid gap-6 lg:grid-cols-2">
            
            {/* LEFT COLUMN - Section Image & Details */}
            <div className="space-y-6">
                {/* Section Image */}
                <Card className="overflow-hidden">
                <div className="relative aspect-video bg-linear-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                    {selectedSection.sectionImage ? (
                    <img 
                        src={selectedSection.sectionImage} 
                        alt={`Section ${selectedSection.name} view`}
                        className="w-full h-full object-cover"
                    />
                    ) : (
                    <div className="text-center text-white p-8">
                        <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-semibold">Section View</p>
                        <p className="text-sm opacity-70">View from Section {selectedSection.name}</p>
                    </div>
                    )}
                    
                    {/* Section Badge Overlay */}
                    <div className="absolute top-4 left-4">
                    <Badge className="bg-black/50 backdrop-blur-sm text-white border-0">
                        Section {selectedSection.name} • Row {selectedSection.row}
                    </Badge>
                    </div>
                </div>
                
                <CardContent className="p-6">
                    <div className="space-y-4">
                    {/* Section Details */}
                    <div>
                        <h2 className="text-2xl font-bold">Section {selectedSection.name}, Row {selectedSection.row}</h2>
                        <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-sm">
                            {selectedSection.available} tickets available
                        </Badge>
                        {selectedSection.rating && (
                            <Badge className="bg-green-500 hover:bg-green-600 text-white">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            {selectedSection.rating} {selectedSection.ratingLabel}
                            </Badge>
                        )}
                        </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                        {selectedSection.features.map((feature: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-sm">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                            {feature}
                        </Badge>
                        ))}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                        {selectedSection.isPopular && (
                        <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Popular Pick - {selectedSection.ticketsSoldLastHour} sold recently
                        </Badge>
                        )}
                        
                        {selectedSection.isLowestPrice && (
                        <Badge className="bg-green-500 hover:bg-green-600 text-white">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Lowest Price Guaranteed
                        </Badge>
                        )}
                        
                        {selectedSection.isFanFavorite && (
                        <Badge variant="outline" className="text-orange-500 border-orange-200">
                            <Star className="h-3 w-3 mr-1 fill-orange-500" />
                            Fan Favorite Section
                        </Badge>
                        )}
                    </div>

                    {/* Description */}
                    <div className="pt-4 border-t">
                        <h3 className="font-semibold mb-2">About this section</h3>
                        <p className="text-sm text-muted-foreground">
                        Located in Section {selectedSection.name}, Row {selectedSection.row}. 
                        This area offers {selectedSection.features.join(', ')}. 
                        {selectedSection.isPopular && ' This is one of our most popular sections with fans!'}
                        {selectedSection.isLowestPrice && ' Get the best value for your money with these seats.'}
                        </p>
                    </div>

                    {/* Seat Map Link */}
                    <Button variant="outline" className="w-full" onClick={() => navigate(-1)}>
                        <Ticket className="h-4 w-4 mr-2" />
                        View Seat Map
                    </Button>
                    </div>
                </CardContent>
                </Card>
            </div>

            {/* RIGHT COLUMN - Order Summary */}
            <div className="lg:sticky lg:top-24 space-y-4 self-start">
                <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Complete your order</CardTitle>
                    <p className="text-sm text-muted-foreground">
                    Review your ticket selection and proceed to checkout
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Selected Section Summary */}
                    <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold">Section {selectedSection.name} - Row {selectedSection.row}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-muted-foreground">{selectedSection.available} tickets available</span>
                        {selectedSection.features.includes('Clear view') && (
                        <span className="flex items-center gap-1 text-green-600">
                            <Eye className="h-3 w-3" />
                            Clear view
                        </span>
                        )}
                    </div>
                    </div>

                    {/* Ticket Count Selector */}
                    <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Number of tickets</span>
                        <span className="text-sm text-muted-foreground">
                        Max: {selectedSection.available}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-10 w-10"
                            onClick={() => handleTicketCountChange(-1)}
                            disabled={ticketCount <= 1}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center text-lg font-semibold">{ticketCount}</span>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-10 w-10"
                            onClick={() => handleTicketCountChange(1)}
                            disabled={ticketCount >= selectedSection.available}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                        {ticketCount} ticket{ticketCount > 1 ? 's' : ''}
                        </p>
                    </div>
                    </div>

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ticket price ({ticketCount} × {formatCurrency(selectedSection.price)})</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    </div>

                    {/* Hidden on mobile — shown via sticky bottom bar instead */}
                    <Button 
                    className="w-full hidden lg:flex" 
                    size="lg"
                    onClick={handleContinue}
                    disabled={isAddingToCart}
                    >
                    {isAddingToCart ? (
                        <>Processing...</>
                    ) : (
                        <>Continue to Checkout →</>
                    )}
                    </Button>

                    {/* Guarantees */}
                    <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                        <p className="text-sm font-medium">100% Order Guarantee</p>
                        <p className="text-xs text-muted-foreground">
                            We back every order so you can buy and sell tickets with 100% confidence.
                        </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <RefreshCw className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                        <p className="text-sm font-medium">Resell Anytime</p>
                        <p className="text-xs text-muted-foreground">
                            Not sure if you can make it? You can resell your tickets on Ticketapoint at any time.
                        </p>
                        </div>
                    </div>
                    </div>
                </CardContent>
                </Card>

                {/* High Demand Warning */}
                {urgencyBadge && (
                <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <Flame className="h-5 w-5 text-orange-500 fill-orange-500" />
                    </div>
                    <div>
                        <p className="font-semibold text-orange-800">High demand event</p>
                        <p className="text-sm text-orange-600">
                        Only {event.ticketsLeftPercent}% of tickets remaining for this match
                        </p>
                    </div>
                    </CardContent>
                </Card>
                )}

                {/* Tips Card */}
                <Card>
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Lightbulb className="h-4 w-4 text-blue-600 fill-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">Pro Tip</p>
                        <p className="text-xs text-muted-foreground mt-1">
                        These tickets are selling fast! Complete your purchase now to secure your seats.
                        </p>
                    </div>
                    </div>
                </CardContent>
                </Card>
            </div>
            </div>
        </div>

        {/* Mobile Sticky Bottom Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-xs text-muted-foreground">Section {selectedSection.name} · {ticketCount} ticket{ticketCount > 1 ? 's' : ''}</p>
                <p className="text-lg font-bold">{formatCurrency(subtotal)}</p>
            </div>
            <Button
                size="lg"
                onClick={handleContinue}
                disabled={isAddingToCart}
                className="min-w-[160px]"
            >
                {isAddingToCart ? 'Processing...' : 'Continue →'}
            </Button>
            </div>
        </div>
        </div>
    )
}