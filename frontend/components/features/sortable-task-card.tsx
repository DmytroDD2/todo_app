"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Task } from "@/types/task"
import TaskCard from "@/components/task/task-card"
import { cn } from "@/lib/utils"

interface SortableTaskCardProps {
  task: Task
  onToggle: (id: number) => void
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
  disabled?: boolean
  index?: number
  isDraggingProp?: boolean
  isDropTarget?: boolean
  isFocused?: boolean
  isKeyboardDragging?: boolean
  onKeyDown?: (event: React.KeyboardEvent) => void
  onFocus?: () => void
  onBlur?: () => void
}

export default function SortableTaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  disabled = false,
  index,
  isDraggingProp = false,
  isDropTarget = false,
  isFocused = false,
  isKeyboardDragging = false,
  onKeyDown,
  onFocus,
  onBlur,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    disabled: disabled 
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
             className={cn(
         "transition-all duration-300 ease-in-out",
         isDraggingProp && "shadow-2xl",
         disabled && "pointer-events-none opacity-50"
       )}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      tabIndex={isKeyboardDragging ? 0 : undefined}
    >
      <TaskCard
        task={task}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        showDragHandle={!disabled}
                  className={cn(
            disabled ? "pointer-events-none" : ""
          )}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  )
}
