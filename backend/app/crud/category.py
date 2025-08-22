"""
Category CRUD operations.
"""
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


def get_categories(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Category]:
    """Get all categories for a specific user with pagination."""
    stmt = select(Category).where(Category.user_id == user_id).offset(skip).limit(limit)
    return list(db.scalars(stmt))


def get_category_by_id(db: Session, category_id: int, user_id: int) -> Optional[Category]:
    """Get a category by ID for a specific user."""
    stmt = select(Category).where(Category.id == category_id, Category.user_id == user_id)
    return db.scalar(stmt)


def get_category_by_name(db: Session, name: str, user_id: int) -> Optional[Category]:
    """Get a category by name for a specific user."""
    stmt = select(Category).where(Category.name == name, Category.user_id == user_id)
    return db.scalar(stmt)


def create_category(db: Session, category_data: CategoryCreate, user_id: int) -> Category:
    """Create a new category for a specific user."""
    category_dict = category_data.model_dump()
    category_dict['user_id'] = user_id
    db_category = Category(**category_dict)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(db: Session, category_id: int, category_data: CategoryUpdate, user_id: int) -> Optional[Category]:
    """Update a category for a specific user."""
    stmt = select(Category).where(Category.id == category_id, Category.user_id == user_id)
    db_category = db.scalar(stmt)
    if not db_category:
        return None
    
    update_data = category_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_category, field, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category


def delete_category(db: Session, category_id: int, user_id: int) -> bool:
    """Delete a category for a specific user."""
    stmt = select(Category).where(Category.id == category_id, Category.user_id == user_id)
    db_category = db.scalar(stmt)
    if not db_category:
        return False
    
    db.delete(db_category)
    db.commit()
    return True


def get_categories_with_filters(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    sort_by: str = "name",
    sort_order: str = "asc"
) -> Tuple[List[Category], int]:
    """
    Get categories with filtering and sorting.
    
    Returns:
        Tuple of (categories, total_count)
    """
    from sqlalchemy import or_, asc, desc
    
    # Build base query with user filter
    stmt = select(Category).where(Category.user_id == user_id)
    
    # Apply search filter
    if search:
        search_term = f"%{search}%"
        search_condition = or_(
            Category.name.ilike(search_term),
            Category.description.ilike(search_term)
        )
        stmt = stmt.where(search_condition)
    
    # Apply sorting
    if sort_by == "name":
        sort_column = Category.name
    elif sort_by == "created_at":
        sort_column = Category.created_at
    else:
        sort_column = Category.name
    
    if sort_order.lower() == "desc":
        stmt = stmt.order_by(desc(sort_column))
    else:
        stmt = stmt.order_by(asc(sort_column))
    
    # Get total count
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.scalar(count_stmt)
    
    # Apply pagination
    stmt = stmt.offset(skip).limit(limit)
    categories = list(db.scalars(stmt))
    
    return categories, total


def count_categories(db: Session) -> int:
    """Count total categories."""
    stmt = select(func.count(Category.id))
    return db.scalar(stmt)


def get_categories_with_task_counts(db: Session) -> List[Tuple[Category, int]]:
    """Get categories with their task counts."""
    from app.models.task import Task
    from sqlalchemy import func
    
    stmt = select(
        Category,
        func.count(Task.id).label('task_count')
    ).outerjoin(Task).group_by(Category.id)
    
    results = db.execute(stmt)
    return [(category, count) for category, count in results]
