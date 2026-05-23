from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import Base, get_db, SessionLocal, engine
from app.models.notes import Notes

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class NoteSchema(BaseModel):
    title: str
    content: str

@app.get("/notes")
async def get_all_notes(db: Session = Depends(get_db)):
    return db.query(Notes).all()

@app.post("/notes")
async def create_note(note: NoteSchema, db: Session = Depends(get_db)):
    new_note = Notes(title = note.title, content = note.content)
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note

@app.put("/notes/{id}")
async def edit_note(id: int, note: NoteSchema, db: Session = Depends(get_db)):
    existing_note = db.query(Notes).filter(Notes.id == id).first()
    if not existing_note:
        raise HTTPException(status_code=404, detail="Note not found")
    existing_note.title = note.title
    existing_note.content = note.content
    db.commit()
    db.refresh(existing_note)
    return existing_note
    


@app.delete("/notes/{id}")
async def delete_note(id: int, db: Session = Depends(get_db)):
    note = db.query(Notes).filter(Notes.id == id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    
    return {"ok" : True}
    
