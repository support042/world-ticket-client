import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Clock, DollarSign, Flame, Info, RefreshCw, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { usePaymentStore } from '@/store/paymentStore'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import AuthForm from '@/components/auth/AuthForm'
import type { CheckoutFormData, CheckoutFormErrors, FilterOption } from '@/types'
import SectionDetailsDialog from '@/components/section/SectionDetailsDialog'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

const countryCodes: FilterOption[] = [
  { value: '+1', label: 'US - 1' },
  { value: '+44', label: 'UK - 44' },
  { value: '+234', label: 'NG - 234' },
  { value: '+49', label: 'DE - 49' },
  { value: '+33', label: 'FR - 33' },
  { value: '+52', label: 'MX - 52' },
  { value: '+55', label: 'BR - 55' },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const {
    selectedEvent,
    selectedSection,
    quantity,
    giftOption,
    setGiftOption,
    teamSupport,
    setTeamSupport,
    newsletterOptIn,
    setNewsletterOptIn,
    setContactInfo,
    clearCart,
  } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const { initiatePayment, isInitiating } = usePaymentStore()

  const [formData, setFormData] = useState<CheckoutFormData>({
    email: user?.email ?? '',
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: user?.phone ?? '',
    countryCode: user?.countryCode ?? '+234'
  })
  const [errors, setErrors] = useState<CheckoutFormErrors>({})
  const [showAuthForm, setShowAuthForm] = useState<boolean>(false)
  const [showSectionDetails, setShowSectionDetails] = useState<boolean>(false)
  const [countdown, setCountdown] = useState<number>(599)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!selectedEvent || !selectedSection) navigate('/')
  }, [selectedEvent, selectedSection, navigate])

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        phone: user.phone || prev.phone,
        countryCode: user.countryCode || prev.countryCode
      }))
    }
  }, [user])

  if (!selectedEvent || !selectedSection) return null

  const subtotal = selectedSection.price * quantity

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const validateForm = (): boolean => {
    const newErrors: CheckoutFormErrors = {}
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email'
    if (!formData.firstName) newErrors.firstName = 'First name is required'
    if (!formData.lastName) newErrors.lastName = 'Last name is required'
    if (!formData.phone) newErrors.phone = 'Phone is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ── handleContinue (Stripe external-link flow) ───────────────────────────
  // When the section has a paymentLink we open the Stripe-hosted page in a new
  // tab and fire initiatePayment() so the server can track the visit/click.
  // The old navigate('/payment') path is preserved below (commented out) for
  // when we bring back our own Stripe integration later.
  const handleContinue = async () => {
    if (!validateForm()) return

    // Save contact info to the store regardless of which path we take
    setContactInfo(formData)

    const paymentLink = selectedSection?.paymentLink

    if (paymentLink) {
      // Must successfully notify backend that payment was initiated
      try {
        await initiatePayment(selectedSection!.id, paymentLink)
        // Open the Stripe-hosted payment link in a new tab ONLY after successful initiation
        window.open(paymentLink, '_blank', 'noopener,noreferrer')
        // Clear cart and redirect parent window to My Tickets page
        clearCart()
        navigate('/my-tickets')
      } catch (err: any) {
        logger.error('Failed to initiate payment tracking:', err)
        toast.error(err?.message || 'Failed to initiate payment. Please log in or try again.')
      }
    } else {
      // ── Fallback: own Stripe integration (kept for future use) ──────────
      // navigate('/payment')
      // ────────────────────────────────────────────────────────────────────
      logger.warn('No paymentLink found on this section – no payment route configured.')
    }
  }

  const handleChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field in errors) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Event Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex h-20 w-20 items-center justify-center rounded-lg bg-linear-to-br from-green-600 to-green-400 text-white text-xs font-bold shrink-0">
              <div className="text-center"><div>WORLD</div><div>CUP</div></div>
            </div>

            <div className="flex-1 min-w-0">
              <Link to={`/event/${selectedEvent.id}`} className="text-lg font-semibold text-primary hover:underline">
                {selectedEvent.title}
              </Link>
              <p className="text-sm text-muted-foreground">{selectedEvent.stage}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(selectedEvent.date)} - {formatTime(selectedEvent.time)}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedEvent.venue}, {selectedEvent.city}, {selectedEvent.country}
              </p>
              {selectedEvent.ticketsLeftPercent <= 5 && (
                <Badge className="mt-2 bg-red-500 hover:bg-red-600 text-white">
                  Only {selectedEvent.ticketsLeftPercent}% of tickets left
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-mono">{formatCountdown(countdown)}</span>
              <Info className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_460px]">
          {/* LEFT COLUMN - Form */}
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Checkout</h1>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact information</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {"We'll use this information to send you updates on your order."}
                </p>
                {!isAuthenticated && (
                  <p className="text-sm">
                    Have an account?{' '}
                    <button
                      onClick={() => setShowAuthForm(!showAuthForm)}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {showAuthForm && !isAuthenticated ? (
                  <div className="border rounded-lg p-4">
                    <AuthForm
                      mode="signin"
                      onToggleMode={() => {}}
                      onSuccess={() => setShowAuthForm(false)}
                    />
                  </div>
                ) : isAuthenticated && user ? (
                  <div className="space-y-4 p-4 bg-muted rounded-lg">
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Phone</Label>
                      <p className="font-medium">
                        {user.countryCode} {user.phone || formData.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="you@example.com"
                      />
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleChange('firstName', e.target.value)}
                          placeholder="John"
                        />
                        {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleChange('lastName', e.target.value)}
                          placeholder="Doe"
                        />
                        {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex gap-2">
                        <Select
                          value={formData.countryCode}
                          onValueChange={(value) => handleChange('countryCode', value)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {countryCodes.map((c) => (
                              <SelectItem key={c.value} value={c.value}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          placeholder="Phone Number"
                          className="flex-1"
                        />
                      </div>
                      {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="newsletter"
                        checked={newsletterOptIn}
                        onCheckedChange={(checked) => setNewsletterOptIn(checked as boolean)}
                      />
                      <Label htmlFor="newsletter" className="text-sm font-normal">
                        Please keep me updated by email about the latest news, great deals and special offers
                      </Label>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Gift Option */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Buying this as a gift?</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={giftOption ? 'yes' : 'no'}
                  onValueChange={(value) => setGiftOption(value === 'yes')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="gift-yes" />
                    <Label htmlFor="gift-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="gift-no" />
                    <Label htmlFor="gift-no">No</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Team Support */}
            {selectedEvent.teams && selectedEvent.teams.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Which team are you rooting for?</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={teamSupport ?? ''}
                    onValueChange={setTeamSupport}
                  >
                    {selectedEvent.teams.map((team) => (
                      <div key={team.code} className="flex items-center space-x-2">
                        <RadioGroupItem value={team.code} id={`team-${team.code}`} />
                        <Label htmlFor={`team-${team.code}`} className="flex items-center gap-2 cursor-pointer">
                          {team.flag?.startsWith('http') ? (
                            <img 
                              src={team.flag} 
                              alt={`${team.name} flag`} 
                              className="h-3 w-5 md:h-4 md:w-6 object-cover rounded-sm shadow-xs" 
                            />
                          ) : (
                            <span className="text-lg">{team.flag}</span>
                          )}
                          <span className="font-medium">{team.name}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* ── Continue / Pay button ───────────────────────────────────────────
                 If the section has a paymentLink we render a styled <a> that
                 opens the Stripe-hosted page in a new tab.  We keep the <Button>
                 as the fallback for sections without a paymentLink so nothing
                 breaks for admins who haven't added a link yet.
            ──────────────────────────────────────────────────────────────────── */}
            {selectedSection?.paymentLink ? (
              <a
                href={selectedSection.paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  // Validate + track before the browser follows the href
                  e.preventDefault()
                  handleContinue()
                }}
                className={
                  [
                    // Mirror the shadcn Button's base + size="lg" classes so it
                    // looks identical to the original <Button>
                    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
                    'rounded-md text-sm font-medium ring-offset-background',
                    'transition-colors focus-visible:outline-none focus-visible:ring-2',
                    'focus-visible:ring-ring focus-visible:ring-offset-2',
                    'disabled:pointer-events-none disabled:opacity-50',
                    // variant=default colours
                    'bg-primary text-primary-foreground hover:bg-primary/90',
                    // size=lg padding
                    'h-11 px-8',
                    // full-width
                    'w-full',
                    // loading state
                    isInitiating ? 'opacity-70 pointer-events-none' : '',
                  ].join(' ')
                }
              >
                {isInitiating ? 'Processing…' : 'Continue to Payment'}
              </a>
            ) : (
              /* No paymentLink – fall back to the old Button (navigates nowhere
                 until an admin adds a link or we re-enable our own Stripe page) */
              <Button
                className="w-full"
                size="lg"
                disabled={isInitiating}
                onClick={handleContinue}
              >
                {isInitiating ? 'Processing…' : 'Continue'}
              </Button>
            )}
          </div>

          {/* RIGHT COLUMN - Order Summary (Sticky) */}
          <div className="lg:sticky lg:top-24 self-start">
            <Card>
              {/* Badges inside the card at the top */}
              {(selectedSection.isLowestPrice || selectedEvent.ticketsLeftPercent <= 5) && (
                <div className="space-y-2 p-4 pb-0">
                  {selectedSection.isLowestPrice && (
                    <div className="flex items-center gap-2 text-green-700 text-sm font-medium bg-green-50 p-2 rounded-lg">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span>Lowest price! Only {selectedSection.available} tickets left at this price in this section</span>
                    </div>
                  )}
                  
                  {selectedEvent.ticketsLeftPercent <= 5 && (
                    <div className="flex items-center gap-2 text-orange-800 text-xs font-medium bg-orange-50 p-2 rounded-lg w-fit">
                      <Flame className="h-3.5 w-3.5 text-orange-500" />
                      <span>High demand</span>
                    </div>
                  )}
                </div>
              )}

              <CardContent className="p-6 space-y-4">
                {/* Event Info */}
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h3 className="font-bold">{selectedEvent.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedEvent.stage}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(selectedEvent.date)} • {formatTime(selectedEvent.time)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedEvent.venue} • {selectedEvent.city}, {selectedEvent.country}
                    </p>
                  </div>
                  <div className="h-15 w-15 rounded-lg bg-linear-to-br from-green-600 to-green-400 text-white text-[8px] font-bold flex items-center justify-center shrink-0">
                    <div className="text-center">
                      <div>WORLD</div>
                      <div>CUP</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Section Info */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Section {selectedSection.name} • Row {selectedSection.row}</p>
                      <p className="text-sm text-muted-foreground">{quantity} tickets • Seated together</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowSectionDetails(true)}
                    >
                      Details
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ticket price</span>
                    <span>{quantity} x {formatCurrency(selectedSection.price)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tax, handling fee, and booking fee not included
                  </p>
                </div>

                <Separator />

                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Subtotal</span>
                  <span className="text-xl font-bold">{formatCurrency(subtotal)}</span>
                </div>

                {/* Guarantees */}
                <div className="space-y-3 pt-2">
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
          </div>
        </div>
      </div>
      <SectionDetailsDialog 
        open={showSectionDetails}
        onOpenChange={setShowSectionDetails}
        section={selectedSection}
        eventTitle={selectedEvent.title}
      />
    </div>
  )
}