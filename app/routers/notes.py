from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.bibliographies import Bibliographies
from app.models.notes import Notes
from app.models.notebooks import Notebooks
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException


router = APIRouter(
    prefix='/notes',
    tags=['notes']) 


class NoteSchema(BaseModel):
    title: str
    content: str
    notebook_ids: Optional[List[int]] = []
    bibliography_ids: Optional[List[int]] = []

@router.get("/")
async def get_all_notes(db: Session = Depends(get_db)):
    return db.query(Notes).all()

@router.post("/")
async def create_note(note: NoteSchema, db: Session = Depends(get_db)):
    new_note = Notes(title=note.title, content=note.content)
    
    if note.notebook_ids:
        notebooks = db.query(Notebooks).filter(Notebooks.id.in_(note.notebook_ids)).all()
        new_note.notebooks = notebooks

    if note.bibliography_ids:
        bibliographies = db.query(Bibliographies).filter(Bibliographies.id.in_(note.bibliography_ids)).all()
        new_note.bibliographies = bibliographies

    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note


@router.put("/{id}")
async def edit_note(id: int, note: NoteSchema, db: Session = Depends(get_db)):
    existing_note = db.query(Notes).filter(Notes.id == id).first()
    if not existing_note:
        raise HTTPException(status_code=404, detail="Note not found")
    existing_note.title = note.title
    existing_note.content = note.content

    if note.notebook_ids is not None:
        notebooks = db.query(Notebooks).filter(Notebooks.id.in_(note.notebook_ids)).all()
        existing_note.notebooks = notebooks

    if note.bibliography_ids is not None:
        bibliographies = db.query(Bibliographies).filter(Bibliographies.id.in_(note.bibliography_ids)).all()
        existing_note.bibliographies = bibliographies

    db.commit()
    db.refresh(existing_note)
    return existing_note
    


@router.delete("/{id}")
async def delete_note(id: int, db: Session = Depends(get_db)):
    note = db.query(Notes).filter(Notes.id == id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    
    return {"ok" : True}
    
@router.get("/filter")
async def filter_notes(
    notebook_ids: Optional[List[int]] = Query(default=[]),
    folder_ids: Optional[List[int]] = Query(default=[]),
    bibliography_ids: Optional[List[int]] = Query(default=[]),
    db: Session = Depends(get_db)
):
    query = db.query(Notes)

    if notebook_ids:
        query = query.filter(Notes.notebooks.any(Notebooks.id.in_(notebook_ids)))

    if folder_ids:
        query = query.filter(Notes.notebooks.any(Notebooks.id.in_(folder_ids)))

    if bibliography_ids:
        query = query.filter(Notes.bibliographies.any(Bibliographies.id.in_(bibliography_ids)))

    return query.all()