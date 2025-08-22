import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { taskApi } from '@/lib/api'
import { TaskFilters } from '@/types/task'
import { queryKeys } from '../query-keys'

export function useTasks(
  filters: TaskFilters = {}, 
  page = 0, 
  limit = 100,
  options?: Omit<UseQueryOptions<any, any, any, any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.tasks.list(filters, page, limit),
    queryFn: () => taskApi.getTasks(filters, page, limit),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}
