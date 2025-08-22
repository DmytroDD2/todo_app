"""Add authentication system

Revision ID: auth_001
Revises: 6cf8a18c234a
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'auth_001'
down_revision = '6cf8a18c234a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Check if users table exists
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    existing_tables = inspector.get_table_names()
    
    # Create users table if it doesn't exist
    if 'users' not in existing_tables:
        op.create_table('users',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('email', sa.String(length=255), nullable=False),
            sa.Column('hashed_password', sa.String(length=255), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
        op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # Check if user_id column exists in tasks table
    if 'tasks' in existing_tables:
        tasks_columns = [col['name'] for col in inspector.get_columns('tasks')]
        if 'user_id' not in tasks_columns:
            op.add_column('tasks', sa.Column('user_id', sa.Integer(), nullable=False, server_default='1'))
            op.create_index(op.f('ix_tasks_user_id'), 'tasks', ['user_id'], unique=False)
            op.create_foreign_key(None, 'tasks', 'users', ['user_id'], ['id'])

    # Check if user_id column exists in categories table
    if 'categories' in existing_tables:
        categories_columns = [col['name'] for col in inspector.get_columns('categories')]
        if 'user_id' not in categories_columns:
            op.add_column('categories', sa.Column('user_id', sa.Integer(), nullable=False, server_default='1'))
            op.create_index(op.f('ix_categories_user_id'), 'categories', ['user_id'], unique=False)
            op.create_foreign_key(None, 'categories', 'users', ['user_id'], ['id'])

    # Remove unique constraint from categories.name since it's now per-user
    if 'categories' in existing_tables:
        try:
            op.drop_index('ix_categories_name', table_name='categories')
            op.create_index(op.f('ix_categories_name'), 'categories', ['name'], unique=False)
        except:
            # Index might not exist, continue
            pass


def downgrade() -> None:
    # Remove foreign keys
    try:
        op.drop_constraint(None, 'categories', type_='foreignkey')
        op.drop_constraint(None, 'tasks', type_='foreignkey')
    except:
        pass

    # Remove user_id columns
    try:
        op.drop_index(op.f('ix_categories_user_id'), table_name='categories')
        op.drop_column('categories', 'user_id')
    except:
        pass
    
    try:
        op.drop_index(op.f('ix_tasks_user_id'), table_name='tasks')
        op.drop_column('tasks', 'user_id')
    except:
        pass

    # Drop users table
    try:
        op.drop_index(op.f('ix_users_id'), table_name='users')
        op.drop_index(op.f('ix_users_email'), table_name='users')
        op.drop_table('users')
    except:
        pass

    # Restore unique constraint on categories.name
    try:
        op.drop_index('ix_categories_name', table_name='categories')
        op.create_index('ix_categories_name', 'categories', ['name'], unique=True)
    except:
        pass
