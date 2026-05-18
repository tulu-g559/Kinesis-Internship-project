"""Add betting_price to market outcomes

Revision ID: add_betting_price
Revises: e293f5e365fe
Create Date: 2026-05-18 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_betting_price'
down_revision = 'e293f5e365fe'
branch_labels = None
depends_on = None


def upgrade():
    # Add betting_price column if it doesn't exist
    op.add_column('market_outcomes', sa.Column('betting_price', sa.Float(), nullable=True, server_default='0.001'))


def downgrade():
    # Remove betting_price column
    op.drop_column('market_outcomes', 'betting_price')
