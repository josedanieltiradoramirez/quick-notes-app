from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Notes(Base):
    __tablename__ = 'notes'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    

    # muchos a muchos
    notebooks = relationship('Notebooks', secondary='notes_notebooks', back_populates='notes')
    bibliographies = relationship('Bibliographies', secondary='notes_bibliographies', back_populates='notes')