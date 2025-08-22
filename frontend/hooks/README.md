# Hooks

This directory contains all the custom React hooks for the TODO application, organized by functionality.

## Structure

```
hooks/
├── index.ts              # Main export file - exports all hooks
├── query-keys.ts         # React Query key definitions
├── task/                 # Task-related hooks
│   ├── index.ts         # Task hooks index
│   ├── use-tasks.ts     # Fetch tasks with filtering
│   ├── use-task.ts      # Fetch single task
│   ├── use-create-task.ts
│   ├── use-update-task.ts
│   ├── use-delete-task.ts
│   ├── use-toggle-task.ts
│   └── use-reorder-tasks.ts
├── category/            # Category-related hooks
│   ├── index.ts         # Category hooks index
│   ├── use-categories.ts
│   ├── use-category.ts
│   ├── use-create-category.ts
│   ├── use-update-category.ts
│   └── use-delete-category.ts
└── README.md           # This file
```

## Available Hooks

### Task Hooks (`task/`)

- `useTasks(filters, page, limit, options)` - Fetch tasks with filtering and pagination
- `useTask(id, options)` - Fetch a single task by ID
- `useCreateTask()` - Create a new task
- `useUpdateTask()` - Update an existing task
- `useDeleteTask()` - Delete a task
- `useToggleTask()` - Toggle task completion status
- `useReorderTasks()` - Reorder tasks (drag and drop)

### Category Hooks (`category/`)

- `useCategories(options)` - Fetch all categories
- `useCategory(id, options)` - Fetch a single category by ID
- `useCreateCategory()` - Create a new category
- `useUpdateCategory()` - Update an existing category
- `useDeleteCategory()` - Delete a category

### Query Keys (`query-keys.ts`)

- `queryKeys.tasks` - Task-related query keys
- `queryKeys.categories` - Category-related query keys

## Usage

```typescript
// Import specific hooks
import { useTasks, useCreateTask } from '@/hooks'

// Or import from specific directories
import { useTasks } from '@/hooks/task'
import { useCategories } from '@/hooks/category'

// Use in components
function MyComponent() {
  const { data: tasks, isLoading } = useTasks()
  const createTaskMutation = useCreateTask()
  
  // ... rest of component
}
```

## Migration from Old Structure

The hooks have been migrated from the old structure to the new directory-based organization:

### Before:
```
hooks/
├── task-hooks.ts         # All task hooks in one file
├── category-hooks.ts     # All category hooks in one file
└── query-keys.ts
```

### After:
```
hooks/
├── task/                 # Task hooks directory
│   ├── use-tasks.ts     # Individual hook files
│   ├── use-create-task.ts
│   └── ...
├── category/            # Category hooks directory
│   ├── use-categories.ts
│   ├── use-create-category.ts
│   └── ...
└── query-keys.ts
```

### Updated Components:
- ✅ `task-form.tsx` - Now uses `useCategories` hook
- ✅ `task-search.tsx` - Now uses `useCategories` hook  
- ✅ `category-manager.tsx` - Now uses category hooks for all operations
- ✅ All existing imports continue to work with `@/hooks`

## Features

- **Automatic Cache Management**: All hooks use React Query for efficient caching
- **Optimistic Updates**: Mutations update the UI immediately for better UX
- **Error Handling**: Built-in error handling and retry logic
- **TypeScript Support**: Full TypeScript support with proper types
- **Authentication Aware**: Hooks respect authentication state
