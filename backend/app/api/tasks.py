"""
API routes for task operations.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.user import User
from app.crud.task import (
    get_tasks_with_filters,
    create_task as crud_create_task,
    get_task_by_id,
    update_task as crud_update_task,
    delete_task as crud_delete_task,
    toggle_task_completion,
    reorder_task as crud_reorder_task,
    get_task_by_title,
    get_overdue_tasks,
    get_tasks_due_today,
    get_high_priority_tasks,
    get_completed_tasks,
    get_pending_tasks,
    search_tasks_full_text,
    search_tasks_by_multiple_criteria,
    get_task_statistics
)
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse, TaskReorder, BulkTaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/", response_model=TaskListResponse)
async def get_tasks(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of tasks to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of tasks to return"),
    search: Optional[str] = Query(None, description="Search term for title or description"),
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    priority: Optional[int] = Query(None, description="Filter by priority (1=high, 4=medium, 8=low, or exact value)"),
    due_date_from: Optional[str] = Query(None, description="Filter by due date from (YYYY-MM-DD)"),
    due_date_to: Optional[str] = Query(None, description="Filter by due date to (YYYY-MM-DD)"),
    sort_by: str = Query("order_index", description="Sort field (title, priority, due_date, created_at, order_index)"),
    sort_order: str = Query("asc", description="Sort order (asc, desc)")
):
    """Get list of tasks with filtering, searching, and sorting."""
    tasks, total = get_tasks_with_filters(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        search=search,
        completed=completed,
        category_id=category_id,
        priority=priority,
        due_date_from=due_date_from,
        due_date_to=due_date_to,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    return TaskListResponse(
        tasks=tasks,
        total=total,
        page=skip // limit + 1,
        size=limit
    )


@router.get("/overdue", response_model=List[TaskResponse])
async def get_overdue_tasks_endpoint(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all overdue tasks (due date passed and not completed)."""
    return get_overdue_tasks(db=db, user_id=current_user.id)


