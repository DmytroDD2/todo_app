import { useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryApi } from '@/lib/api'
import { Category, CategoryUpdate } from '@/types/task'
import { queryKeys } from '../query-keys'

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, category }: { id: number; category: CategoryUpdate }) => 
      categoryApi.updateCategory(id, category),
    onSuccess: (updatedCategory) => {
      // Update the specific category in cache
      queryClient.setQueryData(
        queryKeys.categories.detail(updatedCategory.id),
        updatedCategory
      )
      
      // Update category in all lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.categories.lists() },
        (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            categories: oldData.categories.map((category: Category) => 
              category.id === updatedCategory.id ? updatedCategory : category
            ),
          }
        }
      )
    },
  })
}
