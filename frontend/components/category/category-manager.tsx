"use client"

import { useState, useEffect } from "react"
import { Category, CategoryCreate, CategoryUpdate } from "@/types/task"
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CategoryBadge } from "@/components/ui/category-badge"
import { Edit, Trash2, Plus, X } from "lucide-react"
import { cn } from "../../lib/utils"

interface CategoryManagerProps {
  className?: string
}

interface CategoryFormData {
  name: string
  description: string
  color: string
  icon: string
}

const DEFAULT_COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#8B5CF6", // Purple
  "#F97316", // Orange
  "#EC4899", // Pink
  "#6B7280", // Gray
]

export default function CategoryManager({ className }: CategoryManagerProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    color: DEFAULT_COLORS[0],
    icon: "",
  })
  const { isAuthenticated } = useAuth()

  // Use the categories hooks
  const { data: categories = [], isLoading } = useCategories({
    enabled: isAuthenticated
  })
  const createCategoryMutation = useCreateCategory()
  const updateCategoryMutation = useUpdateCategory()
  const deleteCategoryMutation = useDeleteCategory()
  
  // Combined loading state
  const isMutating = createCategoryMutation.isPending || updateCategoryMutation.isPending || deleteCategoryMutation.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) return

    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          category: {
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
            color: formData.color,
            icon: formData.icon.trim() || undefined,
          }
        })
      } else {
        await createCategoryMutation.mutateAsync({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color,
          icon: formData.icon.trim() || undefined,
        })
      }
      
      resetForm()
    } catch (error) {
      console.error("Failed to save category:", error)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color,
      icon: category.icon || "",
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category? Tasks in this category will be unassigned.")) {
      return
    }

    try {
      await deleteCategoryMutation.mutateAsync(id)
    } catch (error) {
      console.error("Failed to delete category:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      color: DEFAULT_COLORS[0],
      icon: "",
    })
    setEditingCategory(null)
    setShowForm(false)
  }

  const handleCancel = () => {
    resetForm()
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-center max-w-md">
          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sign in to manage categories
          </h3>
          <p className="text-gray-600 mb-4">
            Please sign in to your account to view and manage your categories.
          </p>
          <Button asChild>
            <a href="/login">Sign In</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Categories</h2>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {/* Category Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name *
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name"
                  required
                  disabled={isMutating}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="icon" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Icon (emoji)
                </label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🎯 (optional)"
                  disabled={isMutating}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter category description (optional)"
                rows={2}
                disabled={isMutating}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
              <div className="flex gap-2 flex-wrap">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      formData.color === color
                        ? "border-gray-900 dark:border-white scale-110"
                        : "border-gray-300 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-400"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isMutating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isMutating || !formData.name.trim()}>
                {isMutating ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category: Category) => (
          <div
            key={category.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {category.icon && <span>{category.icon}</span>}
                  <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                </div>
                
                {category.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {category.description}
                  </p>
                )}
                
                <CategoryBadge category={category} />
              </div>
              
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(category)}
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isMutating}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  disabled={isMutating}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No categories yet. Create your first category to get started!
        </div>
      )}
    </div>
  )
}
