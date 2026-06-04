from sqlalchemy import Column, Integer, ForeignKey
from app.core.database import Base

class NoteBibliography(Base):
    __tablename__ = 'notes_bibliographies'

    note_id = Column(Integer, ForeignKey('notes.id'), primary_key=True)
    bibliography_id = Column(Integer, ForeignKey('bibliographies.id'), primary_key=True)
