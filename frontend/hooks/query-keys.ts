import { TaskFilters } from '@/types/task'

// Query keys for cache management
export const queryKeys = {
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (filters: TaskFilters, page: number, limit: number) => 
      [...queryKeys.tasks.lists(), { filters, page, limit }] as const,
    details: () => [...queryKeys.tasks.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.tasks.details(), id] as const,
  },
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.categories.details(), id] as const,
  },
}
