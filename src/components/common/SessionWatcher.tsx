import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore, useAdminStore } from '@/store/authStore'

/**
 * SessionWatcher
 * 
 * Mounts once inside the React Router tree. Listens for the
 * 'auth:session-expired' DOM event fired by api.ts and handles:
 *  - Calling the correct logout action (user or admin)
 *  - Navigating to the correct "safe" screen
 *  - Showing a professional toast message so the user knows what happened
 * 
 * This pattern keeps api.ts framework-agnostic while still allowing
 * proper React navigation on session expiry.
 */
export default function SessionWatcher() {
  const navigate    = useNavigate()
  const location    = useLocation()
  const { logout }       = useAuthStore()
  const { adminLogout }  = useAdminStore()

  useEffect(() => {
    // Guard: only fire once per expiry event, not multiple concurrent requests
    let handled = false

    const handler = (e: Event) => {
      if (handled) return
      handled = true

      const { isAdmin } = (e as CustomEvent<{ isAdmin: boolean }>).detail

      if (isAdmin) {
        adminLogout()
        navigate('/admin/login', { replace: true })
        toast.error('Admin session expired', {
          description: 'Your session has timed out. Please sign in again to continue.',
          duration: 6000,
        })
      } else {
        // Save the page they were on so we can show it in the toast
        const currentPath = location.pathname
        logout()

        // If they were on a protected page, go back to '/' since
        // UserRoute will show the sign-in prompt on those pages.
        // For all other pages (checkout, event detail) stay on the same path.
        const protectedPaths = ['/my-tickets', '/profile']
        const isProtected = protectedPaths.some(p => currentPath.startsWith(p))
        
        if (isProtected) {
          // UserRoute will render the sign-in prompt for them automatically
          navigate(currentPath, { replace: true })
        }
        // If on a non-protected page (e.g. /checkout), stay there —
        // the page itself handles the auth state.

        toast.error('Session expired', {
          description: 'Please sign in again to continue where you left off.',
          duration: 6000,
        })
      }

      // Reset guard after a short window so future legitimate expirations fire
      setTimeout(() => { handled = false }, 3000)
    }

    window.addEventListener('auth:session-expired', handler)
    return () => window.removeEventListener('auth:session-expired', handler)
  }, [navigate, location, logout, adminLogout])

  // Renders nothing — this is a behaviour-only component
  return null
}
