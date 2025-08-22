"use client"

import { useState, useEffect, useCallback } from "react"
import type { TaskFilters } from "@/types/task"
import { Category } from "@/types/task"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { useCategories } from "@/hooks"
import { useAuth } from "@/components/providers/auth-provider"
import { Search, Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskSearchProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  onSearch?: () => void
  className?: string
}

interface SavedSearch {
  id: string
  name: string
  filters: TaskFilters
}

export default function TaskSearch({ filters, onFiltersChange, onSearch, className }: TaskSearchProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const [inputValue, setInputValue] = useState(filters.search || "")
  const { isAuthenticated } = useAuth()

  // Use the categories hook
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories({
    enabled: isAuthenticated
  })

  useEffect(() => {
    loadSavedSearches()
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  // Sync input value when filters change from outside
  useEffect(() => {
    setInputValue(filters.search || "")
  }, [filters.search])

  const loadSavedSearches = () => {
    try {
      const saved = localStorage.getItem("savedSearches")
      if (saved) {
        setSavedSearches(JSON.parse(saved))
      }
    } catch (error) {
      console.error("Failed to load saved searches:", error)
    }
  }



  const loadSearch = (search: SavedSearch) => {
    onFiltersChange(search.filters)
  }

  const deleteSavedSearch = (id: string) => {
    const updatedSearches = savedSearches.filter(search => search.id !== id)
    setSavedSearches(updatedSearches)
    localStorage.setItem("savedSearches", JSON.stringify(updatedSearches))
  }

  const updateFilter = (key: keyof TaskFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }



  const debouncedSearch = useCallback((searchValue: string) => {
    // Update the input value immediately for responsive typing
    setInputValue(searchValue)
    
    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Set a new timeout to trigger search after 500ms
    const timeout = setTimeout(() => {
      updateFilter("search", searchValue)
      if (onSearch && typeof onSearch === 'function') {
        onSearch()
      }
    }, 500)

    setSearchTimeout(timeout)
  }, [searchTimeout, updateFilter, onSearch])

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      completed: undefined,
      category_id: undefined,
      due_date_from: undefined,
      due_date_to: undefined,
      sort_by: undefined,
      sort_order: undefined,
    })
  }

  const hasActiveFilters = () => {
    return !!(
      filters.search ||
      filters.completed !== undefined ||
      filters.category_id ||
      filters.due_date_from ||
      filters.due_date_to ||
      filters.sort_by
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <Input
            placeholder="Search tasks by title, description, or category..."
            value={inputValue}
            onChange={(e) => {
              debouncedSearch(e.target.value)
            }}
            className="pl-10"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // Clear timeout and search immediately on Enter
                if (searchTimeout) {
                  clearTimeout(searchTimeout)
                }
                updateFilter("search", e.currentTarget.value)
                if (onSearch && typeof onSearch === 'function') {
                  onSearch()
                }
              }
            }}
          />
        </div>
        
        <Button 
          onClick={() => {
            // Clear any pending debounced search
            if (searchTimeout) {
              clearTimeout(searchTimeout)
            }
            // Search immediately with current input value
            updateFilter("search", inputValue)
            if (onSearch && typeof onSearch === 'function') {
              onSearch()
            }
          }} 
          className="flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Advanced
        </Button>

        {hasActiveFilters() && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>



      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Saved Searches</h4>
          <div className="flex flex-wrap gap-2">
            {savedSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm"
              >
                <button
                  onClick={() => loadSearch(search)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  {search.name}
                </button>
                <button
                  onClick={() => deleteSavedSearch(search.id)}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Search */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <Select
              value={filters.completed?.toString() || "all"}
              onValueChange={(value) => updateFilter("completed", value === "all" ? undefined : value === "true")}
            >
              <SelectTrigger>
                <SelectValue placeholder="All tasks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tasks</SelectItem>
                <SelectItem value="false">Active only</SelectItem>
                <SelectItem value="true">Completed only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <Select
              value={filters.category_id?.toString() || "all"}
              onValueChange={(value) => updateFilter("category_id", value === "all" ? undefined : parseInt(value))}
              disabled={isLoadingCategories}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {(categories || []).map((category: Category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Due Date From</label>
            <DatePicker
              value={filters.due_date_from ? new Date(filters.due_date_from) : undefined}
              onValueChange={(date) => updateFilter("due_date_from", date?.toISOString())}
              placeholder="From date"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Due Date To</label>
            <DatePicker
              value={filters.due_date_to ? new Date(filters.due_date_to) : undefined}
              onValueChange={(date) => updateFilter("due_date_to", date?.toISOString())}
              placeholder="To date"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</label>
            <Select
              value={filters.sort_by || "default"}
              onValueChange={(value) => updateFilter("sort_by", value === "default" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Default order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default order</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="due_date">Due Date</SelectItem>
                <SelectItem value="created_at">Created Date</SelectItem>
                <SelectItem value="order_index">Custom Order</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filters.sort_by && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort Order</label>
              <Select
                value={filters.sort_order || "asc"}
                onValueChange={(value) => updateFilter("sort_order", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
