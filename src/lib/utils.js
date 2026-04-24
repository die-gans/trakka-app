import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount, currency = 'AUD') {
  const value = Number.isFinite(amount) ? amount : Number(amount) || 0
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatDuration(minutes) {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (!hrs) return `${mins} min`
  if (!mins) return `${hrs} hr${hrs === 1 ? '' : 's'}`
  return `${hrs} hr ${mins} min`
}

export function formatDistance(km) {
  if (km >= 10) return `${Math.round(km)} km`
  return `${km.toFixed(1)} km`
}

export function getInitials(name) {
  if (!name) return '??'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
