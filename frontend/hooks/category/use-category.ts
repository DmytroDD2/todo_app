import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { categoryApi } from '@/lib/api'
import { queryKeys } from '../query-keys'

export function useCategory(id: number, options?: Omit<UseQueryOptions<any, any, any, any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => categoryApi.getCategory(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  })
}
