import { format } from 'date-fns'
import { faIR } from 'date-fns/locale'

// Persian/Jalali date formatting utility
export function formatPersianDate(date: Date): string {
  // For now using Gregorian with Persian locale
  // In production, you'd use a proper Jalali converter
  return format(date, 'yyyy/MM/dd', { locale: faIR })
}

// Convert Persian numbers to English for calculations
export function persianToEnglishNumbers(str: string): string {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  
  let result = str
  for (let i = 0; i < persianNumbers.length; i++) {
    result = result.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i])
  }
  return result
}

// Convert English numbers to Persian for display
export function englishToPersianNumbers(str: string | number | null | undefined): string {
  if (str === null || str === undefined) {
    return '۰'
  }
  
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  
  let result = str.toString()
  for (let i = 0; i < englishNumbers.length; i++) {
    result = result.replace(new RegExp(englishNumbers[i], 'g'), persianNumbers[i])
  }
  return result
}

// Get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}
