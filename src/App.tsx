import { Routes, Route, Navigate, useLocation, Outlet, useNavigate } from "react-router-dom"
import { lazy, Suspense, useEffect, useState } from "react"
import { ThemeProvider } from "@/components/ThemeProvider"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import LoadingScreen from "@/components/common/LoadingScreen"
import SessionWatcher from "@/components/common/SessionWatcher"
import ScrollToTop from "@/components/common/ScrollToTop"
import { useAdminStore, useAuthStore } from "@/store/authStore"
import { useEventsStore } from "@/store/eventsStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import AuthForm from "@/components/auth/AuthForm"
import type { AuthMode } from "@/types"

// Lazy load pages
const HomePage = lazy(() => import("@/pages/HomePage"))
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"))
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"))
const PaymentCancelPage = lazy(() => import("./pages/PaymentCancelPage"))
const EventTicketPage = lazy(() => import("./pages/EventTicketPage"))
const SectionDetailsPage = lazy(() => import("./pages/SectionDetailsPage"))
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"))
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"))
const AdminSectionsPage = lazy(() => import("./pages/admin/AdminSectionsPage"))
const AdminPaymentsPage = lazy(() => import("./pages/admin/AdminPaymentsPage"))
const MyTicketsPage = lazy(() => import("./pages/MyTicketsPage"))
const TicketViewerPage = lazy(() => import("./pages/TicketViewerPage"))
const ProfilePage = lazy(() => import("./pages/ProfilePage"))
// const CartPage = lazy(() => import("./pages/CartPage"))
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"))

// Company, Support & Legal Informational Pages
const AboutPage = lazy(() => import("./pages/AboutPage"))
const CareersPage = lazy(() => import("./pages/CareersPage"))
const PressPage = lazy(() => import("./pages/PressPage"))
const HelpPage = lazy(() => import("./pages/HelpPage"))
const ContactPage = lazy(() => import("./pages/ContactPage"))
const FAQPage = lazy(() => import("./pages/FAQPage"))
const TermsPage = lazy(() => import("./pages/TermsPage"))
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"))
const CookiesPage = lazy(() => import("./pages/CookiesPage"))
const ComingSoonPage = lazy(() => import("./pages/ComingSoonPage"))

// Admin route protection wrapper
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated } = useAdminStore()

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}

// User route protection wrapper
// Unlike AdminRoute, this does NOT hard-redirect. It renders an inline
// "Please sign in" prompt on the same page so users don't lose context.
function UserRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('signin')

  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 py-16 px-4">
      <div className="text-center space-y-3 max-w-sm">
        <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground">Sign in to continue</h2>
        <p className="text-sm text-muted-foreground">
          You need to be signed in to access this page. Please sign in or create an account to continue.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => { setAuthMode('signin'); setAuthDialogOpen(true) }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer"
        >
          Sign In
        </button>
        <button
          onClick={() => { setAuthMode('signup'); setAuthDialogOpen(true) }}
          className="border border-border hover:bg-muted text-foreground font-bold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer"
        >
          Create Account
        </button>
        <button
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground font-medium text-sm px-4 py-2.5 rounded-xl transition-all cursor-pointer"
        >
          Go Back
        </button>
      </div>
      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</DialogTitle>
          </DialogHeader>
          <AuthForm
            mode={authMode}
            onToggleMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
            onSuccess={() => setAuthDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Wrapper component that conditionally shows footer
function PublicLayout() {
  const location = useLocation()
  
  // Pages where you DON'T want the footer
  const hideFooterPaths = [
    '/event/',      // All event ticket pages
    '/checkout',
    '/payment'
  ]
  
  const shouldHideFooter = hideFooterPaths.some(path => 
    location.pathname.startsWith(path)
  )
  
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Add max-width container for all page content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6">
          <Outlet />
        </div>
      </main>
      {!shouldHideFooter && <Footer />}
    </>
  )
}

const App = () => {
  const { fetchInitialEvents } = useEventsStore()

  useEffect(() => {
    fetchInitialEvents()
  }, [fetchInitialEvents])

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background flex flex-col">
        <Suspense fallback={<LoadingScreen />}>
            {/* SessionWatcher sits outside <Routes> but inside BrowserRouter — useNavigate works here */}
            <SessionWatcher />
            {/* Resets scroll position to top on page transitions */}
            <ScrollToTop />
            <Routes>
            {/* ===== ADMIN ROUTES - no header/footer ===== */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/payments" element={<AdminRoute><AdminPaymentsPage /></AdminRoute>} />
            <Route path="/admin/events/:eventId/sections" element={<AdminRoute><AdminSectionsPage /></AdminRoute>} />

            {/* ===== PUBLIC ROUTES - with conditional footer ===== */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/event/:id" element={<EventTicketPage />} />
              <Route path="/event/:id/section/:sectionId" element={<SectionDetailsPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
              <Route path="/payment/cancel" element={<PaymentCancelPage />} />
              <Route path="/cart" element={<Navigate to="/" replace />} />
              <Route path="/profile" element={<UserRoute><ProfilePage /></UserRoute>} />
              <Route path="/my-tickets" element={<UserRoute><MyTicketsPage /></UserRoute>} />
              <Route path="/my-tickets/:orderId" element={<UserRoute><TicketViewerPage /></UserRoute>} />
              <Route path="/favorites" element={<div>Favorites Coming Soon</div>} />
              
              {/* Company, Support & Legal Informational Pages */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/press" element={<PressPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/cookies" element={<CookiesPage />} />
              <Route path="/concerts" element={<ComingSoonPage />} />
              <Route path="/sports" element={<ComingSoonPage />} />

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </div>
    </ThemeProvider>
  )
}

export default App