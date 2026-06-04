from sqlalchemy import Column, Integer, ForeignKey
from app.core.database import Base

class NoteNotebook(Base):
    __tablename__ = 'notes_notebooks'

    note_id = Column(Integer, ForeignKey('notes.id'), primary_key=True)
    notebook_id = Column(Integer, ForeignKey('notebooks.id'), primary_key=True)
