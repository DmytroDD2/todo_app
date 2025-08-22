'use client'

import CategoryManager from '@/components/category/category-manager'
import TaskStatisticsDashboard from '@/components/features/task-statistics-dashboard'
import { useState } from 'react'
import { TaskFilters } from '@/types/task'
import { Button } from '@/components/ui/button'
import { BarChart3 } from 'lucide-react'

export default function CategoriesPage() {
  const [showStats, setShowStats] = useState(false)
  const [filters, setFilters] = useState<TaskFilters>({
    sort_by: 'order_index',
    sort_order: 'asc'
  })

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Category Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Create and manage categories to organize your tasks</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </Button>
        </div>
      </div>

      {/* Category Statistics */}
      {showStats && (
        <div className="mb-8">
          <TaskStatisticsDashboard
            filters={filters}
            className="mb-6"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main category management */}
        <div className="lg:col-span-2">
          <CategoryManager />
        </div>

        {/* Category insights sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Quick Tips</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Use colors to visually distinguish categories</li>
                  <li>• Create categories for different project types</li>
                  <li>• Assign priorities to help with task organization</li>
                  <li>• Use descriptive names for better organization</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Best Practices</h4>
                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <li>• Keep category names short and clear</li>
                  <li>• Use consistent naming conventions</li>
                  <li>• Regularly review and clean up unused categories</li>
                  <li>• Consider using emojis for visual appeal</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
