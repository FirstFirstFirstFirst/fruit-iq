import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatThaiCurrency(amount: number): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
  }).format(safeAmount)
}

export function formatWeight(weight: number): string {
  const safeWeight = typeof weight === 'number' && !isNaN(weight) ? weight : 0
  return `${safeWeight.toFixed(2)} กก.`
}