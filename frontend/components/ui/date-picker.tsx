"use client"

import * as React from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  onValueChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onValueChange, placeholder = "Pick a date", className }: DatePickerProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [currentMonth, setCurrentMonth] = React.useState(value ? startOfMonth(value) : new Date())
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    if (value) {
      setInputValue(format(value, "yyyy-MM-dd"))
      setCurrentMonth(startOfMonth(value))
    } else {
      setInputValue("")
      setCurrentMonth(new Date())
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    if (newValue) {
      const date = new Date(newValue)
      if (!isNaN(date.getTime())) {
        onValueChange?.(date)
        setIsOpen(false) // Close popover when date is entered manually
      }
    } else {
      onValueChange?.(undefined)
    }
  }

  const handleCalendarSelect = (date: Date) => {
    onValueChange?.(date)
    setInputValue(format(date, "yyyy-MM-dd"))
    setIsOpen(false) // Close popover when date is selected from calendar
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1))
  }

  const handleToday = () => {
    const today = new Date()
    handleCalendarSelect(today)
  }

  const handleClear = () => {
    onValueChange?.(undefined)
    setInputValue("")
    setIsOpen(false)
  }

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              {format(currentMonth, "MMMM yyyy")}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-xs text-center text-muted-foreground py-1">
                {day}
              </div>
            ))}
            {days.map((day) => {
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isSelected = value && isSameDay(day, value)
              const isToday = isSameDay(day, new Date())
              
              return (
                <Button
                  key={day.toISOString()}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 text-xs",
                    !isCurrentMonth && "text-muted-foreground/50",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                    isToday && !isSelected && "bg-muted hover:bg-muted/80"
                  )}
                  onClick={() => handleCalendarSelect(day)}
                >
                  {format(day, "d")}
                </Button>
              )
            })}
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="flex-1 text-xs"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="flex-1 text-xs"
            >
              Clear
            </Button>
          </div>

          {/* Manual input */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Or enter date manually:</div>
            <Input
              type="date"
              value={inputValue}
              onChange={handleInputChange}
              className="text-xs"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
