import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { taskApi } from '@/lib/api'
import { queryKeys } from '../query-keys'

export function useTask(id: number, options?: Omit<UseQueryOptions<any, any, any, any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => taskApi.getTask(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  })
}
