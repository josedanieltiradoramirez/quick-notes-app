"""merge auth branch

Revision ID: dbb162e99683
Revises: 4bb85a18d388, add_user_id_to_tables
Create Date: 2026-07-03 10:35:01.959767

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dbb162e99683'
down_revision: Union[str, Sequence[str], None] = ('4bb85a18d388', 'add_user_id_to_tables')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
