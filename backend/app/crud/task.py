"""
Task CRUD operations - function-based approach with modern SQLAlchemy syntax.
"""
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select, or_, desc, asc, func, and_
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate


def get_tasks(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Task]:
    """Get all tasks for a specific user with pagination."""
    stmt = select(Task).options(selectinload(Task.category)).where(Task.user_id == user_id).offset(skip).limit(limit)
    return list(db.scalars(stmt))


def get_task_by_id(db: Session, task_id: int, user_id: int) -> Optional[Task]:
    """Get a task by ID for a specific user."""
    stmt = select(Task).options(selectinload(Task.category)).where(Task.id == task_id, Task.user_id == user_id)
    return db.scalar(stmt)


def get_task_by_title(db: Session, title: str, user_id: int) -> Optional[Task]:
    """Get a task by title for a specific user."""
    stmt = select(Task).options(selectinload(Task.category)).where(Task.title == title, Task.user_id == user_id)
    return db.scalar(stmt)


def create_task(db: Session, task_data: TaskCreate, user_id: int) -> Task:
    """Create a new task for a specific user."""
    # Get the next order index if not provided
    if not hasattr(task_data, 'order_index') or task_data.order_index is None:
        max_order_stmt = select(func.max(Task.order_index)).where(Task.user_id == user_id)
        max_order = db.scalar(max_order_stmt) or 0.0
        task_data_dict = task_data.model_dump()
        task_data_dict['order_index'] = max_order + 1.0
    else:
        task_data_dict = task_data.model_dump()
    
    task_data_dict['user_id'] = user_id
    db_task = Task(**task_data_dict)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(db: Session, task_id: int, task_data: TaskUpdate, user_id: int) -> Optional[Task]:
    """Update a task for a specific user."""
    stmt = select(Task).options(selectinload(Task.category)).where(Task.id == task_id, Task.user_id == user_id)
    db_task = db.scalar(stmt)
    if not db_task:
        return None
    
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: int, user_id: int) -> bool:
    """Delete a task for a specific user."""
    stmt = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    db_task = db.scalar(stmt)
    if not db_task:
        return False
    
    db.delete(db_task)
    db.commit()
    return True


def toggle_task_completion(db: Session, task_id: int, user_id: int) -> Optional[Task]:
    """Toggle task completion status for a specific user."""
    stmt = select(Task).options(selectinload(Task.category)).where(Task.id == task_id, Task.user_id == user_id)
    db_task = db.scalar(stmt)
    if not db_task:
        return None
    
    db_task.completed = not db_task.completed
    db.commit()
    db.refresh(db_task)
    return db_task


def reorder_task(db: Session, task_id: int, new_order_index: float, user_id: int) -> Optional[Task]:
    """Reorder a task by updating its order index for a specific user."""
    stmt = select(Task).options(selectinload(Task.category)).where(Task.id == task_id, Task.user_id == user_id)
    db_task = db.scalar(stmt)
    if not db_task:
        return None
    
    db_task.order_index = new_order_index
    db.commit()
    db.refresh(db_task)
    return db_task


