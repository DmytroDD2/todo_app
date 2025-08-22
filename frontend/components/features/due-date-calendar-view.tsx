'use client'

import { useState, useMemo } from 'react'
import { useTasks } from '@/hooks'
import { TaskFilters, Task } from '@/types/task'
import { Button } from '@/components/ui/button'
import TaskCard from '@/components/task/task-card'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  AlertCircle
} from 'lucide-react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  isTomorrow,
  parseISO,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isAfter,
  startOfDay,
  isBefore
} from 'date-fns'

interface DueDateCalendarViewProps {
  filters?: TaskFilters
  onTaskClick?: (task: any) => void
  className?: string
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isTomorrow: boolean
  tasks: any[]
  overdueTasks: any[]
  dueTodayTasks: any[]
  dueTomorrowTasks: any[]
}

export default function DueDateCalendarView({
  filters,
  onTaskClick,
  className = ''
}: DueDateCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { data: tasksData } = useTasks(filters)
  
  // Ensure tasks is always an array - API returns { tasks: Task[], total: number, ... }
  const tasks = tasksData?.tasks || []

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    return days.map(date => {
      const dayTasks = tasks.filter((task: Task) => 
        task.due_date && isSameDay(parseISO(task.due_date), date)
      )

      const overdueTasks = dayTasks.filter((task: Task) => 
        !task.completed && task.due_date && isBefore(parseISO(task.due_date), startOfDay(new Date()))
      )
      const dueTodayTasks = dayTasks.filter((task: Task) => 
        !task.completed && task.due_date && isToday(parseISO(task.due_date))
      )
      const dueTomorrowTasks = dayTasks.filter((task: Task) => 
        !task.completed && task.due_date && isTomorrow(parseISO(task.due_date))
      )

      return {
        date,
        isCurrentMonth: isSameMonth(date, currentDate),
        isToday: isToday(date),
        isTomorrow: isTomorrow(date),
        tasks: dayTasks,
        overdueTasks,
        dueTodayTasks,
        dueTomorrowTasks
      }
    })
  }, [currentDate, tasks])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    )
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getDayClassName = (day: CalendarDay) => {
    let className = 'min-h-[120px] p-2 border border-gray-200 dark:border-gray-700 relative'
    
    if (!day.isCurrentMonth) {
      className += ' bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
    } else if (day.isToday) {
      className += ' bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600'
    } else if (day.isTomorrow) {
      className += ' bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600'
    } else {
      className += ' bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
    }

    if (day.overdueTasks.length > 0) {
      className += ' border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
    }

    return className
  }

  const getTaskIndicator = (day: CalendarDay) => {
    if (day.overdueTasks.length > 0) {
      return (
        <div className="absolute top-1 right-1">
          <AlertCircle className="w-4 h-4 text-red-500" />
        </div>
      )
    }
    if (day.dueTodayTasks.length > 0) {
      return (
        <div className="absolute top-1 right-1">
          <Clock className="w-4 h-4 text-blue-500" />
        </div>
      )
    }
    if (day.dueTomorrowTasks.length > 0) {
      return (
        <div className="absolute top-1 right-1">
          <CalendarIcon className="w-4 h-4 text-green-500" />
        </div>
      )
    }
    return null
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
        >
          Today
        </Button>
      </div>

      {/* Calendar Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-700 dark:text-gray-300">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-700 dark:text-gray-300">Tomorrow</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-700 dark:text-gray-300">Overdue</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-gray-700 dark:text-gray-300">Overdue tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          <span className="text-gray-700 dark:text-gray-300">Due today</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-green-500" />
          <span className="text-gray-700 dark:text-gray-300">Due tomorrow</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => (
            <div key={index} className={getDayClassName(day)}>
              {getTaskIndicator(day)}
              
              {/* Date Number */}
              <div className="text-sm font-medium mb-2 text-gray-900 dark:text-white">
                {format(day.date, 'd')}
              </div>

              {/* Tasks for this day */}
              <div className="space-y-1">
                {day.tasks.slice(0, 3).map((task: Task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick?.(task)}
                    className={`
                      text-xs p-1 rounded cursor-pointer truncate
                      ${task.completed 
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 line-through' 
                        : day.overdueTasks.includes(task)
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'
                        : day.dueTodayTasks.includes(task)
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700'
                        : day.dueTomorrowTasks.includes(task)
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
                      }
                    `}
                  >
                    {task.title}
                  </div>
                ))}
                
                {day.tasks.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    +{day.tasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Day Details */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tasks for {format(currentDate, 'MMMM yyyy')}
        </h3>
        
        <div className="space-y-4">
          {calendarDays
            .filter(day => day.isCurrentMonth && day.tasks.length > 0)
            .map(day => (
              <div key={day.date.toISOString()} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-b-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm font-medium ${
                    day.isToday ? 'text-blue-600 dark:text-blue-400' : 
                    day.isTomorrow ? 'text-green-600 dark:text-green-400' : 
                    'text-gray-700 dark:text-gray-300'
                  }`}>
                    {format(day.date, 'EEEE, MMMM d')}
                  </span>
                  {day.overdueTasks.length > 0 && (
                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-1 rounded-full">
                      {day.overdueTasks.length} overdue
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  {day.tasks.map((task: Task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => onTaskClick?.(task)}
                      onToggle={() => {}} // Placeholder - not used in calendar view
                      onDelete={() => {}} // Placeholder - not used in calendar view
                      className="text-sm"
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
