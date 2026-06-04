"""add many to many notes notebooks

Revision ID: 4932ae0e0e5c
Revises: dfce6f72a1f0
Create Date: 2026-06-03 13:26:02.936764

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4932ae0e0e5c'
down_revision: Union[str, Sequence[str], None] = 'dfce6f72a1f0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # crear tabla intermedia
    op.create_table('notes_notebooks',
        sa.Column('note_id', sa.Integer(), nullable=False),
        sa.Column('notebook_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['note_id'], ['notes.id']),
        sa.ForeignKeyConstraint(['notebook_id'], ['notebooks.id']),
        sa.PrimaryKeyConstraint('note_id', 'notebook_id')
    )
    # eliminar columna vieja
    op.drop_constraint('notes_notebook_id_fkey', 'notes', type_='foreignkey')
    op.drop_column('notes', 'notebook_id')


def downgrade() -> None:
    op.drop_table('notes_notebooks')
    op.add_column('notes', sa.Column('notebook_id', sa.INTEGER(), autoincrement=False, nullable=True))
    op.create_foreign_key('notes_notebook_id_fkey', 'notes', 'notebooks', ['notebook_id'], ['id'])