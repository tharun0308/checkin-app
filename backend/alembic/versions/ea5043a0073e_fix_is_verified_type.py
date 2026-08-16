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
    op.alter_column('users', 'is_verified',
               existing_type=sa.Integer(),
               type_=sa.Boolean(),
               existing_nullable=False,
               existing_server_default='0',
               postgresql_using='is_verified::integer::boolean')

def downgrade() -> None:
    op.alter_column('users', 'is_verified',
               existing_type=sa.Boolean(),
               type_=sa.Integer(),
               existing_nullable=False,
               existing_server_default='0',
               postgresql_using='is_verified::integer')
