/**
 * Decodes a JWT token's payload (without verifying signature).
 * Safe to use client-side for expiry checks only.
 */
export function decodeJWT(token: string): { exp?: number; role?: string; sub?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    // Pad base64url to standard base64 before decoding
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4)
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

/**
 * Returns true if the token is missing, malformed, or past its `exp` timestamp.
 * Adds a 10-second buffer so we expire slightly early and avoid edge cases.
 */
export function isTokenExpired(token: string | null | undefined): boolean {
  if (!token) return true
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) return true
  const bufferMs = 10_000 // 10 second buffer
  return decoded.exp * 1000 < Date.now() + bufferMs
}
