import { useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryApi } from '@/lib/api'
import { queryKeys } from '../query-keys'

export function useCreateCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: categoryApi.createCategory,
    onSuccess: (newCategory) => {
      // Invalidate and refetch categories lists
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() })
      
      // Add the new category to all relevant category lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.categories.lists() },
        (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            categories: [...oldData.categories, newCategory],
            total: oldData.total + 1,
          }
        }
      )
    },
  })
}
