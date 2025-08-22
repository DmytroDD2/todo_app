"""
Task schemas for API validation.
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime


class TaskBase(BaseModel):
    """Base task schema."""
    title: str = Field(..., min_length=1, max_length=255, description="Task title")
    description: Optional[str] = Field(None, max_length=2000, description="Task description")
    priority: int = Field(default=5, ge=1, le=10, description="Priority level (1-10)")
    due_date: Optional[datetime] = Field(None, description="Due date for the task")
    category_id: Optional[int] = Field(None, description="Category ID for the task")
    
    @validator('title')
    def validate_title(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace only')
        return v.strip()


class TaskCreate(TaskBase):
    """Schema for creating a new task."""
    pass


class TaskUpdate(BaseModel):
    """Schema for updating a task."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    completed: Optional[bool] = None
    priority: Optional[int] = Field(None, ge=1, le=10)
    due_date: Optional[datetime] = None
    category_id: Optional[int] = None
    order_index: Optional[float] = None
    
    @validator('title')
    def validate_title(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Title cannot be empty or whitespace only')
        return v.strip() if v else v


class TaskReorder(BaseModel):
    """Schema for reordering tasks."""
    task_id: int = Field(..., description="ID of the task to reorder")
    new_order_index: float = Field(..., description="New order index for the task")


class BulkTaskUpdate(BaseModel):
    """Schema for bulk updating tasks."""
    task_ids: List[int] = Field(..., description="List of task IDs to update")
    updates: TaskUpdate = Field(..., description="Updates to apply to all tasks")


class TaskResponse(TaskBase):
    """Schema for task response."""
    id: int
    completed: bool
    order_index: float
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    category: Optional['CategoryResponse'] = None
    
    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    """Schema for task list response."""
    tasks: List[TaskResponse]
    total: int
    page: int
    size: int


# Import here to avoid circular imports
from .category import CategoryResponse
TaskResponse.model_rebuild()