@router.get("/due-today", response_model=List[TaskResponse])
async def get_tasks_due_today_endpoint(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all tasks due today (not completed)."""
    return get_tasks_due_today(db=db, user_id=current_user.id)


@router.get("/high-priority", response_model=List[TaskResponse])
async def get_high_priority_tasks_endpoint(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    threshold: int = Query(7, ge=1, le=10, description="Priority threshold (1-10)")
):
    """Get high priority tasks (priority >= threshold)."""
    return get_high_priority_tasks(db=db, user_id=current_user.id, priority_threshold=threshold)


@router.get("/completed", response_model=List[TaskResponse])
async def get_completed_tasks_endpoint(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of tasks to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of tasks to return")
):
    """Get all completed tasks."""
    return get_completed_tasks(db=db, user_id=current_user.id, skip=skip, limit=limit)


@router.get("/pending", response_model=List[TaskResponse])
async def get_pending_tasks_endpoint(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of tasks to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of tasks to return")
):
    """Get all pending (incomplete) tasks."""
    return get_pending_tasks(db=db, user_id=current_user.id, skip=skip, limit=limit)


@router.post("/", response_model=TaskResponse, status_code=201)
async def create_task(
    task: TaskCreate, 
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new task."""
    # Check for duplicate title within user's tasks
    existing_task = get_task_by_title(db, title=task.title, user_id=current_user.id)
    if existing_task:
        raise HTTPException(status_code=409, detail=f"Task with title '{task.title}' already exists")
    
    # Validate priority range
    if task.priority and (task.priority < 1 or task.priority > 10):
        raise HTTPException(status_code=400, detail="Priority must be between 1 and 10")
    
    return crud_create_task(db=db, task_data=task, user_id=current_user.id)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int, 
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific task by ID."""
    task = get_task_by_id(db=db, task_id=task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int, 
    task_update: TaskUpdate, 
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a task."""
    # Validate priority if provided
    if task_update.priority is not None and (task_update.priority < 1 or task_update.priority > 10):
        raise HTTPException(status_code=400, detail="Priority must be between 1 and 10")
    
    updated_task = crud_update_task(db=db, task_id=task_id, task_data=task_update, user_id=current_user.id)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return updated_task


@router.delete("/{task_id}", status_code=204)
async def delete_task(
    task_id: int, 
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a task."""
    success = crud_delete_task(db=db, task_id=task_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return None


@router.patch("/{task_id}/toggle", response_model=TaskResponse)
async def toggle_task(
    task_id: int, 
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Toggle task completion status."""
    task = toggle_task_completion(db=db, task_id=task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}/reorder", response_model=TaskResponse)
async def reorder_task(
    task_id: int, 
    reorder_data: TaskReorder, 
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Reorder a task by updating its order index."""
    if reorder_data.task_id != task_id:
        raise HTTPException(status_code=400, detail="Task ID in URL must match task ID in body")
    
    task = crud_reorder_task(db=db, task_id=task_id, new_order_index=reorder_data.new_order_index, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/reorder", response_model=List[TaskResponse])
async def reorder_tasks(
    reorder_data: dict, 
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Bulk reorder tasks by updating their order indices."""
    task_ids = reorder_data.get("task_ids", [])
    
    if not task_ids:
        raise HTTPException(status_code=400, detail="task_ids array is required")
    
    if not isinstance(task_ids, list):
        raise HTTPException(status_code=400, detail="task_ids must be an array")
    
    # Update order indices for all tasks
    updated_tasks = []
    for index, task_id in enumerate(task_ids):
        # Calculate new order index (spaced out for future insertions)
        new_order_index = (index + 1) * 1000.0
        
        task = crud_reorder_task(db=db, task_id=task_id, new_order_index=new_order_index, user_id=current_user.id)
        if task:
            updated_tasks.append(task)
        else:
            # If any task is not found, rollback and return error
            raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")
    
    return updated_tasks


@router.patch("/bulk-update", response_model=List[TaskResponse])
async def bulk_update_tasks(
    bulk_update: BulkTaskUpdate, 
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Bulk update tasks (completion status, category, priority)."""
    if not bulk_update.task_ids:
        raise HTTPException(status_code=400, detail="task_ids array is required")
    
    if not bulk_update.updates:
        raise HTTPException(status_code=400, detail="updates object is required")
    
    updated_tasks = []
    for task_id in bulk_update.task_ids:
        task = crud_update_task(db=db, task_id=task_id, task_data=bulk_update.updates, user_id=current_user.id)
        if task:
            updated_tasks.append(task)
        else:
            raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")
    
    return updated_tasks


@router.delete("/bulk-delete", status_code=204)
async def bulk_delete_tasks(task_ids: List[int], db: Session = Depends(get_db)):
    """Bulk delete tasks."""
    if not task_ids:
        raise HTTPException(status_code=400, detail="task_ids array is required")
    
    failed_deletions = []
    for task_id in task_ids:
        success = crud_delete_task(db=db, task_id=task_id)
        if not success:
            failed_deletions.append(task_id)
    
    if failed_deletions:
        raise HTTPException(
            status_code=404, 
            detail=f"Failed to delete tasks with IDs: {failed_deletions}"
        )
    
    return None


@router.patch("/bulk-toggle", response_model=List[TaskResponse])
async def bulk_toggle_tasks(task_ids: List[int], db: Session = Depends(get_db)):
    """Bulk toggle task completion status."""
    if not task_ids:
        raise HTTPException(status_code=400, detail="task_ids array is required")
    
    updated_tasks = []
    for task_id in task_ids:
        task = toggle_task_completion(db=db, task_id=task_id)
        if task:
            updated_tasks.append(task)
        else:
            raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")
    
    return updated_tasks


@router.get("/search/full-text", response_model=List[TaskResponse])
async def search_tasks_full_text_endpoint(
    db: Session = Depends(get_db),
    query: str = Query(..., description="Search query"),
    skip: int = Query(0, ge=0, description="Number of tasks to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of tasks to return")
):
    """Full-text search across task titles and descriptions."""
    if not query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty")
    
    return search_tasks_full_text(db=db, search_query=query, skip=skip, limit=limit)


@router.get("/search/advanced", response_model=List[TaskResponse])
async def search_tasks_advanced_endpoint(
    db: Session = Depends(get_db),
    query: Optional[str] = Query(None, description="Text search query"),
    priority_min: Optional[int] = Query(None, ge=1, le=10, description="Minimum priority"),
    priority_max: Optional[int] = Query(None, ge=1, le=10, description="Maximum priority"),
    category_ids: Optional[str] = Query(None, description="Comma-separated category IDs"),
    due_date_from: Optional[str] = Query(None, description="Due date from (YYYY-MM-DD)"),
    due_date_to: Optional[str] = Query(None, description="Due date to (YYYY-MM-DD)"),
    completed: Optional[bool] = Query(None, description="Completion status filter"),
    skip: int = Query(0, ge=0, description="Number of tasks to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of tasks to return")
):
    """Advanced search with multiple criteria simultaneously."""
    # Parse category IDs
    category_id_list = None
    if category_ids:
        try:
            category_id_list = [int(cid.strip()) for cid in category_ids.split(",")]
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid category IDs format")
    
    # Parse priority range
    priority_range = None
    if priority_min is not None or priority_max is not None:
        min_priority = priority_min or 1
        max_priority = priority_max or 10
        if min_priority > max_priority:
            raise HTTPException(status_code=400, detail="Minimum priority cannot be greater than maximum priority")
        priority_range = (min_priority, max_priority)
    
    # Parse due date range
    due_date_range = None
    if due_date_from or due_date_to:
        from datetime import datetime
        try:
            start_date = datetime.fromisoformat(due_date_from) if due_date_from else None
            end_date = datetime.fromisoformat(due_date_to) if due_date_to else None
            due_date_range = (start_date, end_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    return search_tasks_by_multiple_criteria(
        db=db,
        search_query=query,
        priority_range=priority_range,
        category_ids=category_id_list,
        due_date_range=due_date_range,
        completion_status=completed,
        skip=skip,
        limit=limit
    )


@router.get("/statistics")
async def get_task_statistics_endpoint(db: Session = Depends(get_db)):
    """Get comprehensive task statistics."""
    return get_task_statistics(db=db)

