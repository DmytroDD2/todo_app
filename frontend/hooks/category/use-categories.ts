import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { categoryApi } from '@/lib/api'
import { queryKeys } from '../query-keys'

export function useCategories(options?: Omit<UseQueryOptions<any, any, any, any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.categories.lists(),
    queryFn: () => categoryApi.getCategories(),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  })
}
