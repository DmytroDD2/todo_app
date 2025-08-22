"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "../../lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useAuth } from "@/components/providers/auth-provider"
import { 
  Home, 
  Tag, 
  BarChart3, 
  Calendar,
  Plus,
  LogOut,
  User
} from "lucide-react"

export default function Navigation() {
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuth()

  const navigation = [
    {
      name: "Tasks",
      href: "/",
      icon: Home,
    },
    {
      name: "Categories",
      href: "/categories",
      icon: Tag,
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: Calendar,
    },
    {
      name: "Statistics",
      href: "/statistics",
      icon: BarChart3,
    },
  ]

  const quickActions = [
    {
      name: "Add Task",
      href: "/?action=add",
      icon: Plus,
      variant: "default" as const,
    },
  ]

  return (
    <nav className="bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
              TODO App
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated && navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Quick Actions and Controls */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                {quickActions.map((action) => (
                  <Link key={action.name} href={action.href}>
                    <Button
                      variant={action.variant}
                      size="sm"
                      className="hidden sm:flex items-center gap-2"
                    >
                      <action.icon className="w-4 h-4" />
                      <span className="hidden lg:inline">{action.name}</span>
                    </Button>
                  </Link>
                ))}
                

                
                {/* User Menu */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    {user?.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">Logout</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="grid grid-cols-5 gap-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
