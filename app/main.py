from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import Base, get_db, SessionLocal, engine
from app.models.notes import Notes
from app.models.notebooks import Notebooks
from app.models.notes_notebooks import NoteNotebook
from app.routers import notes
from app.routers import notebooks

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notes.router)
app.include_router(notebooks.router)