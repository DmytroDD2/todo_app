"""
Configuration settings for the FastAPI application.
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings."""
    
    # Database
    DATABASE_URL: str = "sqlite:///./todo_app.db"
    
    # Application
    SECRET_KEY: str = "your-secret-key-here"
    DEBUG: bool = True
    ALLOWED_HOSTS: str = "localhost,127.0.0.1"
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    @property
    def allowed_hosts_list(self) -> List[str]:
        """Convert ALLOWED_HOSTS string to list."""
        return [host.strip() for host in self.ALLOWED_HOSTS.split(",")]
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS_ORIGINS string to list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()
