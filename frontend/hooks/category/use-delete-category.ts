import { useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryApi } from '@/lib/api'
import { Category } from '@/types/task'
import { queryKeys } from '../query-keys'

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: categoryApi.deleteCategory,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.categories.detail(deletedId) })
      
      // Update all category lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.categories.lists() },
        (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            categories: oldData.categories.filter((category: Category) => category.id !== deletedId),
            total: oldData.total - 1,
          }
        }
      )
    },
  })
}
