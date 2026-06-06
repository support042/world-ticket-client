import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return 'TBD'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date)
  } catch (e) {
    console.error("formatDate error:", e)
    return dateString || 'TBD'
  }
}

export function formatTime(timeString: string | undefined | null): string {
  if (!timeString) return 'TBD'
  try {
    const parts = timeString.split(':')
    if (parts.length < 2) return timeString
    const [hours, minutes] = parts
    const date = new Date()
    date.setHours(parseInt(hours, 10) || 0, parseInt(minutes, 10) || 0)
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  } catch (e) {
    console.error("formatTime error:", e)
    return timeString || 'TBD'
  }
}

export interface FeeBreakdown {
  tax: number
  handlingFee: number
  bookingFee: number
  total: number
}

export function calculateFees(subtotal: number): FeeBreakdown {
  const tax = subtotal * 0.08
  const handlingFee = subtotal * 0.02
  const bookingFee = subtotal * 0.03
  const total = subtotal + tax + handlingFee + bookingFee
  return { tax, handlingFee, bookingFee, total }
}