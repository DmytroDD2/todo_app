import { useMutation, useQueryClient } from '@tanstack/react-query'
import { taskApi } from '@/lib/api'
import { queryKeys } from '../query-keys'

export function useCreateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: taskApi.createTask,
    onSuccess: (newTask) => {
      // Invalidate and refetch tasks lists
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() })
      
      // Add the new task to all relevant task lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.tasks.lists() },
        (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            tasks: [newTask, ...oldData.tasks],
            total: oldData.total + 1,
          }
        }
      )
    },
  })
}
