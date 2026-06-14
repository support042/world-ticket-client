export type AuthMode = 'signin' | 'signup'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  countryCode?: string
  avatar: string | null
  createdAt: string
}

export interface Admin {
  id: string
  email: string
  name: string
  role: 'admin'
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  token: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>
  signup: (userData: SignupData) => Promise<{ success: boolean; user?: User; error?: string }>
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
  clearError: () => void
}

export interface AdminState {
  admin: Admin | null
  isAdminAuthenticated: boolean
  isLoading: boolean
  error: string | null
  token: string | null
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  adminLogout: () => void
  clearError: () => void
}

export interface SignupData {
  email: string
  firstName: string
  lastName: string
  phone?: string
  countryCode?: string
}

export interface AuthFormProps {
  mode?: AuthMode
  onToggleMode: () => void
  onSuccess: (user?: User) => void
}

export interface FormData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  countryCode: string
  newsletter: boolean
}

export interface FormErrors {
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  phone?: string
}

export interface CountryCode {
  code: string
  country: string
}

// --- Event Types ---
export interface Team {
  name: string
  flag: string
  code: string
}

export interface Category {
  id: number
  name: string
  price: number
  color: string
  available: number
}

export interface Section {
  id: string
  name: string
  row: string
  price: number
  available: number
  features: string[]
  isPopular?: boolean
  isLowestPrice?: boolean
  isFanFavorite?: boolean
  ticketsSoldLastHour?: number
  rating?: number
  ratingLabel?: string
  sectionImage?: string
  paymentLink?: string
}

export interface Event {
  id: string
  title: string
  tournament: string
  stage: string
  date: string
  time: string
  venue: string
  city: string
  state: string
  country: string
  ticketsLeftPercent: number
  priceRange: { min: number; max: number }
  viewsLastHour: number
  favorites: number
  image: string
  teams: Team[]
  categories: Category[]
  sections: Section[]
  createdAt?: string
  updatedAt?: string
}

export interface Tournament {
  id: string
  name: string
  description: string
  logo: string
  bannerImage: string
  totalEvents: number
  countries: string[]
}

export interface Venue {
  id: string
  name: string
  city: string
  country: string
  capacity: number
  image: string
  seatMapImage: string
}

// --- Filters ---
export interface EventFilters {
  location: string
  team: string
  round: string
  dateRange: string
  priceRange: { min: number; max: number }
}

// --- Events Store ---
export interface EventsState {
  events: Event[]
  filters: EventFilters
  searchQuery: string
  isLoading: boolean
  isFetching: boolean
  // Pagination
  currentPage: number
  totalPages: number
  hasMore: boolean
  eventsPerPage: number
  totalResults: number
  fetchError: string | null
  clearFetchError: () => void
  
  setSearchQuery: (query: string) => void
  setFilters: (filters: Partial<EventFilters>) => void
  clearFilters: () => void
  getFilteredEvents: () => Event[]
  getEventById: (id: string) => Event | undefined
  fetchEventById: (id: string) => Promise<Event | null>
  fetchInitialEvents: () => Promise<void>
  loadMoreEvents: () => Promise<void>
  goToPage: (page: number) => Promise<void>
  addEvent: (eventData: Partial<Event>) => Promise<Event>
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>
  deleteEvent: (eventId: string) => void
  addSection: (eventId: string, sectionData: Partial<Section>) => Promise<Section>
  updateSection: (eventId: string, sectionId: string, updates: Partial<Section>) => void
  deleteSection: (eventId: string, sectionId: string) => void
}

// --- Cart Types ---
export interface CartItem {
  id: string
  eventId: string
  eventTitle: string
  eventDate: string
  eventTime: string
  venue: string
  section: string
  row: string
  quantity: number
  pricePerTicket: number
  subtotal: number
  sectionImage?: string
  addedAt: string
}

export interface ContactInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface OrderSummary {
  event: Event
  section: Section
  quantity: number
  pricePerTicket: number
  subtotal: number
  tax: number
  handlingFee: number
  bookingFee: number
  total: number
}

