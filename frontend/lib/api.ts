import axios from 'axios'
import { 
  Task, 
  TaskCreate, 
  TaskUpdate, 
  TaskListResponse, 
  TaskFilters,
  Category,
  CategoryCreate,
  CategoryUpdate,
  CategoryListResponse,
  User,
  UserCreate,
  UserLogin,
  UserUpdate,
  Token,
  AuthResponse
} from '@/types/task'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      // Don't redirect here - let components handle auth state changes
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  // Register a new user
  register: async (userData: UserCreate): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData)
    const data = response.data
    localStorage.setItem('auth_token', data.token.access_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  },

  // Login user
  login: async (credentials: UserLogin): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials)
    const data = response.data
    localStorage.setItem('auth_token', data.token.access_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  },

  // Get current user info
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Update current user
  updateCurrentUser: async (userData: UserUpdate): Promise<User> => {
    const response = await api.put('/auth/me', userData)
    const data = response.data
    localStorage.setItem('user', JSON.stringify(data))
    return data
  },

  // Refresh token
  refreshToken: async (): Promise<Token> => {
    const response = await api.post('/auth/refresh')
    const data = response.data
    localStorage.setItem('auth_token', data.access_token)
    return data
  },

  // Logout
  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token')
  },

  // Get stored user
  getStoredUser: (): User | null => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
}

export const taskApi = {
  // Get all tasks with filtering and pagination
  getTasks: async (filters: TaskFilters = {}, page = 0, limit = 100): Promise<TaskListResponse> => {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.completed !== undefined) params.append('completed', filters.completed.toString())
    if (filters.category_id) params.append('category_id', filters.category_id.toString())
    if (filters.priority !== undefined) params.append('priority', filters.priority.toString())
    if (filters.due_date_from) params.append('due_date_from', filters.due_date_from)
    if (filters.due_date_to) params.append('due_date_to', filters.due_date_to)
    if (filters.due_date_start) params.append('due_date_from', filters.due_date_start)
    if (filters.due_date_end) params.append('due_date_to', filters.due_date_end)
    if (filters.sort_by) params.append('sort_by', filters.sort_by)
    if (filters.sort_order) params.append('sort_order', filters.sort_order)
    
    params.append('skip', (page * limit).toString())
    params.append('limit', limit.toString())
    
    const response = await api.get(`/tasks/?${params.toString()}`)
    return response.data
  },

  // Get a single task by ID
  getTask: async (id: number): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`)
    return response.data
  },

  // Create a new task
  createTask: async (task: TaskCreate): Promise<Task> => {
    const response = await api.post('/tasks/', task)
    return response.data
  },

  // Update a task
  updateTask: async (id: number, task: TaskUpdate): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, task)
    return response.data
  },

  // Delete a task
  deleteTask: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`)
  },

  // Toggle task completion status
  toggleTask: async (id: number): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}/toggle`)
    return response.data
  },

  // Reorder tasks for drag-and-drop
  reorderTasks: async (taskIds: number[]): Promise<Task[]> => {
    const response = await api.patch('/tasks/reorder', { task_ids: taskIds })
    return response.data
  },
}

export const categoryApi = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<CategoryListResponse>('/categories/')
    return response.data.categories || []
  },

  // Get a single category by ID
  getCategory: async (id: number): Promise<Category> => {
    const response = await api.get(`/categories/${id}`)
    return response.data
  },

  // Create a new category
  createCategory: async (category: CategoryCreate): Promise<Category> => {
    const response = await api.post('/categories/', category)
    return response.data
  },

  // Update a category
  updateCategory: async (id: number, category: CategoryUpdate): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, category)
    return response.data
  },

  // Delete a category
  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`)
  },
}

export default api