def get_tasks_with_filters(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    completed: Optional[bool] = None,
    category_id: Optional[int] = None,
    priority: Optional[int] = None,
    due_date_from: Optional[str] = None,
    due_date_to: Optional[str] = None,
    sort_by: str = "order_index",
    sort_order: str = "asc"
) -> Tuple[List[Task], int]:
    """
    Get tasks with filtering, searching, and sorting.
    
    Returns:
        Tuple of (tasks, total_count)
    """
    # Build base query with user filter
    stmt = select(Task).options(selectinload(Task.category)).where(Task.user_id == user_id)
    
    # Apply search filter
    if search:
        search_term = f"%{search}%"
        search_condition = or_(
            Task.title.ilike(search_term),
            Task.description.ilike(search_term)
        )
        stmt = stmt.where(search_condition)
    
    # Apply completion filter
    if completed is not None:
        stmt = stmt.where(Task.completed == completed)
    
    # Apply category filter
    if category_id is not None:
        stmt = stmt.where(Task.category_id == category_id)
    
    # Apply priority filter
    if priority is not None:
        # Priority ranges: 1=high (1-3), 4=medium (4-7), 8=low (8-10)
        if priority == 1:
            stmt = stmt.where(Task.priority <= 3)  # High priority (1-3)
        elif priority == 4:
            stmt = stmt.where(and_(Task.priority >= 4, Task.priority <= 7))  # Medium priority (4-7)
        elif priority == 8:
            stmt = stmt.where(Task.priority >= 8)  # Low priority (8-10)
        else:
            stmt = stmt.where(Task.priority == priority)  # Exact priority match
    
    # Apply due date filters
    if due_date_from:
        stmt = stmt.where(Task.due_date >= due_date_from)
    if due_date_to:
        stmt = stmt.where(Task.due_date <= due_date_to)
    
    # Apply sorting
    if sort_by == "title":
        sort_column = Task.title
    elif sort_by == "priority":
        sort_column = Task.priority
    elif sort_by == "due_date":
        sort_column = Task.due_date
    elif sort_by == "created_at":
        sort_column = Task.created_at
    elif sort_by == "order_index":
        sort_column = Task.order_index
    else:
        sort_column = Task.order_index
    
    if sort_order.lower() == "desc":
        stmt = stmt.order_by(desc(sort_column))
    else:
        stmt = stmt.order_by(asc(sort_column))
    
    # Get total count
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.scalar(count_stmt)
    
    # Apply pagination
    stmt = stmt.offset(skip).limit(limit)
    tasks = list(db.scalars(stmt))
    
    return tasks, total


def get_completed_tasks(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Task]:
    """Get all completed tasks for a specific user."""
    stmt = select(Task).options(selectinload(Task.category)).where(Task.completed == True, Task.user_id == user_id).offset(skip).limit(limit)
    return list(db.scalars(stmt))


def get_pending_tasks(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Task]:
    """Get all pending (incomplete) tasks for a specific user."""
    stmt = select(Task).options(selectinload(Task.category)).where(Task.completed == False, Task.user_id == user_id).offset(skip).limit(limit)
    return list(db.scalars(stmt))


def get_high_priority_tasks(db: Session, user_id: int, priority_threshold: int = 7) -> List[Task]:
    """Get high priority tasks (priority >= threshold) for a specific user."""
    stmt = select(Task).options(selectinload(Task.category)).where(Task.priority >= priority_threshold, Task.user_id == user_id)
    return list(db.scalars(stmt))


def get_tasks_by_priority(db: Session, priority: int) -> List[Task]:
    """Get tasks by priority level."""
    stmt = select(Task).options(selectinload(Task.category)).where(Task.priority == priority)
    return list(db.scalars(stmt))


def get_tasks_by_category(db: Session, category_id: int) -> List[Task]:
    """Get tasks by category."""
    stmt = select(Task).options(selectinload(Task.category)).where(Task.category_id == category_id)
    return list(db.scalars(stmt))


def get_overdue_tasks(db: Session, user_id: int) -> List[Task]:
    """Get overdue tasks for a specific user."""
    from datetime import datetime
    now = datetime.utcnow()
    stmt = select(Task).options(selectinload(Task.category)).where(
        and_(
            Task.due_date < now,
            Task.completed == False,
            Task.user_id == user_id
        )
    )
    return list(db.scalars(stmt))


def get_tasks_due_today(db: Session, user_id: int) -> List[Task]:
    """Get tasks due today for a specific user."""
    from datetime import datetime, date
    today = date.today()
    stmt = select(Task).options(selectinload(Task.category)).where(
        and_(
            func.date(Task.due_date) == today,
            Task.completed == False,
            Task.user_id == user_id
        )
    )
    return list(db.scalars(stmt))


def count_tasks(db: Session) -> int:
    """Count total tasks."""
    stmt = select(func.count(Task.id))
    return db.scalar(stmt)


def count_completed_tasks(db: Session) -> int:
    """Count completed tasks."""
    stmt = select(func.count(Task.id)).where(Task.completed == True)
    return db.scalar(stmt)


def count_pending_tasks(db: Session) -> int:
    """Count pending tasks."""
    stmt = select(func.count(Task.id)).where(Task.completed == False)
    return db.scalar(stmt)


def get_tasks_by_date_range(db: Session, start_date, end_date, skip: int = 0, limit: int = 100) -> List[Task]:
    """Get tasks created within a date range."""
    stmt = select(Task).options(selectinload(Task.category)).where(
        and_(
            Task.created_at >= start_date,
            Task.created_at <= end_date
        )
    ).offset(skip).limit(limit)
    return list(db.scalars(stmt))


