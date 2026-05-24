from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Notes(Base):
    __tablename__ = 'notes'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    notebook_id = Column(Integer, ForeignKey('notebooks.id'), nullable=True)

    # relación
    notebook = relationship('Notebooks', back_populates='notes')