# TODO Application

A modern, full-stack TODO application built with Python FastAPI, React, Next.js, and PostgreSQL. Features user authentication, task management, categories, due dates, and drag-and-drop functionality.

## Features

- ✅ User authentication and registration
- ✅ Secure JWT token-based authentication
- ✅ User-specific task and category management
- ✅ Display list of all tasks
- ✅ Add new tasks and remove tasks
- ✅ Search for tasks
- ✅ Mark tasks as done/undone
- ✅ Filter tasks by status (all/done/undone)
- ✅ Assign priority to tasks (1-10)
- ✅ Sort tasks by priority (ascending/descending)
- ✅ Due dates and categories
- ✅ Drag-and-drop reordering
- ✅ Dark mode support
- ✅ Mobile responsive design
- ✅ Task statistics and analytics
- ✅ Calendar view for due dates
- ✅ Category management system

## Tech Stack

- **Backend**: Python FastAPI with SQLAlchemy
- **Frontend**: React with Next.js 14+ (App Router)
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS + shadcn/ui components
- **Language**: TypeScript (frontend), Python (backend)
- **Package Manager**: npm (frontend), pip (backend)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Additional Libraries**: @dnd-kit/core for drag-and-drop, date-fns for date handling

## Project Structure

```
todo_app/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── models/         # SQLAlchemy models (Task, Category, User)
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── api/           # API routes (tasks, categories, auth)
│   │   ├── core/          # Configuration and auth utilities
│   │   ├── crud/          # Database operations
│   │   └── main.py        # FastAPI app
│   ├── requirements.txt
│   └── alembic/           # Database migrations
├── frontend/              # Next.js frontend
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   │   ├── auth/        # Authentication components
│   │   ├── task/        # Task management components
│   │   ├── category/    # Category management components
│   │   ├── features/    # Advanced features (statistics, calendar)
│   │   └── ui/          # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and configs
│   ├── types/           # TypeScript types
│   └── package.json
├── docs/                 # Additional documentation
└── README.md
```

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp env.example .env
   # Edit .env with your database credentials and secret keys
   ```

5. Run database migrations:
   ```bash
   alembic upgrade head
   ```

6. Start the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env.local
   # Edit .env.local with your backend URL
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/todo_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Todo App
```

## Authentication

The application includes a complete authentication system:

### Features
- User registration with email and password
- Secure login with JWT tokens
- Protected routes and API endpoints
- User-specific data isolation
- Token refresh functionality
- Automatic logout on token expiration

### API Endpoints
- `POST /auth/register` - Register a new user
- `GET /auth/login` - Login user
- `GET /auth/me` - Get current user info
- `PUT /auth/me` - Update user profile
- `POST /auth/refresh` - Refresh access token

### Security
- Passwords are hashed using bcrypt
- JWT tokens with configurable expiration
- CORS protection
- Input validation with Pydantic
- SQL injection protection via SQLAlchemy

## API Documentation

Once the backend is running, you can access:
- Interactive API docs: `http://localhost:8000/docs`
- ReDoc documentation: `http://localhost:8000/redoc`

### Main API Endpoints

#### Tasks
- `GET /tasks` - Get user's tasks
- `POST /tasks` - Create new task
- `PUT /tasks/{task_id}` - Update task
- `DELETE /tasks/{task_id}` - Delete task
- `PUT /tasks/{task_id}/toggle` - Toggle task completion
- `PUT /tasks/reorder` - Reorder tasks

#### Categories
- `GET /categories` - Get user's categories
- `POST /categories` - Create new category
- `PUT /categories/{category_id}` - Update category
- `DELETE /categories/{category_id}` - Delete category

## Development

### Backend Development

- Follow PEP 8 style guidelines
- Use Pydantic models for API schemas
- Implement proper error handling
- Add input validation for all endpoints
- Use async/await for database operations
- Run tests: `python -m pytest test_*.py`

### Frontend Development

- Use TypeScript strict mode
- Follow React functional component patterns
- Use Tailwind CSS for styling
- Implement proper loading and error states
- Use React Query for server state management
- Implement authentication context and protected routes
- Run tests: `npm test`
- Build for production: `npm run build`

### Code Quality

- Use ESLint and Prettier for code formatting
- Follow the established folder structure
- Keep components small and focused (max 200 lines)
- Use descriptive variable and function names
- Add JSDoc comments for complex functions
- Include error handling in all API calls



## Database Management

### Creating Migrations
```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
```

### Applying Migrations
```bash
cd backend
alembic upgrade head
```

### Rolling Back Migrations
```bash
cd backend
alembic downgrade -1
```

## Troubleshooting

### Common Issues

#### Backend Issues
- **Database connection error**: Check DATABASE_URL in .env file
- **Migration errors**: Ensure PostgreSQL is running and accessible
- **Import errors**: Activate virtual environment before running commands

#### Frontend Issues
- **Build errors**: Clear node_modules and reinstall dependencies
- **API connection errors**: Verify backend URL in .env.local
- **TypeScript errors**: Run `npm run type-check`

### Performance Optimization

- Use database indexes for frequently queried fields
- Implement pagination for large datasets
- Use React.memo for expensive components
- Implement proper caching strategies with React Query

## Deployment



### Production Considerations

- Use environment-specific configuration files
- Implement proper logging and monitoring
- Set up CI/CD pipelines
- Use production-grade database
- Implement rate limiting and security headers
- Set up SSL certificates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the coding standards
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request with a clear description

### Development Workflow

1. Create an issue describing the feature/bug
2. Assign the issue to yourself
3. Create a feature branch
4. Implement the changes
5. Write/update tests
6. Update documentation if needed
7. Submit a pull request
8. Request code review

## Changelog

### Version 1.0.0
- Initial release with core functionality
- User authentication system
- Task management with categories
- Drag-and-drop reordering
- Dark mode support
- Mobile responsive design

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- FastAPI for the excellent backend framework
- Next.js team for the amazing React framework
- Tailwind CSS for the utility-first CSS framework
- shadcn/ui for the beautiful component library
- @dnd-kit for the drag-and-drop functionality

## Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Search existing issues on GitHub
3. Create a new issue with detailed information
4. Include error messages, logs, and steps to reproduce

---

**Happy coding! 🚀**

