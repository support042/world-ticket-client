import axios from 'axios';
import { isTokenExpired } from '@/lib/tokenUtils';
import { logger } from '@/lib/logger';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.mockbackend.local',
  // 30s timeout — free-tier servers (Render, Railway, Fly.io) can take 15-25s
  // to wake from sleep on the first request. 10s was too short.
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Live token getters ───────────────────────────────────────────────────────
// Instead of reading from localStorage (which has async flush delays from
// Zustand's persist middleware), we use in-memory getters registered by the
// stores themselves. This prevents the race condition where a user logs in and
// immediately triggers an API call before localStorage has been written.
let _getUserToken: (() => string | null) | null = null;
let _getAdminToken: (() => string | null) | null = null;

export function registerUserTokenGetter(fn: () => string | null) {
  _getUserToken = fn;
}
export function registerAdminTokenGetter(fn: () => string | null) {
  _getAdminToken = fn;
}

// Fallback: read from localStorage (used before stores register their getters)
function readTokenFromStorage(storageKey: string): string | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw)?.state?.token ?? null;
  } catch {
    return null;
  }
}

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
// 2. Reads from live in-memory getters first (set by auth stores), with a
//    localStorage fallback for edge cases before stores initialize
// 3. Checks the token BEFORE sending — if already expired, fire event immediately
apiClient.interceptors.request.use(
  (config) => {
    let token: string | null = null;
    let isAdminRoute = false;

    isAdminRoute = !!(
      config.url &&
      (config.url.startsWith('/admin') ||
       config.url.startsWith('admin') ||
       config.url.includes('/admin/'))
    );

    // Prefer live in-memory getters (no flush delay), fall back to localStorage
    if (isAdminRoute) {
      token = _getAdminToken ? _getAdminToken() : readTokenFromStorage('admin-storage');
    } else {
      token = _getUserToken ? _getUserToken() : readTokenFromStorage('auth-storage');
    }

    // ── Proactive expiry check ────────────────────────────────────────────────
    // Skip for login endpoints so the login form itself can still get a response
    const isLoginRequest = config.url?.includes('/login') || config.url?.includes('/register');
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
