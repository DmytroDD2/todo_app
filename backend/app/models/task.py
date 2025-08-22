"""
Task model for the database.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Task(Base):
    """Task model representing a todo item."""
    
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    completed = Column(Boolean, default=False, index=True)
    priority = Column(Integer, default=5, index=True)  # 1-10 scale
    due_date = Column(DateTime(timezone=True), nullable=True, index=True)
    order_index = Column(Float, default=0.0, index=True)  # For drag-and-drop reordering
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)  # User relationship
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    category = relationship("Category", back_populates="tasks")
    user = relationship("User", back_populates="tasks")
    
    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}', completed={self.completed})>"

