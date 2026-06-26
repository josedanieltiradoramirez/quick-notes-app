from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Users(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key = True, index = True)
    email = Column(String, unique=True)
    username = Column(String, unique=True)
    first_name = Column(String)
    last_name = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean, default = True)
    role = Column(String)
    phone_number = Column(String)
    
    # relaciones inversas
    notes = relationship('Notes', back_populates='user')
    notebooks = relationship('Notebooks', back_populates='user')
    bibliographies = relationship('Bibliographies', back_populates='user')
