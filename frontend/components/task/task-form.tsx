'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Checkbox } from '@/components/ui/checkbox'
import { useCategories } from '@/hooks/category'
import { Task, TaskCreate, TaskUpdate, Category } from '@/types/task'
import { format } from 'date-fns'

interface TaskFormProps {
  task?: Task
  editingTask?: Task | null
  onSubmit: (task: TaskCreate | TaskUpdate) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

// Local form state interface that allows Date objects for due_date
interface TaskFormData {
  title: string
  description: string
  category_id?: number
  due_date?: Date
  priority: number
  is_completed: boolean
}

export default function TaskForm({ task, editingTask, onSubmit, onCancel, isLoading = false }: TaskFormProps) {
  const { data: categories = [] } = useCategories()
  const [formData, setFormData] = useState<TaskFormData>({
    title: task?.title || '',
    description: task?.description || '',
    category_id: task?.category_id || undefined,
    due_date: task?.due_date ? new Date(task.due_date) : undefined,
    priority: task?.priority || 5,
    is_completed: task?.completed || false,
  })

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        category_id: task.category_id,
        due_date: task.due_date ? new Date(task.due_date) : undefined,
        priority: task.priority,
        is_completed: task.completed,
      })
    }
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title?.trim()) {
      return
    }

    const taskData = {
      title: formData.title.trim(),
      description: formData.description?.trim() || '',
      priority: formData.priority,
      due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : undefined,
      category_id: formData.category_id,
      ...(editingTask && { completed: formData.is_completed }),
    } as TaskCreate | TaskUpdate

    await onSubmit(taskData)
  }

  const handleChange = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter task title"
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Tip: Use unique titles to avoid conflicts. Add numbers or descriptions to make similar tasks distinct.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter task description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category_id?.toString() || 'none'}
            onValueChange={(value) => handleChange('category_id', value === 'none' ? undefined : parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Category</SelectItem>
              {(categories || []).map((category: Category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority?.toString() || '5'}
            onValueChange={(value) => handleChange('priority', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">High (1)</SelectItem>
              <SelectItem value="5">Medium (5)</SelectItem>
              <SelectItem value="10">Low (10)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="due_date">Due Date</Label>
        <DatePicker
          value={formData.due_date}
          onValueChange={(date) => handleChange('due_date', date)}
          placeholder="Select due date"
        />
      </div>

      <div className="flex items-center space-x-4 sm:space-x-3">
        <Checkbox
          id="is_completed"
          checked={formData.is_completed || false}
          onCheckedChange={(checked) => handleChange('is_completed', checked)}
          className="flex-shrink-0 touch-manipulation"
        />
        <Label htmlFor="is_completed" className="text-base sm:text-sm">Mark as completed</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading || !formData.title?.trim()}>
          {isLoading ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
