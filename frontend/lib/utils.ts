import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isToday, isTomorrow, isYesterday, parseISO, isAfter, startOfDay } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utility functions
export function formatDueDate(dateString: string): string {
  const date = parseISO(dateString)
  
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  if (isYesterday(date)) return 'Yesterday'
  
  return format(date, 'MMM dd, yyyy')
}

export function getDueDateStatus(dateString: string): 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'past' {
  const date = parseISO(dateString)
  const today = startOfDay(new Date())
  const dueDate = startOfDay(date)
  
  if (isToday(date)) return 'today'
  if (isTomorrow(date)) return 'tomorrow'
  
  if (dueDate < today) return 'overdue'
  if (dueDate > today) return 'upcoming'
  return 'past'
}

export function getDueDateColor(dateString: string): string {
  const status = getDueDateStatus(dateString)
  
  switch (status) {
    case 'overdue':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
    case 'today':
      return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700'
    case 'tomorrow':
      return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
    case 'upcoming':
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
    case 'past':
      return 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
    default:
      return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
  }
}

// Category utility functions
export function getCategoryColorClass(color: string): string {
  // Convert hex to tailwind-like color classes
  const colorMap: Record<string, string> = {
    '#3B82F6': 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700',
    '#EF4444': 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700',
    '#10B981': 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700',
    '#F59E0B': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700',
    '#8B5CF6': 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700',
    '#F97316': 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700',
    '#EC4899': 'bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-700',
    '#6B7280': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600',
  }
  
  return colorMap[color] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600'
}

export function getPriorityColor(priority: number): string {
  if (priority <= 3) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
  if (priority <= 6) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
  return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
}

export function getPriorityLabel(priority: number): string {
  if (priority <= 3) return 'High'
  if (priority <= 6) return 'Medium'
  return 'Low'
}

