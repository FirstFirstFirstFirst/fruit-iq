import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Thai number formatting utilities
export function formatThaiCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatWeight(weight: number): string {
  return `${weight.toFixed(2)} กก.` // kg in Thai
}

// Parse weight from OCR text (handles formats like "2.45 kg", "2450g", "2.45")
export function parseWeight(text: string): number | null {
  // Remove whitespace and convert to lowercase
  const cleaned = text.replace(/\s+/g, '').toLowerCase()
  
  // Try to extract number with kg
  const kgMatch = cleaned.match(/(\d+\.?\d*)\s*k?g/)
  if (kgMatch) {
    return parseFloat(kgMatch[1])
  }
  
  // Try to extract number with grams
  const gMatch = cleaned.match(/(\d+\.?\d*)\s*g/)
  if (gMatch) {
    return parseFloat(gMatch[1]) / 1000 // Convert grams to kg
  }
  
  // Try to extract just a number (assume kg)
  const numberMatch = cleaned.match(/(\d+\.?\d*)/)
  if (numberMatch) {
    return parseFloat(numberMatch[1])
  }
  
  return null
}

// Generate PromptPay QR code data
export function generatePromptPayData(amount: number): string {
  // This is a simplified version - in production you'd need proper PromptPay QR generation
  // For now, we'll create a basic QR data structure
  const promptPayId = "0000000000000" // Placeholder - user would configure their PromptPay ID
  
  return JSON.stringify({
    type: "promptpay",
    id: promptPayId,
    amount: amount.toFixed(2),
    currency: "THB",
    timestamp: new Date().toISOString()
  })
}

// Date formatting for Thai locale
export function formatThaiDate(date: Date): string {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Bangkok'
  }).format(date)
}

export function formatThaiTime(date: Date): string {
  return new Intl.DateTimeFormat('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok'
  }).format(date)
}