import { useState, useEffect, useRef } from 'react'
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
import { useTheme } from '@/components/ThemeProvider'
import { usePaymentStore } from '@/store/paymentStore'
import { paymentService } from '@/services/payment.service'
import { useOrdersStore } from '@/store/ordersStore'
import { formatCurrency, formatDate, formatTime, calculateFees } from '@/lib/utils'
import AuthForm from '@/components/auth/AuthForm'
import type { CheckoutFormData, CheckoutFormErrors, FilterOption } from '@/types'
import SectionDetailsDialog from '@/components/section/SectionDetailsDialog'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const countryCodes: FilterOption[] = [
  { value: '+1', label: 'US - 1' },
  { value: '+44', label: 'UK - 44' },
  { value: '+234', label: 'NG - 234' },
  { value: '+49', label: 'DE - 49' },
  { value: '+33', label: 'FR - 33' },
  { value: '+52', label: 'MX - 52' },
  { value: '+55', label: 'BR - 55' },
]

const getStripePublishableKey = (): string => {
  const envKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  if (!envKey || envKey.includes('REPLACE_WITH_REAL_KEY')) {
    return 'pk_test_TYooMQauvdEDq54NiTphI7jx' // Stripe test key fallback
  }
  return envKey
}

const stripePromise = loadStripe(getStripePublishableKey())

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
  } = useCartStore()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { theme } = useTheme()
  const { createPaymentIntent } = usePaymentStore()

  const [formData, setFormData] = useState<CheckoutFormData>({
    email: user?.email ?? '',
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: user?.phone ?? '',
    countryCode: user?.countryCode ?? '+234'
  })
  const [errors, setErrors] = useState<CheckoutFormErrors>({})
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [showSectionDetails, setShowSectionDetails] = useState<boolean>(false)
  const [countdown, setCountdown] = useState<number>(599)

  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null)
  const [isInitializingPayment, setIsInitializingPayment] = useState<boolean>(false)
  const [isEditingDetails, setIsEditingDetails] = useState<boolean>(false)

  // When we call clearCart() after a successful payment initiation, Zustand
  // clears selectedSection/selectedEvent, which would normally trigger the
  // "if no cart → navigate('/')" useEffect below. This ref lets us skip that
  // guard when we are intentionally navigating away.
  const isNavigatingAway = useRef(false)

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
    if (isNavigatingAway.current) return
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
  const fees = calculateFees(subtotal)

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
    
    const isValid = Object.keys(newErrors).length === 0
    if (!isValid) {
      toast.error('Please fill in all required contact information fields.')
    }
    return isValid
  }

  const handleContinue = async () => {
    // console.log("Handled button clicked");
    
    if (!isAuthenticated) {
      setAuthMode('signin')
      setTimeout(() => {
        const el = document.getElementById('checkout-auth-form')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
      return
    }

    if (!validateForm()) {
      if (isAuthenticated) {
        setIsEditingDetails(true)
      }
      return
    }

    setContactInfo(formData)
    setIsInitializingPayment(true)

    try {
      logger.log('Initiating Stripe Payment Intent...')
      const result = await createPaymentIntent(
        selectedEvent.id,
        selectedSection.id,
        quantity,
        'usd'
      )
      
      setStripeClientSecret(result.clientSecret)
      
      // Scroll to payment card after mounting
      setTimeout(() => {
        const el = document.getElementById('payment-details-card')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    } catch (err: any) {
      logger.error('Failed to create Stripe Payment Intent:', err)
      toast.error(err?.message || 'Failed to initialize payment. Please try again.')
    } finally {
      setIsInitializingPayment(false)
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
            <Card id="checkout-auth-form">
              <CardHeader>
                <CardTitle className="text-lg">
                  {isAuthenticated ? 'Contact Information' : 'Account & Contact Information'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isAuthenticated 
                    ? "We'll use this information to send you updates on your order."
                    : "Please sign in or create an account to continue with your purchase."
                  }
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isAuthenticated ? (
                  <div className="border rounded-xl p-4 bg-muted/10 border-border">
                    <p className="text-sm font-semibold mb-4">
                      {authMode === 'signin' ? 'Sign in to continue' : 'Create an account to continue'}
                    </p>
                    <AuthForm
                      mode={authMode}
                      onToggleMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                      onSuccess={() => {
                        // Handled automatically via Zustand auth store updates
                      }}
                    />
                  </div>
                ) : (
                  <>
                    {isAuthenticated && user && !isEditingDetails ? (
                      <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
                              {(formData.firstName?.[0] || user.firstName?.[0] || 'U').toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-foreground">
                                {formData.firstName || user.firstName} {formData.lastName || user.lastName}
                              </h4>
                              <p className="text-xs text-muted-foreground">Logged-in customer</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {/* <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs rounded-lg px-3"
                              onClick={() => setIsEditingDetails(true)}
                              disabled={stripeClientSecret !== null}
                            >
                              Edit details
                            </Button> */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-destructive hover:bg-destructive/10 rounded-lg px-3"
                              onClick={() => {
                                logout()
                                setFormData({
                                  email: '',
                                  firstName: '',
                                  lastName: '',
                                  phone: '',
                                  countryCode: '+234'
                                })
                                setIsEditingDetails(false)
                              }}
                            >
                              Sign Out
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1">
                            <span className="text-muted-foreground font-medium">Email Address</span>
                            <p className="font-medium text-foreground text-sm">{formData.email || user.email}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-muted-foreground font-medium">Phone Number</span>
                            <p className="font-medium text-foreground text-sm">
                              {formData.phone ? `${formData.countryCode} ${formData.phone}` : 'Not provided'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {isAuthenticated && user && (
                          <div className="flex items-center justify-between p-3 bg-muted/40 text-muted-foreground rounded-lg border border-border text-sm">
                            <span className="font-medium">Signed in as <strong className="font-bold text-foreground">{user.email}</strong></span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 text-xs text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                logout()
                                setFormData({
                                  email: '',
                                  firstName: '',
                                  lastName: '',
                                  phone: '',
                                  countryCode: '+234'
                                })
                                setIsEditingDetails(false)
                              }}
                            >
                              Sign Out
                            </Button>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="you@example.com"
                            disabled={isAuthenticated || stripeClientSecret !== null}
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
                              disabled={stripeClientSecret !== null}
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
                              disabled={stripeClientSecret !== null}
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
                              disabled={stripeClientSecret !== null}
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
                              disabled={stripeClientSecret !== null}
                            />
                          </div>
                          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                        </div>

                        {isAuthenticated && (
                          <div className="flex justify-end pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (validateForm()) {
                                  setIsEditingDetails(false)
                                }
                              }}
                            >
                              Save Details
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox
                        id="newsletter"
                        checked={newsletterOptIn}
                        onCheckedChange={(checked) => setNewsletterOptIn(checked as boolean)}
                        disabled={stripeClientSecret !== null}
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
            <div className="relative">
              <Card className={!isAuthenticated ? 'opacity-60 select-none' : stripeClientSecret ? 'opacity-70' : ''}>
                <CardHeader>
                  <CardTitle className="text-lg">Buying this as a gift?</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={giftOption ? 'yes' : 'no'}
                    onValueChange={(value) => setGiftOption(value === 'yes')}
                    disabled={!isAuthenticated || stripeClientSecret !== null}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="gift-yes" disabled={!isAuthenticated || stripeClientSecret !== null} />
                      <Label htmlFor="gift-yes" className={!isAuthenticated ? 'text-muted-foreground' : ''}>Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="gift-no" disabled={!isAuthenticated || stripeClientSecret !== null} />
                      <Label htmlFor="gift-no" className={!isAuthenticated ? 'text-muted-foreground' : ''}>No</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
              {/* Auth overlay */}
              {!isAuthenticated && (
                <div
                  className="absolute inset-0 rounded-xl flex items-center justify-center cursor-pointer z-10"
                  onClick={() => {
                    setAuthMode('signin')
                    setTimeout(() => {
                      const el = document.getElementById('checkout-auth-form')
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }, 50)
                  }}
                >
                  <div className="bg-background/80 backdrop-blur-[2px] border border-border/60 rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span className="text-xs font-medium text-muted-foreground">Sign in to unlock</span>
                  </div>
                </div>
              )}
            </div>

            {/* Team Support */}
            {selectedEvent.teams && selectedEvent.teams.length > 0 && (
              <div className="relative">
                <Card className={!isAuthenticated ? 'opacity-60 select-none' : stripeClientSecret ? 'opacity-70' : ''}>
                  <CardHeader>
                    <CardTitle className="text-lg">Which team are you rooting for?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={teamSupport ?? ''}
                      onValueChange={setTeamSupport}
                      disabled={!isAuthenticated || stripeClientSecret !== null}
                    >
                      {selectedEvent.teams.map((team) => (
                        <div key={team.code} className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value={team.code} 
                            id={`team-${team.code}`} 
                            disabled={!isAuthenticated || stripeClientSecret !== null} 
                          />
                          <Label htmlFor={`team-${team.code}`} className={`flex items-center gap-2 ${!isAuthenticated || stripeClientSecret !== null ? 'cursor-default text-muted-foreground' : 'cursor-pointer'}`}>
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
                {/* Auth overlay */}
                {!isAuthenticated && (
                  <div
                    className="absolute inset-0 rounded-xl flex items-center justify-center cursor-pointer z-10"
                    onClick={() => {
                      setAuthMode('signin')
                      setTimeout(() => {
                        const el = document.getElementById('checkout-auth-form')
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }, 50)
                    }}
                  >
                    <div className="bg-background/80 backdrop-blur-[2px] border border-border/60 rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span className="text-xs font-medium text-muted-foreground">Sign in to unlock</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2">
              {stripeClientSecret ? (
                <Button
                  className="w-full"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setStripeClientSecret(null)
                  }}
                >
                  Edit Contact & Details
                </Button>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  disabled={isInitializingPayment}
                  variant={!isAuthenticated ? 'outline' : 'default'}
                  onClick={handleContinue}
                >
                  {isInitializingPayment ? (
                    'Initializing secure payment…'
                  ) : !isAuthenticated ? (
                    <span className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Sign in to Continue
                    </span>
                  ) : (
                    'Continue to Payment'
                  )}
                </Button>
              )}
            </div>

            {/* Inline Stripe Payment Form Card */}
            {stripeClientSecret && (
              <Card id="payment-details-card" className="border-primary/20 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Payment Details</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Secure payment processed by Stripe. Your tickets are held for you.
                  </p>
                </CardHeader>
                <CardContent>
                  {stripeClientSecret.startsWith('pi_mock_') ? (
                    <MockPaymentForm
                      clientSecret={stripeClientSecret}
                      totalAmount={fees.total}
                      contactInfo={formData}
                      eventId={selectedEvent.id}
                      sectionId={selectedSection.id}
                      quantity={quantity}
                      giftOption={giftOption}
                      teamSupport={teamSupport}
                      onSuccess={() => {
                        isNavigatingAway.current = true
                      }}
                    />
                  ) : (
                    <Elements 
                      stripe={stripePromise} 
                      options={{ 
                        clientSecret: stripeClientSecret, 
                        appearance: { 
                          theme: theme === 'dark' ? 'night' : 'flat',
                          variables: {
                            colorPrimary: '#10b981',
                            colorBackground: theme === 'dark' ? '#18181b' : '#ffffff',
                            colorText: theme === 'dark' ? '#f4f4f5' : '#0f172a',
                            colorDanger: '#ef4444',
                            borderRadius: '8.4px',
                          }
                        } 
                      }}
                    >
                      <InlinePaymentForm
                        totalAmount={fees.total}
                        contactInfo={formData}
                        eventId={selectedEvent.id}
                        sectionId={selectedSection.id}
                        quantity={quantity}
                        giftOption={giftOption}
                        teamSupport={teamSupport}
                        onSuccess={() => {
                          isNavigatingAway.current = true
                        }}
                      />
                    </Elements>
                  )}
                </CardContent>
              </Card>
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
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Tax (8%)</span>
                    <span>{formatCurrency(fees.tax)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Handling fee (2%)</span>
                    <span>{formatCurrency(fees.handlingFee)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Booking fee (3%)</span>
                    <span>{formatCurrency(fees.bookingFee)}</span>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold">{formatCurrency(fees.total)}</span>
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

interface PaymentFormProps {
  clientSecret?: string
  totalAmount: number
  contactInfo: CheckoutFormData
  eventId: string
  sectionId: string
  quantity: number
  giftOption: boolean
  teamSupport: string | null
  onSuccess: () => void
}

function MockPaymentForm({
  clientSecret,
  totalAmount,
  contactInfo,
  eventId,
  sectionId,
  quantity,
  onSuccess,
}: PaymentFormProps) {
  const navigate = useNavigate()
  const { clearCart } = useCartStore()
  const { addOrder } = useOrdersStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242')
  const [expiry, setExpiry] = useState('12/28')
  const [cvc, setCvc] = useState('424')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      logger.log('MockPaymentForm - Confirming Mock Order...')
      
      const order = await paymentService.confirmOrder({
        eventId,
        sectionId,
        quantity,
        totalAmount,
        paymentMethod: 'stripe_mock',
        stripePaymentIntentId: clientSecret || 'mock_pi_default',
        contactInfo: {
          firstName: contactInfo.firstName,
          lastName: contactInfo.lastName,
          email: contactInfo.email,
          phone: contactInfo.phone,
          countryCode: contactInfo.countryCode,
        },
      })

      addOrder(order)
      onSuccess()
      clearCart()
      toast.success('Simulated payment successful!')
      navigate(`/payment/success?order_id=${order.id}`)
    } catch (err: any) {
      logger.error('Mock payment confirmation failed:', err)
      toast.error(err?.message || 'Failed to complete order. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-xs flex gap-2">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
        <div>
          <span className="font-semibold block mb-0.5">Demo Stripe Sandbox</span>
          Stripe is operating in simulated mode. No real cards will be charged.
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="mock-card-num" className="text-xs">Card Number</Label>
          <Input
            id="mock-card-num"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="4242 4242 4242 4242"
            className="font-mono text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="mock-expiry" className="text-xs">Expiration Date</Label>
            <Input
              id="mock-expiry"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="MM/YY"
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mock-cvc" className="text-xs">CVC</Label>
            <Input
              id="mock-cvc"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              placeholder="123"
              className="font-mono text-sm"
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isProcessing}
        className="w-full flex items-center justify-center gap-2"
        size="lg"
      >
        {isProcessing ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Simulating Transaction...
          </>
        ) : (
          `Pay ${formatCurrency(totalAmount)} (Simulated)`
        )}
      </Button>
    </form>
  )
}

function InlinePaymentForm({
  totalAmount,
  contactInfo,
  eventId,
  sectionId,
  quantity,
  giftOption,
  teamSupport,
  onSuccess,
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    // Save pending order details in sessionStorage BEFORE confirming payment.
    const pendingPayload = {
      eventId,
      sectionId,
      quantity,
      totalAmount,
      paymentMethod: 'card',
      contactInfo: {
        firstName: contactInfo.firstName,
        lastName: contactInfo.lastName,
        email: contactInfo.email,
        phone: contactInfo.phone,
        countryCode: contactInfo.countryCode,
      },
      giftOption,
      teamSupport,
    }
    sessionStorage.setItem('pending_order_payload', JSON.stringify(pendingPayload))

    onSuccess() // sets isNavigatingAway to true

    const returnUrl = `${window.location.origin}/payment/success`

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    })

    if (error) {
      logger.error('Payment confirmation failed:', error)
      setErrorMessage(error.message ?? 'An unexpected error occurred.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {errorMessage && (
        <div className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg">
          {errorMessage}
        </div>
      )}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full flex items-center justify-center gap-2"
        size="lg"
      >
        {isProcessing ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Processing Secure Payment...
          </>
        ) : (
          `Pay ${formatCurrency(totalAmount)}`
        )}
      </Button>
    </form>
  )
}