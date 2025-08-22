import { Category } from "@/types/task"
import { getCategoryColorClass } from "../../lib/utils"
import { cn } from "../../lib/utils"

interface CategoryBadgeProps {
  category: Category
  className?: string
  showIcon?: boolean
}

export function CategoryBadge({ category, className, showIcon = false }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
        getCategoryColorClass(category.color),
        className
      )}
      style={{ 
        backgroundColor: `${category.color}20`,
        borderColor: `${category.color}40`,
        color: category.color 
      }}
    >
      {showIcon && category.icon && (
        <span className="mr-1">{category.icon}</span>
      )}
      {category.name}
    </span>
  )
}

interface CategoryBadgeSmallProps {
  category: Category
  className?: string
}

export function CategoryBadgeSmall({ category, className }: CategoryBadgeSmallProps) {
  return (
    <div
      className={cn(
        "w-3 h-3 rounded-full border-2 border-white shadow-sm",
        className
      )}
      style={{ backgroundColor: category.color }}
      title={category.name}
    />
  )
}
