from app.core.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey

class Bibliographies(Base):
    __tablename__ = 'bibliographies'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    type = Column(String, nullable=True)
    url = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    # relación con usuario
    user = relationship('Users', back_populates='bibliographies')

    # muchos a muchos
    notes = relationship('Notes', secondary='notes_bibliographies', back_populates='bibliographies')