'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import type { TaskFilters, TaskCreate, TaskUpdate } from '@/types/task'
import { Task } from '@/types/task'
import EnhancedTaskList from '@/components/features/enhanced-task-list'
import TaskForm from '@/components/task/task-form'
import TaskSearch from '@/components/features/task-search'
import TaskStatisticsDashboard from '@/components/features/task-statistics-dashboard'
import { useToast } from '@/lib/use-toast'
import { useCreateTask } from '@/hooks/task/use-create-task'
import { useUpdateTask } from '@/hooks/task/use-update-task'
import { Button } from '@/components/ui/button'
import { Plus, X, BarChart3 } from 'lucide-react'

export default function HomePage() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<TaskFilters>({
    sort_by: 'order_index',
    sort_order: 'asc'
  })
  const [showForm, setShowForm] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  
  const { toast } = useToast()
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()

  // Handle URL actions
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'add') {
      setShowForm(true)
    } else if (action === 'search') {
      // Focus search input (handled by TaskSearch component)
    }
  }, [searchParams])

  const handleTaskSubmit = async (taskData: TaskCreate | TaskUpdate) => {
    try {
      if (editingTask) {
        // Update existing task
        await updateTaskMutation.mutateAsync({ id: editingTask.id, task: taskData as TaskUpdate })
        toast({
          title: "Task updated",
          description: "Task has been updated successfully.",
          variant: "success",
        })
      } else {
        // Create new task
        await createTaskMutation.mutateAsync(taskData as TaskCreate)
        toast({
          title: "Task created",
          description: "New task has been created successfully.",
          variant: "success",
        })
      }
      setShowForm(false)
      setEditingTask(null)
    } catch (error: any) {
      console.error('Task operation failed:', error)
      
      // Handle specific error cases
      if (error?.response?.status === 409) {
        // Duplicate task title error
        toast({
          title: "Duplicate Task Title",
          description: "A task with this title already exists. Please use a different title or add a number/description to make it unique.",
          variant: "destructive",
        })
      } else if (error?.response?.status === 400) {
        // Bad request error (e.g., invalid priority)
        toast({
          title: "Invalid Task Data",
          description: error?.response?.data?.detail || "Please check your task data and try again.",
          variant: "destructive",
        })
      } else {
        // Generic error
        toast({
          title: editingTask ? "Update failed" : "Creation failed",
          description: `Failed to ${editingTask ? 'update' : 'create'} task. Please try again.`,
          variant: "destructive",
        })
      }
    }
  }

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingTask(null)
  }

  // Authentication and loading states are handled by ProtectedRoute in layout

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Task Management</h1>
        <p className="text-gray-600">Manage your tasks with categories, due dates, and drag-and-drop reordering</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setShowStats(!showStats)}
          className="flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          {showStats ? 'Hide Stats' : 'Show Stats'}
        </Button>
      </div>

      {/* Statistics Dashboard */}
      {showStats && (
        <div className="mb-8">
          <TaskStatisticsDashboard
            filters={filters}
            className="mb-6"
          />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Tasks
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Drag and drop to reorder
              </span>
            </div>
          </div>

          <TaskSearch
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={() => {}} // Enhanced task list handles search internally
            className="mb-6"
          />

          <EnhancedTaskList
            filters={filters}
            onFiltersChange={setFilters}
            onEdit={handleTaskEdit}
            className="mb-6"
          />
        </div>

        {/* Sidebar */}
        <div className="lg:w-80 space-y-6">
          {/* Task form sidebar */}
          {showForm && (
            <div className="lg:block">
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
                  editingTask={editingTask}
                  onSubmit={handleTaskSubmit}
                  onCancel={handleFormCancel}
                  isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingTask ? "Edit Task" : "Add New Task"}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFormCancel}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(100vh-100px)]">
              <TaskForm
                task={editingTask || undefined}
                editingTask={editingTask}
                onSubmit={handleTaskSubmit}
                onCancel={handleFormCancel}
                isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
