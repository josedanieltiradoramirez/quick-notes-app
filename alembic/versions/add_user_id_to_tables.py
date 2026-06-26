"""add user_id to notes, notebooks, and bibliographies tables

Revision ID: add_user_id_to_tables
Revises: 4932ae0e0e5c
Create Date: 2026-06-26 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_user_id_to_tables'
down_revision: Union[str, Sequence[str], None] = 'create_users_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Agregar user_id a notas
    op.add_column('notes', sa.Column('user_id', sa.Integer(), nullable=True))
    op.create_foreign_key('notes_user_id_fkey', 'notes', 'users', ['user_id'], ['id'])
    
    # Agregar user_id a notebooks
    op.add_column('notebooks', sa.Column('user_id', sa.Integer(), nullable=True))
    op.create_foreign_key('notebooks_user_id_fkey', 'notebooks', 'users', ['user_id'], ['id'])
    
    # Agregar user_id a bibliographies
    op.add_column('bibliographies', sa.Column('user_id', sa.Integer(), nullable=True))
    op.create_foreign_key('bibliographies_user_id_fkey', 'bibliographies', 'users', ['user_id'], ['id'])


def downgrade() -> None:
    # Remover constraints
    op.drop_constraint('bibliographies_user_id_fkey', 'bibliographies', type_='foreignkey')
    op.drop_constraint('notebooks_user_id_fkey', 'notebooks', type_='foreignkey')
    op.drop_constraint('notes_user_id_fkey', 'notes', type_='foreignkey')
    
    # Remover columnas
    op.drop_column('bibliographies', 'user_id')
    op.drop_column('notebooks', 'user_id')
    op.drop_column('notes', 'user_id')
