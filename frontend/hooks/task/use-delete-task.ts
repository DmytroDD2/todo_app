import { useMutation, useQueryClient } from '@tanstack/react-query'
import { taskApi } from '@/lib/api'
import { Task } from '@/types/task'
import { queryKeys } from '../query-keys'

export function useDeleteTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: taskApi.deleteTask,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.tasks.detail(deletedId) })
      
      // Update all task lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.tasks.lists() },
        (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            tasks: oldData.tasks.filter((task: Task) => task.id !== deletedId),
            total: oldData.total - 1,
          }
        }
      )
    },
  })
}
