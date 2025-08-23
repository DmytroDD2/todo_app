"use client"

import { Task } from "@/types/task"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CategoryBadge, CategoryBadgeSmall } from "@/components/ui/category-badge"
import { DueDateIndicator } from "@/components/ui/due-date-indicator"
import { getPriorityColor, getPriorityLabel } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Edit, Trash2, GripVertical } from "lucide-react"

interface TaskCardProps {
  task: Task
  onToggle: (id: number) => void
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
  className?: string
  showDragHandle?: boolean
  dragAttributes?: any
  dragListeners?: any
}

export default function TaskCard({ 
  task, 
  onToggle, 
  onEdit, 
  onDelete, 
  className,
  showDragHandle = false,
  dragAttributes,
  dragListeners
}: TaskCardProps) {
  return (
    <div
      className={cn(
        "group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow",
        task.completed && "opacity-75 bg-gray-50 dark:bg-gray-700",
        className
      )}
    >
      {showDragHandle && (
        <div 
          className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-70 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          {...dragAttributes}
          {...dragListeners}
        >
          <GripVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </div>
      )}
      
      <div className="flex items-start gap-4 sm:gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
          className="mt-1 flex-shrink-0 touch-manipulation"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "font-medium text-gray-900 dark:text-white line-clamp-2",
                  task.completed && "line-through text-gray-500 dark:text-gray-400"
                )}
              >
                {task.title}
              </h3>
              
              {task.description && (
                <p
                  className={cn(
                    "text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2",
                    task.completed && "text-gray-400 dark:text-gray-500"
                  )}
                >
                  {task.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task)}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {/* Priority Badge */}
            <span
              className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                getPriorityColor(task.priority)
              )}
            >
              {getPriorityLabel(task.priority)}
            </span>
            
            {/* Category Badge */}
            {task.category && (
              <CategoryBadge category={task.category} />
            )}
            
            {/* Due Date Indicator */}
            {task.due_date && (
              <DueDateIndicator dueDate={task.due_date} variant="badge" />
            )}
          </div>
          
          {/* Created Date */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Created {new Date(task.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )
}
