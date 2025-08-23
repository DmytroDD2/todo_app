'use client'

import { useState, useCallback, useRef } from 'react'
import { Task } from '@/types/task'
import { useReorderTasks } from '@/hooks'
import { useToast } from './use-toast'

interface DragState {
  isDragging: boolean
  draggedItem: Task | null
  draggedIndex: number | null
  dropIndex: number | null
}

export function useDragAndDropState() {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    draggedIndex: null,
    dropIndex: null,
  })

  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([])
  const originalTasksRef = useRef<Task[]>([])
  const reorderMutation = useReorderTasks()
  const { toast } = useToast()

  const startDrag = useCallback((task: Task, index: number) => {
    setDragState({
      isDragging: true,
      draggedItem: task,
      draggedIndex: index,
      dropIndex: null,
    })
  }, [])

  const updateDropIndex = useCallback((index: number) => {
    setDragState(prev => ({
      ...prev,
      dropIndex: index,
    }))
  }, [])

  const endDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      draggedIndex: null,
      dropIndex: null,
    })
  }, [])

  const applyOptimisticUpdate = useCallback((tasks: Task[], draggedIndex: number, dropIndex: number) => {
    if (draggedIndex === dropIndex) return tasks

    const newTasks = [...tasks]
    const [draggedTask] = newTasks.splice(draggedIndex, 1)
    newTasks.splice(dropIndex, 0, draggedTask)

    // Update order_index for all affected tasks
    const startIndex = Math.min(draggedIndex, dropIndex)
    const endIndex = Math.max(draggedIndex, dropIndex)
    
    for (let i = startIndex; i <= endIndex; i++) {
      newTasks[i] = {
        ...newTasks[i],
        order_index: i,
      }
    }

    return newTasks
  }, [])

  const handleDragEnd = useCallback(async (tasks: Task[], draggedIndex: number, dropIndex: number) => {
    if (draggedIndex === dropIndex) {
      endDrag()
      return
    }

    // Store original tasks for rollback
    originalTasksRef.current = [...tasks]

    // Apply optimistic update
    const optimisticTasks = applyOptimisticUpdate(tasks, draggedIndex, dropIndex)
    setOptimisticTasks(optimisticTasks)

    // Get the new order of task IDs
    const taskIds = optimisticTasks.map(task => task.id)

    try {
      // Send reorder request to server
      await reorderMutation.mutateAsync(taskIds)
      
      toast({
        title: "Tasks reordered",
        description: "Your tasks have been successfully reordered.",
        variant: "success",
      })
    } catch (error) {
      // Rollback on error
      setOptimisticTasks(originalTasksRef.current)
      
      toast({
        title: "Reorder failed",
        description: "Failed to reorder tasks. Please try again.",
        variant: "destructive",
      })
      
      console.error('Failed to reorder tasks:', error)
    } finally {
      endDrag()
    }
  }, [applyOptimisticUpdate, reorderMutation, toast, endDrag])

  const getDisplayTasks = useCallback((tasks: Task[]) => {
    // If we have optimistic updates, use those
    if (optimisticTasks.length > 0) {
      return optimisticTasks
    }
    return tasks
  }, [optimisticTasks])

  const clearOptimisticState = useCallback(() => {
    setOptimisticTasks([])
    originalTasksRef.current = []
  }, [])

  return {
    dragState,
    startDrag,
    updateDropIndex,
    endDrag,
    handleDragEnd,
    getDisplayTasks,
    clearOptimisticState,
    isReordering: reorderMutation.isPending,
  }
}

// Hook for managing drag-and-drop with keyboard accessibility
export function useKeyboardDragAndDrop() {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const [isKeyboardDragging, setIsKeyboardDragging] = useState(false)

  const handleKeyDown = useCallback((
    event: React.KeyboardEvent,
    tasks: Task[],
    currentIndex: number,
    onReorder: (draggedIndex: number, dropIndex: number) => void
  ) => {
    if (!['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(event.key)) {
      return
    }

    event.preventDefault()

    switch (event.key) {
      case 'ArrowUp':
        if (currentIndex > 0) {
          setFocusedIndex(currentIndex - 1)
        }
        break
      case 'ArrowDown':
        if (currentIndex < tasks.length - 1) {
          setFocusedIndex(currentIndex + 1)
        }
        break
      case 'Enter':
        if (focusedIndex !== null && focusedIndex !== currentIndex) {
          setIsKeyboardDragging(true)
          onReorder(currentIndex, focusedIndex)
          setIsKeyboardDragging(false)
          setFocusedIndex(null)
        }
        break
      case 'Escape':
        setFocusedIndex(null)
        setIsKeyboardDragging(false)
        break
    }
  }, [focusedIndex])

  return {
    focusedIndex,
    isKeyboardDragging,
    handleKeyDown,
    setFocusedIndex,
  }
}
