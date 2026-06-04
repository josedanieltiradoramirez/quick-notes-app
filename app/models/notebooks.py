from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Notebooks(Base):
    __tablename__ = 'notebooks'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    parent_id = Column(Integer, ForeignKey('notebooks.id'), nullable=True)

    # jerarquía
    parent = relationship('Notebooks', remote_side=[id], back_populates='children')
    children = relationship('Notebooks', back_populates='parent')

    # muchos a muchos
    notes = relationship('Notes', secondary='notes_notebooks', back_populates='notebooks')