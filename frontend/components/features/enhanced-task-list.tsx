'use client'

import React, { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { Task } from '@/types/task'
import { TaskFilters } from '@/types/task'
import { useTasks, useToggleTask, useDeleteTask } from '@/hooks'
import { useDragAndDropState, useKeyboardDragAndDrop } from '@/lib/dnd-state'
import { useToast } from '@/lib/use-toast'
import { useAuth } from '@/components/providers/auth-provider'
import SortableTaskCard from './sortable-task-card'
import TaskCard from '@/components/task/task-card'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EnhancedTaskListProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  onEdit?: (task: Task) => void
  className?: string
}

export default function EnhancedTaskList({ filters, onFiltersChange, onEdit, className }: EnhancedTaskListProps) {
  const [page, setPage] = useState(0)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const limit = 50
  const { isAuthenticated } = useAuth()

  // React Query hooks
  const {
    data: tasksData,
    isLoading,
    isError,
    error,
    refetch,
  } = useTasks(filters, page, limit, {
    enabled: isAuthenticated, // Only fetch when authenticated
  })

  const toggleTaskMutation = useToggleTask()
  const deleteTaskMutation = useDeleteTask()

  // Drag and drop state management
  const {
    dragState,
    startDrag,
    updateDropIndex,
    endDrag,
    handleDragEnd,
    getDisplayTasks,
    clearOptimisticState,
    isReordering,
  } = useDragAndDropState()

  // Keyboard drag and drop
  const {
    focusedIndex,
    isKeyboardDragging,
    handleKeyDown,
    setFocusedIndex,
  } = useKeyboardDragAndDrop()

  // Toast notifications
  const { toast } = useToast()

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const tasks = tasksData?.tasks || []
  const displayTasks = getDisplayTasks(tasks)
  
  // Filter out the dragged task from the display list
  const visibleTasks = displayTasks.filter(task => 
    !dragState.isDragging || dragState.draggedItem?.id !== task.id
  )

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const draggedTask = tasks.find((task: Task) => task.id === parseInt(active.id as string))
    const draggedIndex = tasks.findIndex((task: Task) => task.id === parseInt(active.id as string))
    
    if (draggedTask && draggedIndex !== -1) {
      startDrag(draggedTask, draggedIndex)
      setDraggedTask(draggedTask)
    }
  }, [tasks, startDrag])

  // Handle drag over
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over, active } = event
    if (over && active) {
      const overId = parseInt(over.id as string)
      const activeId = parseInt(active.id as string)
      
      // Only process if we're hovering over a different element
      if (overId !== activeId) {
        const overIndex = visibleTasks.findIndex((task: Task) => task.id === overId)
        if (overIndex !== -1) {
          // Check if we're hovering in the lower half of the element (space between)
          const overElement = document.getElementById(over.id as string)
          if (overElement) {
            const rect = overElement.getBoundingClientRect()
            const mouseY = (event.activatorEvent as MouseEvent)?.clientY || 0
            
            // If mouse is in the lower half of the element, drop after it
            if (mouseY > rect.top + rect.height / 2) {
              updateDropIndex(overIndex + 1)
            } else {
              updateDropIndex(overIndex)
            }
          } else {
            updateDropIndex(overIndex)
          }
        }
      }
    }
  }, [visibleTasks, updateDropIndex])

  // Handle drag end
  const handleDragEndEvent = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) {
      endDrag()
      setDraggedTask(null)
      return
    }

    const draggedIndex = tasks.findIndex((task: Task) => task.id === parseInt(active.id as string))
    const dropIndex = tasks.findIndex((task: Task) => task.id === parseInt(over.id as string))

    if (draggedIndex !== -1 && dropIndex !== -1) {
      handleDragEnd(tasks, draggedIndex, dropIndex)
    }
    
    setDraggedTask(null)
  }, [tasks, handleDragEnd, endDrag])

  // Handle task toggle
  const handleToggleTask = useCallback(async (taskId: number) => {
    try {
      await toggleTaskMutation.mutateAsync(taskId)
      toast({
        title: "Task updated",
        description: "Task status has been updated successfully.",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      })
      console.error('Failed to toggle task:', error)
    }
  }, [toggleTaskMutation, toast])

  // Handle task edit
  const handleEditTask = useCallback((task: Task) => {
    if (onEdit) {
      onEdit(task)
    }
  }, [onEdit])

  // Handle task delete
  const handleDeleteTask = useCallback(async (taskId: number) => {
    try {
      await deleteTaskMutation.mutateAsync(taskId)
      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully.",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
      console.error('Failed to delete task:', error)
    }
  }, [deleteTaskMutation, toast])

  // Handle keyboard reorder
  const handleKeyboardReorder = useCallback((draggedIndex: number, dropIndex: number) => {
    handleDragEnd(tasks, draggedIndex, dropIndex)
  }, [tasks, handleDragEnd])

  // Handle retry
  const handleRetry = useCallback(() => {
    refetch()
    clearOptimisticState()
  }, [refetch, clearOptimisticState])

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center max-w-md">
          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sign in to view tasks
          </h3>
          <p className="text-gray-600 mb-4">
            Please sign in to your account to view and manage your tasks.
          </p>
          <Button asChild>
            <a href="/login">Sign In</a>
          </Button>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading && tasks.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load tasks
          </h3>
          <p className="text-gray-600 mb-4">
            {error?.message || 'An unexpected error occurred while loading tasks.'}
          </p>
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Empty state
  if (tasks.length === 0 && !isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center max-w-md">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tasks found
          </h3>
          <p className="text-gray-600">
            {Object.keys(filters).length > 0 
              ? 'Try adjusting your filters to see more tasks.'
              : 'Create your first task to get started!'
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>


      {/* Task list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEndEvent}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={displayTasks.map(task => task.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {visibleTasks.map((task, index) => (
              <div key={task.id} className="relative">
                <SortableTaskCard
                  task={task}
                  index={index}
                  isDraggingProp={false}
                  isDropTarget={dragState.dropIndex === index}
                  isFocused={focusedIndex === index}
                  isKeyboardDragging={isKeyboardDragging}
                  onToggle={handleToggleTask}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onKeyDown={(event) => handleKeyDown(event, visibleTasks, index, handleKeyboardReorder)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                  disabled={toggleTaskMutation.isPending || deleteTaskMutation.isPending}
                />
                
                {/* Gap indicator below each element */}
                {dragState.isDragging && dragState.dropIndex === index + 1 && (
                  <div className="h-24 mt-2 transition-all duration-300 ease-in-out" />
                )}
              </div>
            ))}
            
            {/* Drop zone indicator for dropping at the end of the list */}
            {dragState.isDragging && dragState.dropIndex === visibleTasks.length && (
              <div className="h-24 transition-all duration-300 ease-in-out" />
            )}
          </div>
        </SortableContext>
        
        <DragOverlay>
          {draggedTask ? (
            <div className="shadow-2xl transition-all duration-300 ease-in-out">
              <TaskCard
                task={draggedTask}
                onToggle={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
                showDragHandle={false}
                className="opacity-90"
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Pagination */}
      {tasksData && tasksData.total > limit && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {page * limit + 1} to {Math.min((page + 1) * limit, tasksData.total)} of {tasksData.total} tasks
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.max(0, prev - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => prev + 1)}
              disabled={(page + 1) * limit >= tasksData.total}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
