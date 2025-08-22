"""
Main FastAPI application.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import tasks_router, categories_router, auth_router
from app.core.database import engine
from app.models import task, category, user

# Create database tables
task.Base.metadata.create_all(bind=engine)
category.Base.metadata.create_all(bind=engine)
user.Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="TODO API",
    description="A modern TODO application API with authentication",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(categories_router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to TODO API",
        "version": "1.0.0",
        "docs": "/docs",
        "auth_endpoints": "/auth"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
