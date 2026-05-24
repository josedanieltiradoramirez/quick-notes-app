from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.notes import Notes
from app.models.notebooks import Notebooks


router = APIRouter(
    prefix='/notes',
    tags=['notes']) 


class NoteSchema(BaseModel):
    title: str
    content: str

@router.get("/")
async def get_all_notes(db: Session = Depends(get_db)):
    return db.query(Notes).all()

@router.post("/")
async def create_note(note: NoteSchema, db: Session = Depends(get_db)):
    new_note = Notes(title = note.title, content = note.content)
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
    
