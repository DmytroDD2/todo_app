'use client'

import TaskStatisticsDashboard from '@/components/features/task-statistics-dashboard'
import { useState } from 'react'
import { TaskFilters } from '@/types/task'

export default function StatisticsPage() {
  const [filters, setFilters] = useState<TaskFilters>({
    sort_by: 'order_index',
    sort_order: 'asc'
  })

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Task Statistics</h1>
            <p className="text-gray-600">View detailed analytics and insights about your tasks</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main statistics content */}
        <div className="flex-1">
          <TaskStatisticsDashboard
            filters={filters}
            className="mb-6"
          />
        </div>
      </div>
    </div>
  )
}
