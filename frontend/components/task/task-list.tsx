"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { Task } from "@/types/task"
import TaskCard from "@/components/task/task-card"
import SortableTaskCard from "@/components/features/sortable-task-card"
import { taskApi } from "../../lib/api"

interface TaskListProps {
  tasks: Task[]
  onTaskToggle: (id: number) => void
  onTaskEdit: (task: Task) => void
  onTaskDelete: (id: number) => void
  onTasksReorder?: (tasks: Task[]) => void
  className?: string
  enableDragAndDrop?: boolean
}

export default function TaskList({
  tasks,
  onTaskToggle,
  onTaskEdit,
  onTaskDelete,
  onTasksReorder,
  className,
  enableDragAndDrop = false,
}: TaskListProps) {
  const [isReordering, setIsReordering] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id)
      const newIndex = tasks.findIndex((task) => task.id === over?.id)

      const newTasks = arrayMove(tasks, oldIndex, newIndex)
      
      // Update local state immediately for optimistic UI
      onTasksReorder?.(newTasks)
      
      // Send reorder request to backend
      try {
        setIsReordering(true)
        const taskIds = newTasks.map((task) => task.id)
        await taskApi.reorderTasks(taskIds)
      } catch (error) {
        console.error("Failed to reorder tasks:", error)
        // Revert to original order on error
        onTasksReorder?.(tasks)
      } finally {
        setIsReordering(false)
      }
    }
  }

  if (enableDragAndDrop) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          <div className={`space-y-3 ${className || ""}`}>
            {tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onToggle={onTaskToggle}
                onEdit={onTaskEdit}
                onDelete={onTaskDelete}
                disabled={isReordering}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    )
  }

  return (
    <div className={`space-y-3 ${className || ""}`}>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={onTaskToggle}
          onEdit={onTaskEdit}
          onDelete={onTaskDelete}
        />
      ))}
    </div>
  )
}
