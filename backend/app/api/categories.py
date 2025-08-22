"""
API routes for category operations.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.user import User
from app.crud.category import (
    get_categories_with_filters,
    create_category as crud_create_category,
    get_category_by_id,
    update_category as crud_update_category,
    delete_category as crud_delete_category,
    get_category_by_name
)
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryListResponse

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=CategoryListResponse)
async def get_categories(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of categories to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of categories to return"),
    search: Optional[str] = Query(None, description="Search term for name or description"),
    sort_by: str = Query("name", description="Sort field (name, created_at)"),
    sort_order: str = Query("asc", description="Sort order (asc, desc)")
):
    """Get list of categories with filtering and sorting."""
    categories, total = get_categories_with_filters(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    return CategoryListResponse(
        categories=categories,
        total=total,
        page=skip // limit + 1,
        size=limit
    )


@router.post("/", response_model=CategoryResponse, status_code=201)
async def create_category(
    category: CategoryCreate, 
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new category."""
    # Check for duplicate name within user's categories
    existing_category = get_category_by_name(db, name=category.name, user_id=current_user.id)
    if existing_category:
        raise HTTPException(status_code=409, detail=f"Category with name '{category.name}' already exists")
    
    return crud_create_category(db=db, category_data=category, user_id=current_user.id)


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: int, 
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific category by ID."""
    category = get_category_by_id(db=db, category_id=category_id, user_id=current_user.id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int, 
    category_update: CategoryUpdate, 
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a category."""
    # Check for duplicate name if name is being updated
    if category_update.name:
        existing_category = get_category_by_name(db, name=category_update.name, user_id=current_user.id)
        if existing_category and existing_category.id != category_id:
            raise HTTPException(status_code=409, detail=f"Category with name '{category_update.name}' already exists")
    
    updated_category = crud_update_category(db=db, category_id=category_id, category_data=category_update, user_id=current_user.id)
    if not updated_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return updated_category


@router.delete("/{category_id}", status_code=204)
async def delete_category(
    category_id: int, 
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a category."""
    success = crud_delete_category(db=db, category_id=category_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return None
