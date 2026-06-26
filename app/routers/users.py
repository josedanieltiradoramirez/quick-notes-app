from typing import Annotated
from pydantic import Field
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, Path, APIRouter
from starlette import status
from pydantic import BaseModel
from app.core.database import SessionLocal
from app.models.users import Users
from app.routers.auth import get_current_user
from passlib.context import CryptContext



router = APIRouter(
    prefix='/user',
    tags=['user']
)

class UserVerification(BaseModel):
    password: str
    new_password: str = Field(min_length=6)

class PhoneNumberChangeRequest(BaseModel):
    password: str
    new_phone_number: str = Field(min_length=10, max_length=15)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]
bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")



@router.get("/", status_code=status.HTTP_200_OK)
async def get_user(user: user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')
    return {
        'id': user.id,
        'email': user.email,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': user.role,
        'phone_number': user.phone_number,
        'is_active': user.is_active,
    }

@router.put("/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(user: user_dependency, db:db_dependency, user_verification: UserVerification):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')
    user_model = db.query(Users).filter(Users.id == user.id).first()
    if user_model is None:
        raise HTTPException(status_code=404, detail='User not found')
    if not bcrypt_context.verify(user_verification.password, user_model.hashed_password):
        raise HTTPException(status_code=401, detail='Error on password change')
    user_model.hashed_password = bcrypt_context.hash(user_verification.new_password)
    db.commit()

@router.put("/phone_number/{phone_number}", status_code=status.HTTP_204_NO_CONTENT)
async def change_phone_number(user: user_dependency, db:db_dependency, phone_number: str = Path(min_length=10, max_length=15)):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')
    user_model = db.query(Users).filter(Users.id == user.id).first()
    if user_model is None:
        raise HTTPException(status_code=404, detail='User not found')

    user_model.phone_number = phone_number
    db.add(user_model)
    db.commit()
