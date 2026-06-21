from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models.notes import Notes
from app.models.notebooks import Notebooks


router = APIRouter(
    prefix='/notebooks',
    tags=['notebooks']) 


class NotebookSchema(BaseModel):
    title: str
    description: Optional[str] = None
    parent_id: Optional[int] = None
    type: Optional[str] = 'notebook'

@router.get("/")
async def get_all_notebooks(db: Session = Depends(get_db)):
    return db.query(Notebooks).filter(Notebooks.parent_id == None, Notebooks.type == 'notebook').all()

@router.get("/{id}")
async def get_notebook_by_id(id: int, db: Session = Depends(get_db)):
    notebook = db.query(Notebooks).filter(Notebooks.id == id).first()
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    return notebook

@router.get("/{id}/notes")
async def get_notebook_notes_by_id(id: int, db: Session = Depends(get_db)):
    notebook = db.query(Notebooks).filter(Notebooks.id == id).first()
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    
    result = []
    for note in notebook.notes:
        result.append({
            "id": note.id,
            "title": note.title,
            "content": note.content,
            "notebooks": [{"id": n.id, "title": n.title, "type": n.type} for n in note.notebooks],
            "bibliographies": [{"id": b.id, "title": b.title} for b in note.bibliographies]
        })
    return result

@router.post("/")
async def create_notebook(notebook: NotebookSchema, db: Session = Depends(get_db)):
    new_notebook = Notebooks(
        title = notebook.title, 
        description = notebook.description,
        parent_id = notebook.parent_id,
        type = notebook.type
    )
    
    db.add(new_notebook)
    db.commit()
    db.refresh(new_notebook)
    return new_notebook

@router.put("/{id}")
async def edit_notebook(id: int, notebook: NotebookSchema, db: Session = Depends(get_db)):
    existing_notebook = db.query(Notebooks).filter(Notebooks.id == id).first()
    if not existing_notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    existing_notebook.title = notebook.title
    existing_notebook.description = notebook.description
    existing_notebook.parent_id = notebook.parent_id
    existing_notebook.type = notebook.type
    db.commit()
    db.refresh(existing_notebook)
    return existing_notebook

@router.delete("/{id}")
async def delete_notebook(id: int, db: Session = Depends(get_db)):
    notebook = db.query(Notebooks).filter(Notebooks.id == id).first()
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    db.delete(notebook)
    db.commit()
    
    return {"ok" : True}
    
@router.get("/{id}/notebooks")
async def get_notebook_children(id: int, db: Session = Depends(get_db)):
    notebook = db.query(Notebooks).filter(Notebooks.id == id).first()
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    return notebook.children
