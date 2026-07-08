from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, Annotated

from app.core.database import get_db
from app.models.notes import Notes
from app.models.notebooks import Notebooks
from app.models.users import Users
from app.routers.auth import get_current_user


router = APIRouter(
    prefix='/notebooks',
    tags=['notebooks']) 


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]

class NotebookSchema(BaseModel):
    title: str
    description: Optional[str] = None
    parent_id: Optional[int] = None
    type: Optional[str] = 'notebook'

@router.get("/")
async def get_all_notebooks(user: user_dependency, db: db_dependency, root_only: bool = Query(False)):
    query = db.query(Notebooks).filter(Notebooks.user_id == user.id, Notebooks.type == 'notebook')
    if root_only:
        query = query.filter(Notebooks.parent_id == None)
    return query.all()

@router.get("/{id}")
async def get_notebook_by_id(user: user_dependency, id: int, db: db_dependency):
    notebook = db.query(Notebooks).filter(Notebooks.id == id, Notebooks.user_id == user.id).first()
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    return notebook

@router.get("/{id}/notes")
async def get_notebook_notes_by_id(user: user_dependency, id: int, db: db_dependency):
    notebook = db.query(Notebooks).filter(Notebooks.id == id, Notebooks.user_id == user.id).first()
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
async def create_notebook(user: user_dependency, notebook: NotebookSchema, db: db_dependency):
    new_notebook = Notebooks(
        title = notebook.title, 
        description = notebook.description,
        parent_id = notebook.parent_id,
        type = notebook.type,
        user_id = user.id
    )
    
    db.add(new_notebook)
    db.commit()
    db.refresh(new_notebook)
    return new_notebook

@router.put("/{id}")
async def edit_notebook(user: user_dependency, id: int, notebook: NotebookSchema, db: db_dependency):
    existing_notebook = db.query(Notebooks).filter(Notebooks.id == id, Notebooks.user_id == user.id).first()
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
async def delete_notebook(user: user_dependency, id: int, db: db_dependency):
    notebook = db.query(Notebooks).filter(Notebooks.id == id, Notebooks.user_id == user.id).first()
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    db.delete(notebook)
    db.commit()
    
    return {"ok" : True}
    
@router.get("/{id}/notebooks")
async def get_notebook_children(user: user_dependency, id: int, db: db_dependency):
    notebook = db.query(Notebooks).filter(Notebooks.id == id, Notebooks.user_id == user.id).first()
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    return [child for child in notebook.children if child.type == 'notebook']