export interface CartState {
  items: CartItem[]
  selectedEvent: Event | null
  selectedSection: Section | null
  quantity: number
  contactInfo: ContactInfo | null
  paymentMethod: string | null
  giftOption: boolean
  teamSupport: string | null
  newsletterOptIn: boolean
  setSelectedEvent: (event: Event) => void
  setSelectedSection: (section: Section) => void
  setQuantity: (quantity: number) => void
  addToCart: (event: Event, section: Section, qty: number) => CartItem
  removeFromCart: (itemId: string) => void
  clearCart: () => void
  setContactInfo: (info: ContactInfo) => void
  setPaymentMethod: (method: string) => void
  setGiftOption: (isGift: boolean) => void
  setTeamSupport: (team: string) => void
  setNewsletterOptIn: (optIn: boolean) => void
  getOrderSummary: () => OrderSummary | null
  getCartTotal: () => number
}

export interface FilterOption {
  value: string
  label: string
}

// Payments

export interface CheckoutFormData {
  email: string
  firstName: string
  lastName: string
  phone: string
  countryCode: string
}

export interface CheckoutFormErrors {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
}

export interface CardDetails {
  number: string
  expiry: string
  cvc: string
  name: string
}

export interface CardErrors {
  number?: string
  expiry?: string
  cvc?: string
  name?: string
}

export interface PaymentMethod {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }> | null
  logo?: string
}

// Admin
export interface EventForm {
  title: string
  tournament: string
  stage: string
  date: string
  time: string
  venue: string
  city: string
  state: string
  country: string
  ticketsLeftPercent: number | string
  priceMin: number | string
  priceMax: number | string
  image: string
  team1Name: string
  team1Flag: string
  team1Code: string
  team2Name: string
  team2Flag: string
  team2Code: string
}

export interface SectionForm {
  name: string
  row: string
  price: number | string
  available: number | string
  features: string
  isPopular: boolean
  isLowestPrice: boolean
  sectionImage: string
  paymentLink?: string
}

export type DeleteTargetType = 'event' | 'section' | null

export interface DeleteTarget {
  type: DeleteTargetType
  id: string | null
  eventId: string | null
}

// ─── Stripe / Orders ─────────────────────────────────────────────────────────

/** Status values that Stripe and our backend can produce for an order */
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded' | 'completed' | 'processing'

/** A single ticket associated with a paid order */
export interface Ticket {
  id: string
  barcode: string        // QR code data / barcode string
  seatNumber?: string    // optional: specific seat assignment
  issuedAt?: string      // ISO timestamp when ticket was generated
}

/** Minimal event/section info embedded inside an Order (from the backend) */
export interface OrderSection {
  id: string
  name: string
  row: string
  eventId?: string
  eventTitle?: string
  eventDate?: string
  eventTime?: string
  eventVenue?: string
  eventCity?: string
  eventCountry?: string
}

/** A fully resolved order as returned by GET /api/orders */
export interface Order {
  id: string
  stripePaymentIntentId?: string
  stripeSessionId?: string // legacy fallback
  status: OrderStatus
  quantity: number
  subtotal?: number        // pre-fee subtotal
  totalAmount: number     // what the user actually paid (including fees)
  currency?: string        // 'usd' | 'gbp' etc.
  event?: Event           // full event object from backend
  section: Section | OrderSection // support both full Section and legacy OrderSection
  contactInfo: ContactInfo
  tickets?: Ticket[]      // optional: can be generated on frontend if missing
  createdAt: string
  updatedAt?: string
}

/** Payload returned by POST /api/checkout/intent */
export interface CreatePaymentIntentResponse {
  clientSecret: string
  amount: number
  currency: string
}

/** Legacy payload returned by POST /payments/create-checkout-session */
export interface CreateCheckoutSessionResponse {
  sessionId: string
  checkoutUrl: string
}

/** Legacy payload returned by GET /payments/session/:sessionId (success-page verification) */
export interface StripeSessionDetails {
  sessionId: string
  status: 'open' | 'complete' | 'expired'
  amountTotal: number   // in cents — divide by 100 for display
  currency: string
  order: Order | null   // null if webhook hasn't fired yet
}