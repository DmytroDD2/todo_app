'use client'

import { Task } from '@/types/task'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2, Calendar } from 'lucide-react'
import { formatDueDate, getPriorityColor, getPriorityLabel } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface TaskItemProps {
  task: Task
  onToggle: () => void
  onDelete: () => void
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <div className={cn(
      "flex items-start gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow",
      task.completed && "bg-gray-50 dark:bg-gray-700 opacity-75"
    )}>
      <Checkbox
        checked={task.completed}
        onCheckedChange={onToggle}
        className="mt-1"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "text-sm font-medium text-gray-900 dark:text-white mb-1",
              task.completed && "line-through text-gray-500 dark:text-gray-400"
            )}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className={cn(
                "text-sm text-gray-600 dark:text-gray-400 mb-2",
                task.completed && "line-through text-gray-400 dark:text-gray-500"
              )}>
                {task.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDueDate(task.created_at)}
              </div>
              
              <div className={cn(
                "flex items-center gap-1 font-medium",
                getPriorityColor(task.priority)
              )}>
                <span className="w-2 h-2 rounded-full bg-current"></span>
                {getPriorityLabel(task.priority)} ({task.priority})
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
