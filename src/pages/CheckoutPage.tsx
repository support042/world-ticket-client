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
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [showSectionDetails, setShowSectionDetails] = useState<boolean>(false)
  const [countdown, setCountdown] = useState<number>(599)

  // When we call clearCart() after a successful payment initiation, Zustand
  // clears selectedSection/selectedEvent, which would normally trigger the
  // "if no cart → navigate('/')" useEffect below. This ref lets us skip that
  // guard when we are intentionally navigating away to /my-tickets.
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
  const handleContinue = async () => {
    // ── Auth guard ──────────────────────────────────────────────────────────
    if (!isAuthenticated) {
      setShowAuthForm(true)
      setAuthMode('signin')
      setTimeout(() => {
        const el = document.getElementById('checkout-auth-form')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
      return
    }

    if (!validateForm()) return

    setContactInfo(formData)

    const paymentLink = selectedSection?.paymentLink

    if (paymentLink) {
      // ── CRITICAL: Open the window SYNCHRONOUSLY in the click handler ──────
      // Browsers treat window.open() called after an async/await as a delayed
      // script (not a direct user gesture) and silently block the popup.
      // By opening 'about:blank' here — before any await — the popup is always
      // allowed. We then point the already-open window at the real URL once the
      // API call succeeds.
      const paymentWindow = window.open('', '_blank', 'noopener')

      // Show a friendly loading screen in the new tab while the API runs
      if (paymentWindow) {
        paymentWindow.document.write(
          '<!DOCTYPE html><html><head>' +
          '<title>Preparing Checkout\u2026</title>' +
          '<meta name="viewport" content="width=device-width,initial-scale=1">' +
          '<style>' +
          '*{box-sizing:border-box;margin:0;padding:0}' +
          'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
          'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
          'min-height:100vh;background:#f9fafb;color:#374151}' +
          '.spinner{width:36px;height:36px;border:3px solid #e5e7eb;' +
          'border-top-color:#3b82f6;border-radius:50%;animation:spin .8s linear infinite;margin-bottom:20px}' +
          '@keyframes spin{to{transform:rotate(360deg)}}' +
          'h2{font-size:1.125rem;font-weight:600;margin-bottom:8px}' +
          'p{font-size:.875rem;color:#6b7280}' +
          '</style></head><body>' +
          '<div class="spinner"></div>' +
          '<h2>Preparing your secure checkout\u2026</h2>' +
          '<p>Please wait while we confirm your reservation.</p>' +
          '</body></html>'
        )
        paymentWindow.document.close()
      }

      try {
        await initiatePayment(selectedSection!.id, paymentLink)

        // Point the already-open tab at the real payment URL
        if (paymentWindow && !paymentWindow.closed) {
          paymentWindow.location.href = paymentLink
        } else {
          // Fallback: tab was somehow closed, try a fresh open
          window.open(paymentLink, '_blank', 'noopener,noreferrer')
        }

        // ── Set flag BEFORE clearCart() ──────────────────────────────────
        // clearCart() nulls out selectedSection/selectedEvent which triggers
        // the useEffect guard on line ~87. Without this flag it would
        // immediately fire navigate('/') and override our navigate below.
        isNavigatingAway.current = true
        clearCart()
        navigate('/my-tickets')
      } catch (err: any) {
        // Close the blank loading tab so we don't leave it orphaned
        if (paymentWindow && !paymentWindow.closed) paymentWindow.close()
        logger.error('Failed to initiate payment tracking:', err)
        toast.error(err?.message || 'Failed to initiate payment. Please try again.')
      }
    } else {
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
                  <div id="checkout-auth-form" className="border rounded-lg p-4">
                    <p className="text-sm font-semibold mb-3">
                      {authMode === 'signin' ? 'Sign in to continue' : 'Create an account to continue'}
                    </p>
                    <AuthForm
                      mode={authMode}
                      onToggleMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                      onSuccess={() => {
                        setShowAuthForm(false)
                        // After successful login, automatically proceed if form is valid
                        setTimeout(() => handleContinue(), 100)
                      }}
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
            <div className="relative">
              <Card className={!isAuthenticated ? 'opacity-60 select-none' : ''}>
                <CardHeader>
                  <CardTitle className="text-lg">Buying this as a gift?</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={giftOption ? 'yes' : 'no'}
                    onValueChange={(value) => setGiftOption(value === 'yes')}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="gift-yes" disabled={!isAuthenticated} />
                      <Label htmlFor="gift-yes" className={!isAuthenticated ? 'text-muted-foreground' : ''}>Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="gift-no" disabled={!isAuthenticated} />
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
                    setShowAuthForm(true)
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
                <Card className={!isAuthenticated ? 'opacity-60 select-none' : ''}>
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
                          <RadioGroupItem value={team.code} id={`team-${team.code}`} disabled={!isAuthenticated} />
                          <Label htmlFor={`team-${team.code}`} className={`flex items-center gap-2 ${!isAuthenticated ? 'cursor-default text-muted-foreground' : 'cursor-pointer'}`}>
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
                      setShowAuthForm(true)
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
                    // variant=default colours — muted when unauthenticated
                    isAuthenticated
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground border border-border',
                    // size=lg padding
                    'h-11 px-8',
                    // full-width
                    'w-full',
                    // loading state
                    isInitiating ? 'opacity-70 pointer-events-none' : '',
                  ].join(' ')
                }
              >
                {isInitiating ? (
                  'Processing…'
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
              </a>
            ) : (
              /* No paymentLink – fall back to the old Button (navigates nowhere
                 until an admin adds a link or we re-enable our own Stripe page) */
              <Button
                className="w-full"
                size="lg"
                disabled={isInitiating}
                variant={!isAuthenticated ? 'outline' : 'default'}
                onClick={handleContinue}
              >
                {isInitiating ? (
                  'Processing…'
                ) : !isAuthenticated ? (
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Sign in to Continue
                  </span>
                ) : (
                  'Continue'
                )}
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