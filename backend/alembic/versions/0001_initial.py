"""Initial schema and default user seed

Revision ID: 0001_initial
Revises: 
Create Date: 2024-01-01 00:00:00.000000

Creates users, settings, entries tables and seeds a single default user row.
"""

from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- users ---
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False, server_default="Dad"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # --- settings ---
    op.create_table(
        "settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, unique=True),
        sa.Column("weekly_limit", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("monthly_goal", sa.Integer(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # --- entries ---
    op.create_table(
        "entries",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("entry_date", sa.Date(), nullable=False),
        sa.Column("entry_time", sa.Time(), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_index("idx_entries_user_date", "entries", ["user_id", "entry_date"])

    # --- Seed default user and settings ---
    op.execute(
        "INSERT INTO users (id, name) VALUES (1, 'Dad') ON CONFLICT DO NOTHING"
    )
    op.execute(
        "INSERT INTO settings (user_id, weekly_limit) VALUES (1, 3) ON CONFLICT DO NOTHING"
    )


def downgrade() -> None:
    op.drop_index("idx_entries_user_date", table_name="entries")
    op.drop_table("entries")
    op.drop_table("settings")
    op.drop_table("users")
