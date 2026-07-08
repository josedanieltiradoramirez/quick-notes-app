from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, Annotated

from app.core.database import get_db
from app.models.notebooks import Notebooks
from app.models.notes import Notes
from app.models.users import Users
from app.routers.auth import get_current_user

router = APIRouter(
    prefix='/folders',
    tags=['folders']
)

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]

class FolderSchema(BaseModel):
    title: str
    description: Optional[str] = None
    parent_id: Optional[int] = None

@router.get("/")
async def get_all_folders(user: user_dependency, db: db_dependency, root_only: bool = Query(False)):
    query = db.query(Notebooks).filter(
        Notebooks.user_id == user.id,
        Notebooks.type == 'folder'
    )
    if root_only:
        query = query.filter(Notebooks.parent_id == None)
    return query.all()

@router.get("/{id}")
async def get_folder_by_id(user: user_dependency, id: int, db: db_dependency):
    folder = db.query(Notebooks).filter(
        Notebooks.id == id,
        Notebooks.user_id == user.id,
        Notebooks.type == 'folder'
    ).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    return folder

@router.get("/{id}/folders")
async def get_folder_children(user: user_dependency, id: int, db: db_dependency):
    folder = db.query(Notebooks).filter(
        Notebooks.id == id,
        Notebooks.user_id == user.id,
        Notebooks.type == 'folder'
    ).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    return [child for child in folder.children if child.type == 'folder']

@router.get("/{id}/notes")
async def get_folder_notes(user: user_dependency, id: int, db: db_dependency):
    folder = db.query(Notebooks).filter(
        Notebooks.id == id,
        Notebooks.user_id == user.id,
        Notebooks.type == 'folder'
    ).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    return folder.notes

@router.post("/")
async def create_folder(user: user_dependency, folder: FolderSchema, db: db_dependency):
    new_folder = Notebooks(
        title=folder.title,
        description=folder.description,
        parent_id=folder.parent_id,
        type='folder',
        user_id=user.id
    )
    db.add(new_folder)
    db.commit()
    db.refresh(new_folder)
    return new_folder

@router.put("/{id}")
async def edit_folder(user: user_dependency, id: int, folder: FolderSchema, db: db_dependency):
    existing_folder = db.query(Notebooks).filter(
        Notebooks.id == id,
        Notebooks.user_id == user.id,
        Notebooks.type == 'folder'
    ).first()
    if not existing_folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    existing_folder.title = folder.title
    existing_folder.description = folder.description
    existing_folder.parent_id = folder.parent_id
    db.commit()
    db.refresh(existing_folder)
    return existing_folder

@router.delete("/{id}")
async def delete_folder(user: user_dependency, id: int, db: db_dependency):
    folder = db.query(Notebooks).filter(
        Notebooks.id == id,
        Notebooks.user_id == user.id,
        Notebooks.type == 'folder'
    ).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    db.delete(folder)
    db.commit()
    return {"ok": True}