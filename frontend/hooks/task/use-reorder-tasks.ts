import { useMutation, useQueryClient } from '@tanstack/react-query'
import { taskApi } from '@/lib/api'
import { queryKeys } from '../query-keys'

export function useReorderTasks() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: taskApi.reorderTasks,
    onSuccess: (reorderedTasks) => {
      // Update all task lists with the new order
      queryClient.setQueriesData(
        { queryKey: queryKeys.tasks.lists() },
        (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            tasks: reorderedTasks,
          }
        }
      )
    },
  })
}