def get_tasks_by_multiple_priorities(db: Session, priorities: List[int]) -> List[Task]:
    """Get tasks by multiple priority levels."""
    stmt = select(Task).options(selectinload(Task.category)).where(Task.priority.in_(priorities))
    return list(db.scalars(stmt))


def search_tasks_advanced(db: Session, search_terms: List[str], skip: int = 0, limit: int = 100) -> List[Task]:
    """Advanced search with multiple terms."""
    conditions = []
    for term in search_terms:
        search_pattern = f"%{term}%"
        condition = or_(
            Task.title.ilike(search_pattern),
            Task.description.ilike(search_pattern)
        )
        conditions.append(condition)
    
    stmt = select(Task).options(selectinload(Task.category)).where(and_(*conditions)).offset(skip).limit(limit)
    return list(db.scalars(stmt))


def search_tasks_full_text(db: Session, search_query: str, skip: int = 0, limit: int = 100) -> List[Task]:
    """Full-text search across title and description."""
    # Split search query into words for better matching
    search_words = search_query.split()
    
    conditions = []
    for word in search_words:
        if len(word) >= 2:  # Only search for words with 2+ characters
            search_pattern = f"%{word}%"
            condition = or_(
                Task.title.ilike(search_pattern),
                Task.description.ilike(search_pattern)
            )
            conditions.append(condition)
    
    if not conditions:
        # If no valid search words, return empty list
        return []
    
    stmt = select(Task).options(selectinload(Task.category)).where(or_(*conditions)).offset(skip).limit(limit)
    return list(db.scalars(stmt))


def search_tasks_by_multiple_criteria(
    db: Session,
    search_query: Optional[str] = None,
    priority_range: Optional[tuple] = None,
    category_ids: Optional[List[int]] = None,
    due_date_range: Optional[tuple] = None,
    completion_status: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Task]:
    """Advanced search with multiple criteria simultaneously."""
    stmt = select(Task).options(selectinload(Task.category))
    conditions = []
    
    # Text search
    if search_query:
        search_words = search_query.split()
        text_conditions = []
        for word in search_words:
            if len(word) >= 2:
                search_pattern = f"%{word}%"
                text_condition = or_(
                    Task.title.ilike(search_pattern),
                    Task.description.ilike(search_pattern)
                )
                text_conditions.append(text_condition)
        if text_conditions:
            conditions.append(or_(*text_conditions))
    
    # Priority range
    if priority_range:
        min_priority, max_priority = priority_range
        conditions.append(Task.priority.between(min_priority, max_priority))
    
    # Category filter
    if category_ids:
        conditions.append(Task.category_id.in_(category_ids))
    
    # Due date range
    if due_date_range:
        start_date, end_date = due_date_range
        conditions.append(Task.due_date.between(start_date, end_date))
    
    # Completion status
    if completion_status is not None:
        conditions.append(Task.completed == completion_status)
    
    # Apply all conditions
    if conditions:
        stmt = stmt.where(and_(*conditions))
    
    # Apply pagination
    stmt = stmt.offset(skip).limit(limit)
    
    return list(db.scalars(stmt))


def get_task_statistics(db: Session) -> dict:
    """Get comprehensive task statistics."""
    total_tasks = db.scalar(select(func.count(Task.id)))
    completed_tasks = db.scalar(select(func.count(Task.id)).where(Task.completed == True))
    pending_tasks = db.scalar(select(func.count(Task.id)).where(Task.completed == False))
    overdue_tasks = len(get_overdue_tasks(db))
    due_today_tasks = len(get_tasks_due_today(db))
    high_priority_tasks = len(get_high_priority_tasks(db))
    
    # Priority distribution
    priority_stats = {}
    for priority in range(1, 11):
        count = db.scalar(select(func.count(Task.id)).where(Task.priority == priority))
        priority_stats[f"priority_{priority}"] = count
    
    return {
        "total": total_tasks,
        "completed": completed_tasks,
        "pending": pending_tasks,
        "overdue": overdue_tasks,
        "due_today": due_today_tasks,
        "high_priority": high_priority_tasks,
        "completion_rate": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
        "priority_distribution": priority_stats
    }
