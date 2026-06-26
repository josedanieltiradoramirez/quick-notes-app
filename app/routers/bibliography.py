from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, Annotated, List

from app.core.database import get_db
from app.models.notes import Notes
from app.models.notebooks import Notebooks
from app.models.bibliographies import Bibliographies
from app.models.notes_bibliographies import NoteBibliography
from app.models.users import Users
from app.routers.auth import get_current_user


router = APIRouter(
    prefix='/bibliographies',
    tags=['bibliographies']) 


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]

class BibliographySchema(BaseModel):
    title: str
    description: Optional[str] = None
    type: Optional[str] = None
    url: Optional[str] = None

@router.get("/")
async def get_all_bibliographies(user: user_dependency, db: db_dependency):
    return db.query(Bibliographies).filter(Bibliographies.user_id == user.id).all()

@router.get("/{id}")
async def get_bibliography_by_id(user: user_dependency, id: int, db: db_dependency):
    bibliography = db.query(Bibliographies).filter(Bibliographies.id == id, Bibliographies.user_id == user.id).first()
    if not bibliography:
        raise HTTPException(status_code=404, detail="Bibliography not found")
    return bibliography

@router.get("/{id}/notes")
async def get_bibliography_notes_by_id(user: user_dependency, id: int, db: db_dependency):
    bibliography = db.query(Bibliographies).filter(Bibliographies.id == id, Bibliographies.user_id == user.id).first()
    if not bibliography:
        raise HTTPException(status_code=404, detail="Bibliography not found")
    return bibliography.notes

@router.post("/")
async def create_bibliography(user: user_dependency, bibliography: BibliographySchema, db: db_dependency):
    new_bibliography = Bibliographies(
        title = bibliography.title,
        description = bibliography.description,
        type = bibliography.type,
        url = bibliography.url,
        user_id = user.id)
    db.add(new_bibliography)
    db.commit()
    db.refresh(new_bibliography)
    return new_bibliography

@router.put("/{id}")
async def edit_bibliography(user: user_dependency, id: int, bibliography: BibliographySchema, db: db_dependency):
    existing_bibliography = db.query(Bibliographies).filter(Bibliographies.id == id, Bibliographies.user_id == user.id).first()
    if not existing_bibliography:
        raise HTTPException(status_code=404, detail="Bibliography not found")
    existing_bibliography.title = bibliography.title
    existing_bibliography.description = bibliography.description
    existing_bibliography.type = bibliography.type
    existing_bibliography.url = bibliography.url
    db.commit()
    db.refresh(existing_bibliography)
    return existing_bibliography

@router.delete("/{id}")
async def delete_bibliography(user: user_dependency, id: int, db: db_dependency):
    bibliography = db.query(Bibliographies).filter(Bibliographies.id == id, Bibliographies.user_id == user.id).first()
    if not bibliography:
        raise HTTPException(status_code=404, detail="Bibliography not found")
    db.delete(bibliography)
    db.commit()
    
    return {"ok" : True}
    
@router.get("/filter/bibliography/{bibliography_id}")
async def filter_notes_in_bibliography(
    bibliography_id: int,
    notebook_ids: Optional[List[int]] = Query(default=[]),
    folder_ids: Optional[List[int]] = Query(default=[]),
    bibliography_ids: Optional[List[int]] = Query(default=[]),
    user: user_dependency = None,
    db: db_dependency = None
):
    query = db.query(Notes).filter(Notes.user_id == user.id, Notes.bibliographies.any(Bibliographies.id == bibliography_id))

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