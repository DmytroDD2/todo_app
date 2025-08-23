"use client"

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from './input'
import { Button } from './button'
import { Label } from './label'
import { cn } from '@/lib/utils'

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function PasswordInput({ 
  label, 
  error, 
  className, 
  ...props 
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={props.id}>
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          {...props}
          type={showPassword ? "text" : "password"}
          className={cn(
            "pr-12 sm:pr-10",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px]"
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
          ) : (
            <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
