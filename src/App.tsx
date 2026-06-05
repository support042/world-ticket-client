import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom"
import { lazy, Suspense, useEffect } from "react"
import { ThemeProvider } from "@/components/ThemeProvider"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import LoadingScreen from "@/components/common/LoadingScreen"
import { useAdminStore } from "@/store/authStore"
import { useEventsStore } from "@/store/eventsStore"

// Lazy load pages
const HomePage = lazy(() => import("@/pages/HomePage"))
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"))
const PaymentPage = lazy(() => import("./pages/PaymentPage"))
const EventTicketPage = lazy(() => import("./pages/EventTicketPage"))
const SectionDetailsPage = lazy(() => import("./pages/SectionDetailsPage"))
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"))
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"))
const AdminSectionsPage = lazy(() => import("./pages/admin/AdminSectionsPage"))
const MyTicketsPage = lazy(() => import("./pages/MyTicketsPage"))
const ProfilePage = lazy(() => import("./pages/ProfilePage"))
const CartPage = lazy(() => import("./pages/CartPage"))
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
          <Routes>
            {/* ===== ADMIN ROUTES - no header/footer ===== */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/events/:eventId/sections" element={<AdminRoute><AdminSectionsPage /></AdminRoute>} />

            {/* ===== PUBLIC ROUTES - with conditional footer ===== */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/event/:id" element={<EventTicketPage />} />
              <Route path="/event/:id/section/:sectionId" element={<SectionDetailsPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/my-tickets" element={<MyTicketsPage />} />
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