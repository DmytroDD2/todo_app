"""Fix existing tasks order_index values

Revision ID: 6cf8a18c234a
Revises: 5d1ae807a8d7
Create Date: 2025-08-21 14:48:21.657781

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision = '6cf8a18c234a'
down_revision = '5d1ae807a8d7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Set order_index for existing tasks based on their creation time
    # This ensures they have proper values for drag-and-drop functionality
    op.execute(text("""
        UPDATE tasks 
        SET order_index = EXTRACT(EPOCH FROM created_at)
        WHERE order_index IS NULL;
    """))
    
    # Set default value for any remaining NULL values
    op.execute(text("""
        UPDATE tasks 
        SET order_index = 0.0
        WHERE order_index IS NULL;
    """))


def downgrade() -> None:
    # No downgrade needed - this is a data fix
    pass
