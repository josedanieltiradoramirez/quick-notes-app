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
    folder_ids: Optional[List[int]] = []

@router.get("/")
async def get_all_notes(db: Session = Depends(get_db)):
    notes = db.query(Notes).all()
    result = []
    for note in notes:
        result.append({
            "id": note.id,
            "title": note.title,
            "content": note.content,
            "notebooks": [{"id": n.id, "title": n.title} for n in note.notebooks if n.type == 'notebook'],
            "folders": [{"id": n.id, "title": n.title} for n in note.notebooks if n.type == 'folder'],
            "bibliographies": [{"id": b.id, "title": b.title} for b in note.bibliographies]
        })
    return result

@router.post("/")
async def create_note(note: NoteSchema, db: Session = Depends(get_db)):
    new_note = Notes(title=note.title, content=note.content)

    all_notebook_ids = list(set((note.notebook_ids or []) + (note.folder_ids or [])))
    if all_notebook_ids:
        notebooks = db.query(Notebooks).filter(Notebooks.id.in_(all_notebook_ids)).all()
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
        all_ids = list(set((note.notebook_ids or []) + (note.folder_ids or [])))
        notebooks = db.query(Notebooks).filter(Notebooks.id.in_(all_ids)).all()
        existing_note.notebooks = notebooks

    if note.bibliography_ids is not None:
        bibliographies = db.query(Bibliographies).filter(
            Bibliographies.id.in_(note.bibliography_ids)
        ).all()
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

    notes = query.all()
    result = []
    for note in notes:
        result.append({
            "id": note.id,
            "title": note.title,
            "content": note.content,
            "notebooks": [{"id": n.id, "title": n.title} for n in note.notebooks if n.type == 'notebook'],
            "folders": [{"id": n.id, "title": n.title} for n in note.notebooks if n.type == 'folder'],
            "bibliographies": [{"id": b.id, "title": b.title} for b in note.bibliographies]
        })
    return result

@router.get("/{id}")
async def get_note_by_id(id: int, db: Session = Depends(get_db)):
    note = db.query(Notes).filter(Notes.id == id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "notebooks": [{"id": n.id, "title": n.title, "type": n.type} for n in note.notebooks],
        "bibliographies": [{"id": b.id, "title": b.title} for b in note.bibliographies]
    }

@router.get("/filter/notebook/{notebook_id}")
async def filter_notes_in_notebook(
    notebook_id: int,
    notebook_ids: Optional[List[int]] = Query(default=[]),
    folder_ids: Optional[List[int]] = Query(default=[]),
    bibliography_ids: Optional[List[int]] = Query(default=[]),
    db: Session = Depends(get_db)
):
    query = db.query(Notes).filter(Notes.notebooks.any(Notebooks.id == notebook_id))

    if notebook_ids:
        query = query.filter(Notes.notebooks.any(Notebooks.id.in_(notebook_ids)))
    if folder_ids:
        query = query.filter(Notes.notebooks.any(Notebooks.id.in_(folder_ids)))
    if bibliography_ids:
        query = query.filter(Notes.bibliographies.any(Bibliographies.id.in_(bibliography_ids)))

    notes = query.all()
    result = []
    for note in notes:
        result.append({
            "id": note.id,
            "title": note.title,
            "content": note.content,
            "notebooks": [{"id": n.id, "title": n.title, "type": n.type} for n in note.notebooks],
            "bibliographies": [{"id": b.id, "title": b.title} for b in note.bibliographies]
        })
    return result