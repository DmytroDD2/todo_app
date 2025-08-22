export interface Category {
  id: number
  name: string
  description?: string
  color: string
  icon?: string
  user_id: number
  created_at: string
  updated_at?: string
}

export interface Task {
  id: number
  title: string
  description?: string
  completed: boolean
  priority: number
  due_date?: string
  order_index: number
  category_id?: number
  user_id: number
  category?: Category
  created_at: string
  updated_at?: string
}

export interface TaskCreate {
  title: string
  description?: string
  priority: number
  due_date?: string
  category_id?: number
}

export interface TaskUpdate {
  title?: string
  description?: string
  completed?: boolean
  priority?: number
  due_date?: string
  category_id?: number
  order_index?: number
}

export interface TaskListResponse {
  tasks: Task[]
  total: number
  page: number
  size: number
}

export interface TaskFilters {
  search?: string
  completed?: boolean
  category_id?: number
  priority?: number | string
  due_date_from?: string
  due_date_to?: string
  due_date_start?: string
  due_date_end?: string
  status?: string
  sort_by?: 'title' | 'priority' | 'created_at' | 'due_date' | 'order_index'
  sort_order?: 'asc' | 'desc'
}

export interface CategoryCreate {
  name: string
  description?: string
  color: string
  icon?: string
}

export interface CategoryUpdate {
  name?: string
  description?: string
  color?: string
  icon?: string
}

export interface CategoryListResponse {
  categories: Category[]
  total: number
  page: number
  size: number
}

// Authentication types
export interface User {
  id: number
  email: string
  created_at: string
  updated_at?: string
}

export interface UserCreate {
  email: string
  password: string
  confirm_password: string
}

export interface UserLogin {
  email: string
  password: string
}

export interface UserUpdate {
  email?: string
}

export interface Token {
  access_token: string
  token_type: string
  expires_in: number
}

export interface AuthResponse {
  user: User
  token: Token
}

