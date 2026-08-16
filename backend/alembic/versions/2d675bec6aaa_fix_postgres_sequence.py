"""fix_postgres_sequence

Revision ID: 2d675bec6aaa
Revises: ea5043a0073e
Create Date: 2026-08-17 01:29:18.907164

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2d675bec6aaa'
down_revision: Union[str, None] = 'ea5043a0073e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Safely resync the users_id_seq in Postgres if it exists
    bind = op.get_bind()
    if bind.dialect.name == 'postgresql':
        op.execute(
            "SELECT setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM users;"
        )

def downgrade() -> None:
    pass
