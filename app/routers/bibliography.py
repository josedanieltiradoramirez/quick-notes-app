from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models.notes import Notes
from app.models.notebooks import Notebooks
from app.models.bibliographies import Bibliographies
from app.models.notes_bibliographies import NoteBibliography


router = APIRouter(
    prefix='/bibliographies',
    tags=['bibliographies']) 


class BibliographySchema(BaseModel):
    title: str
    description: Optional[str] = None
    type: Optional[str] = None
    url: Optional[str] = None

@router.get("/")
async def get_all_bibliographies(db: Session = Depends(get_db)):
    return db.query(Bibliographies).all()

@router.get("/{id}")
async def get_bibliography_by_id(id: int, db: Session = Depends(get_db)):
    bibliography = db.query(Bibliographies).filter(Bibliographies.id == id).first()
    if not bibliography:
        raise HTTPException(status_code=404, detail="Bibliography not found")
    return bibliography

@router.get("/{id}/notes")
async def get_bibliography_notes_by_id(id: int, db: Session = Depends(get_db)):
    bibliography = db.query(Bibliographies).filter(Bibliographies.id == id).first()
    if not bibliography:
        raise HTTPException(status_code=404, detail="Bibliography not found")
    return bibliography.notes

@router.post("/")
async def create_bibliography(bibliography: BibliographySchema, db: Session = Depends(get_db)):
    new_bibliography = Bibliographies(
        title = bibliography.title,
        description = bibliography.description,
        type = bibliography.type,
        url = bibliography.url)
    db.add(new_bibliography)
    db.commit()
    db.refresh(new_bibliography)
    return new_bibliography

@router.put("/{id}")
async def edit_bibliography(id: int, bibliography: BibliographySchema, db: Session = Depends(get_db)):
    existing_bibliography = db.query(Bibliographies).filter(Bibliographies.id == id).first()
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
async def delete_bibliography(id: int, db: Session = Depends(get_db)):
    bibliography = db.query(Bibliographies).filter(Bibliographies.id == id).first()
    if not bibliography:
        raise HTTPException(status_code=404, detail="Bibliography not found")
    db.delete(bibliography)
    db.commit()
    
    return {"ok" : True}
    
