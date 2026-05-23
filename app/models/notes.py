from app.core.database import Base
from sqlalchemy import Column, Integer, String, Float, Boolean

class Notes(Base):
    __tablename__ = 'notes'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    owner_id = Column(Integer, nullable=True)
    date = Column(String, nullable=True)
    notebook_id = Column(Integer, nullable=True)
    parent_folder_id = Column(Integer, nullable=True)
    child_note_id = Column(Integer, nullable=True)
    bibliography_id = Column(Integer, nullable=True)
    