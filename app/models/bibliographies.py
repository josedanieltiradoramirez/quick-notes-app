from app.core.database import Base
from sqlalchemy import Column, Integer, String, Float, Boolean

class Bibliographies(Base):
    __tablename__ = 'bibliographies'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    owner_id = Column(Integer, nullable=False)
    date = Column(String, nullable=False)
    notebook_id = Column(Integer, nullable=False)
    parent_folder_id = Column(Integer, nullable=False)
    child_note_id = Column(Integer, nullable=False)
    bibliography_id = Column(Integer, nullable=False)
    