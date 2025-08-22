'use client'

import DueDateCalendarView from '../../../components/features/due-date-calendar-view'
import TaskForm from '../../../components/task/task-form'
import { useCreateTask, useUpdateTask } from '../../../hooks'
import { useToast } from '../../../lib/use-toast'
import { useState } from 'react'
import type { TaskCreate, TaskUpdate } from '../../../types/task'
import { Task } from '../../../types/task'
import { Button } from '../../../components/ui/button'
import { X } from 'lucide-react'

export default function CalendarPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const { toast } = useToast()

  const handleTaskSubmit = async (taskData: TaskCreate | TaskUpdate) => {
    try {
      if (editingTask) {
        await updateTaskMutation.mutateAsync({ id: editingTask.id, task: taskData as TaskUpdate })
        toast({
          title: "Task updated",
          description: "Task has been updated successfully.",
          variant: "success",
        })
      } else {
        await createTaskMutation.mutateAsync(taskData as TaskCreate)
        toast({
          title: "Task created",
          description: "New task has been created successfully.",
          variant: "success",
        })
      }
      setShowForm(false)
      setEditingTask(null)
    } catch (error) {
      toast({
        title: editingTask ? "Update failed" : "Creation failed",
        description: `Failed to ${editingTask ? 'update' : 'create'} task. Please try again.`,
        variant: "destructive",
      })
      console.error('Task operation failed:', error)
    }
  }

  const handleTaskClick = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingTask(null)
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Calendar View</h1>
        <p className="text-gray-600 dark:text-gray-400">View your tasks organized by due dates in a calendar interface</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main calendar content */}
        <div className="flex-1">
          <DueDateCalendarView
            onTaskClick={handleTaskClick}
            className="mb-6"
          />
        </div>

        {/* Task form sidebar */}
        {showForm && (
          <div className="lg:w-96">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingTask ? "Edit Task" : "Add New Task"}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFormCancel}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <TaskForm
                task={editingTask || undefined}
                onSubmit={handleTaskSubmit}
                onCancel={handleFormCancel}
                isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
