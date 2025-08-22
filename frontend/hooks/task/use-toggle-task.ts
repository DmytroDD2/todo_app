import { useMutation, useQueryClient } from '@tanstack/react-query'
import { taskApi } from '@/lib/api'
import { Task } from '@/types/task'
import { queryKeys } from '../query-keys'

export function useToggleTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: taskApi.toggleTask,
    onSuccess: (updatedTask) => {
      // Update the specific task in cache
      queryClient.setQueryData(
        queryKeys.tasks.detail(updatedTask.id),
        updatedTask
      )
      
      // Update task in all lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.tasks.lists() },
        (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            tasks: oldData.tasks.map((task: Task) => 
              task.id === updatedTask.id ? updatedTask : task
            ),
          }
        }
      )
    },
  })
}
