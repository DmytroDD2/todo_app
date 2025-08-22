'use client'

import { useTasks, useCategories } from '@/hooks'
import { TaskFilters, Task, Category } from '@/types/task'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar,
  TrendingUp,
  BarChart3,
  Target
} from 'lucide-react'
import { format, isToday, isTomorrow, parseISO, isAfter, startOfDay, isBefore } from 'date-fns'

interface TaskStatisticsDashboardProps {
  filters?: TaskFilters
  className?: string
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: string
  description?: string
}

interface CategoryStat {
  category: Category
  total: number
  completed: number
  completionRate: number
}

function StatCard({ title, value, icon: Icon, color, description }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

export default function TaskStatisticsDashboard({ 
  filters, 
  className = '' 
}: TaskStatisticsDashboardProps) {
  const { data: tasksData } = useTasks(filters)
  const { data: categories = [] } = useCategories()

  // Ensure tasks is always an array - API returns { tasks: Task[], total: number, ... }
  const tasks = tasksData?.tasks || []

  // Calculate statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task: Task) => task.completed).length
  const pendingTasks = tasks.filter((task: Task) => !task.completed).length
  const overdueTasks = tasks.filter((task: Task) => 
    !task.completed && task.due_date && isBefore(parseISO(task.due_date), startOfDay(new Date()))
  ).length
  const dueToday = tasks.filter((task: Task) => 
    !task.completed && task.due_date && isToday(parseISO(task.due_date))
  ).length
  const dueTomorrow = tasks.filter((task: Task) => 
    !task.completed && task.due_date && isTomorrow(parseISO(task.due_date))
  ).length

  // Calculate completion rate
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Category breakdown
  const categoryStats: CategoryStat[] = categories.map((category: Category) => {
    const categoryTasks = tasks.filter((task: Task) => task.category_id === category.id)
    const completedCategoryTasks = categoryTasks.filter((task: Task) => task.completed).length
    const categoryCompletionRate = categoryTasks.length > 0 
      ? Math.round((completedCategoryTasks / categoryTasks.length) * 100) 
      : 0

    return {
      category,
      total: categoryTasks.length,
      completed: completedCategoryTasks,
      completionRate: categoryCompletionRate
    }
  }).filter((stat: CategoryStat) => stat.total > 0)

  // Priority breakdown - priority is stored as number: 1=highest, 5=medium, 10=lowest
  const priorityStats = {
    high: tasks.filter((task: Task) => task.priority <= 3).length, // Priority 1-3 (highest to high)
    medium: tasks.filter((task: Task) => task.priority >= 4 && task.priority <= 7).length, // Priority 4-7 (medium-high to medium-low)
    low: tasks.filter((task: Task) => task.priority >= 8).length, // Priority 8-10 (low to lowest)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Task Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Tasks"
            value={totalTasks}
            icon={Target}
            color="bg-blue-500"
            description="All tasks"
          />
          <StatCard
            title="Completed"
            value={completedTasks}
            icon={CheckCircle}
            color="bg-green-500"
            description={`${completionRate}% completion rate`}
          />
          <StatCard
            title="Pending"
            value={pendingTasks}
            icon={Clock}
            color="bg-yellow-500"
            description="Tasks to do"
          />
          <StatCard
            title="Overdue"
            value={overdueTasks}
            icon={AlertCircle}
            color="bg-red-500"
            description="Past due date"
          />
        </div>
      </div>

      {/* Due Date Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Due Date Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Due Today"
            value={dueToday}
            icon={Calendar}
            color="bg-purple-500"
            description="Tasks due today"
          />
          <StatCard
            title="Due Tomorrow"
            value={dueTomorrow}
            icon={Calendar}
            color="bg-indigo-500"
            description="Tasks due tomorrow"
          />
          <StatCard
            title="No Due Date"
            value={tasks.filter((task: Task) => !task.due_date).length}
            icon={Clock}
            color="bg-gray-500"
            description="Tasks without due date"
          />
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryStats.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Category Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats.map((stat) => (
              <div key={stat.category.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: stat.category.color }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stat.category.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.total}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.completionRate}% done
                  </span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        backgroundColor: stat.category.color,
                        width: `${stat.completionRate}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Priority Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">High Priority</span>
              <div className="w-4 h-4 bg-red-500 rounded-full" />
            </div>
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">{priorityStats.high}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Urgent tasks</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Medium Priority</span>
              <div className="w-4 h-4 bg-yellow-500 rounded-full" />
            </div>
            <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{priorityStats.medium}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Important tasks</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Low Priority</span>
              <div className="w-4 h-4 bg-green-500 rounded-full" />
            </div>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{priorityStats.low}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Nice to have</p>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Progress Summary</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
          {completedTasks} of {totalTasks} tasks completed
          {overdueTasks > 0 && (
            <span className="text-red-600 dark:text-red-400 font-medium"> • {overdueTasks} overdue</span>
          )}
        </p>
      </div>
    </div>
  )
}
