from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models.notebooks import Notebooks
from app.models.notes import Notes

router = APIRouter(
    prefix='/folders',
    tags=['folders']
)

class FolderSchema(BaseModel):
    title: str
    description: Optional[str] = None
    parent_id: Optional[int] = None

@router.get("/")
async def get_all_folders(db: Session = Depends(get_db)):
    return db.query(Notebooks).filter(
        Notebooks.parent_id == None,
        Notebooks.type == 'folder'
    ).all()

@router.get("/{id}")
async def get_folder_by_id(id: int, db: Session = Depends(get_db)):
    folder = db.query(Notebooks).filter(
        Notebooks.id == id,
        Notebooks.type == 'folder'
    ).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    return folder

@router.get("/{id}/folders")
async def get_folder_children(id: int, db: Session = Depends(get_db)):
    folder = db.query(Notebooks).filter(
        Notebooks.id == id,
        Notebooks.type == 'folder'
    ).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    return [child for child in folder.children if child.type == 'folder']

@router.get("/{id}/notes")
async def get_folder_notes(id: int, db: Session = Depends(get_db)):
    folder = db.query(Notebooks).filter(
        Notebooks.id == id,
        Notebooks.type == 'folder'
    ).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    return folder.notes

@router.post("/")
async def create_folder(folder: FolderSchema, db: Session = Depends(get_db)):
    new_folder = Notebooks(
        title=folder.title,
        description=folder.description,
        parent_id=folder.parent_id,
        type='folder'
    )
    db.add(new_folder)
    db.commit()
    db.refresh(new_folder)
    return new_folder

@router.put("/{id}")
async def edit_folder(id: int, folder: FolderSchema, db: Session = Depends(get_db)):
    existing_folder = db.query(Notebooks).filter(
        Notebooks.id == id,
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
async def delete_folder(id: int, db: Session = Depends(get_db)):
    folder = db.query(Notebooks).filter(
        Notebooks.id == id,
        Notebooks.type == 'folder'
    ).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    db.delete(folder)
    db.commit()
    return {"ok": True}