"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/types/task'
import { authApi } from '../../lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, confirmPassword: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...')
        const storedUser = authApi.getStoredUser()
        const isAuth = authApi.isAuthenticated()
        console.log('Stored user:', storedUser, 'Is authenticated:', isAuth)
        
        if (storedUser && isAuth) {
          // Verify token is still valid
          console.log('Verifying token...')
          const currentUser = await authApi.getCurrentUser()
          console.log('Token valid, setting user:', currentUser)
          setUser(currentUser)
        } else {
          console.log('No stored user or not authenticated')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // Token is invalid, clear storage
        authApi.logout()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'user') {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
    }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password })
      console.log('Login successful, setting user:', response.user)
      setUser(response.user)
      // Force a re-render by updating the state
      setIsLoading(false)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const register = async (email: string, password: string, confirmPassword: string) => {
    try {
      const response = await authApi.register({ email, password, confirm_password: confirmPassword })
      console.log('Registration successful, setting user:', response.user)
      setUser(response.user)
      // Force a re-render by updating the state
      setIsLoading(false)
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
    // Force a re-render by updating the state
    setIsLoading(false)
  }

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
