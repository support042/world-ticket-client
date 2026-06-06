/**
 * Dev-only logger.
 *
 * Vite sets `import.meta.env.DEV = true` during `npm run dev` and
 * `import.meta.env.PROD = true` during `npm run build`.
 *
 * Usage:
 *   import { logger } from '@/lib/logger'
 *   logger.log('something', value)   // only visible in dev
 *   logger.error('oops', err)        // always visible (even in prod)
 */

const isDev = import.meta.env.DEV

export const logger = {
  /** Dev only — silent in production builds */
  log: (...args: unknown[]): void => {
    if (isDev) console.log(...args)
  },

  /** Dev only — silent in production builds */
  warn: (...args: unknown[]): void => {
    if (isDev) console.warn(...args)
  },

  /** Dev only — silent in production builds */
  info: (...args: unknown[]): void => {
    if (isDev) console.info(...args)
  },

  /**
   * Always visible — use for real runtime errors that matter in production too.
   * Never silence errors; you want to know when something breaks.
   */
  error: (...args: unknown[]): void => {
    console.error(...args)
  },
}
