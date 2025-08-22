import { formatDueDate, getDueDateColor, getDueDateStatus } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react"

interface DueDateIndicatorProps {
  dueDate: string
  className?: string
  showIcon?: boolean
  variant?: 'badge' | 'text' | 'icon'
}

export function DueDateIndicator({ 
  dueDate, 
  className, 
  showIcon = true, 
  variant = 'badge' 
}: DueDateIndicatorProps) {
  const status = getDueDateStatus(dueDate)
  const colorClasses = getDueDateColor(dueDate)
  
  const getIcon = () => {
    switch (status) {
      case 'overdue':
        return <AlertTriangle className="w-3 h-3" />
      case 'today':
        return <Clock className="w-3 h-3" />
      case 'tomorrow':
        return <Calendar className="w-3 h-3" />
      case 'upcoming':
        return <Calendar className="w-3 h-3" />
      case 'past':
        return <CheckCircle className="w-3 h-3" />
      default:
        return <Calendar className="w-3 h-3" />
    }
  }

  if (variant === 'icon') {
    return (
      <div
        className={cn(
          "w-4 h-4 rounded-full flex items-center justify-center",
          colorClasses,
          className
        )}
        title={`Due: ${formatDueDate(dueDate)}`}
      >
        {getIcon()}
      </div>
    )
  }

  if (variant === 'text') {
    return (
      <span
        className={cn(
          "text-xs font-medium",
          colorClasses,
          className
        )}
      >
        {formatDueDate(dueDate)}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
        colorClasses,
        className
      )}
    >
      {showIcon && (
        <span className="mr-1">
          {getIcon()}
        </span>
      )}
      {formatDueDate(dueDate)}
    </span>
  )
}
