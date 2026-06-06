import axios from 'axios';
import { isTokenExpired } from '@/lib/tokenUtils';
import { logger } from '@/lib/logger';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.mockbackend.local',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Helper: fire the session-expired event ───────────────────────────────────
// This is a plain DOM event so api.ts (a non-React module) can trigger it.
// SessionWatcher.tsx listens for it and handles logout + navigation.
function fireSessionExpired(isAdmin: boolean) {
  window.dispatchEvent(
    new CustomEvent('auth:session-expired', { detail: { isAdmin } })
  );
}

// ─── Request Interceptor ─────────────────────────────────────────────────────
// 1. Picks the right token (admin vs user) based on route
// 2. Checks the token BEFORE sending — if already expired, fire event immediately
apiClient.interceptors.request.use(
  (config) => {
    let token: string | null = null;
    let isAdminRoute = false;

    try {
      const authData  = JSON.parse(localStorage.getItem('auth-storage')  || '{"state":{}}');
      const adminData = JSON.parse(localStorage.getItem('admin-storage') || '{"state":{}}');

      const adminToken = adminData.state?.token ?? null;
      const userToken  = authData.state?.token  ?? null;

      isAdminRoute = !!(
        config.url &&
        (config.url.startsWith('/admin') ||
         config.url.startsWith('admin') ||
         config.url.includes('/admin/'))
      );

      token = isAdminRoute ? adminToken : userToken;
    } catch (e) {
      logger.error('Failed to parse auth tokens', e);
    }

    // ── Proactive expiry check ────────────────────────────────────────────────
    // Skip for login endpoints so the login form itself can still get a response
    const isLoginRequest = config.url?.includes('/login');
    if (token && !isLoginRequest && isTokenExpired(token)) {
      logger.warn(`[api] Token expired before request to ${config.url}. Logging out.`);
      fireSessionExpired(isAdminRoute);
      // Cancel the outgoing request — no point hitting the server
      return Promise.reject(new Error('Session expired. Please sign in again.'));
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
// Fallback: catch 401s the server sends back (e.g., clock skew, token revoked)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      const isAdminRoute = !!(
        error.config?.url &&
        (error.config.url.startsWith('/admin') ||
         error.config.url.includes('/admin/'))
      );
      logger.warn(`[api] 401 received for ${error.config?.url}. Firing session-expired event.`);
      fireSessionExpired(isAdminRoute);
    }

    // Bubble up a clean error with the server's message
    const serverMessage = error.response?.data?.message || error.message;
    logger.error('API Error:', {
      status: error.response?.status,
      message: serverMessage,
      url: error.config?.url,
    });

    return Promise.reject(new Error(serverMessage));
  }
);

export default apiClient;
