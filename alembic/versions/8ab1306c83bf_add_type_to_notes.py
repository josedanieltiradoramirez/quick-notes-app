"""add type to notes

Revision ID: 8ab1306c83bf
Revises: dbb162e99683
Create Date: 2026-07-08 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8ab1306c83bf'
down_revision: Union[str, Sequence[str], None] = 'dbb162e99683'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('notes', sa.Column('type', sa.String(), nullable=True))
    op.execute("UPDATE notes SET type = 'note' WHERE type IS NULL")
    op.alter_column('notes', 'type', nullable=False)


def downgrade() -> None:
    op.drop_column('notes', 'type')
