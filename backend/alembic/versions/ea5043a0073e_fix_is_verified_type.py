"""fix_is_verified_type

Revision ID: ea5043a0073e
Revises: cba7e57097d4
Create Date: 2026-08-17 01:18:13.567135

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ea5043a0073e'
down_revision: Union[str, None] = 'cba7e57097d4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('users', 'is_verified')
    op.add_column('users', sa.Column('is_verified', sa.Boolean(), server_default=sa.text('false'), nullable=False))

def downgrade() -> None:
    op.drop_column('users', 'is_verified')
    op.add_column('users', sa.Column('is_verified', sa.Integer(), server_default=sa.text('0'), nullable=False))
