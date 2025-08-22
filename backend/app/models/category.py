"""
Category model for the database.
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Category(Base):
    """Category model for organizing tasks."""
    
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    color = Column(String(7), default="#3B82F6")  # Hex color code
    icon = Column(String(50), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)  # User relationship
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    tasks = relationship("Task", back_populates="category", cascade="all, delete-orphan")
    user = relationship("User", back_populates="categories")
    
    def __repr__(self):
        return f"<Category(id={self.id}, name='{self.name}', color='{self.color}')>"
