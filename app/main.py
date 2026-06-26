from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import Base, get_db, SessionLocal, engine
from app.models.notes import Notes
from app.models.notebooks import Notebooks
from app.models.notes_notebooks import NoteNotebook
from app.models.bibliographies import Bibliographies
from app.models.notes_bibliographies import NoteBibliography
from app.routers import notes
from app.routers import notebooks
from app.routers import bibliography
from app.routers import folders
from app.routers import auth
from app.routers import users
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# archivos estáticos (CSS, JS)
app.mount("/static", StaticFiles(directory="static"), name="static")

# templates
templates = Jinja2Templates(directory="templates")

app.include_router(notes.router, prefix="/api")
app.include_router(notebooks.router, prefix="/api")
app.include_router(bibliography.router, prefix="/api")
app.include_router(folders.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")


@app.get("/")
async def index(request: Request):
    return RedirectResponse(url="/notebooks")

@app.get("/notebooks")
async def notebooks_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="notebooks.html",
        context={"active": "notebooks"}
    )

@app.get("/notes")
async def notes_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="notes.html",
        context={"active": "notes"}
    )

@app.get("/bibliographies")
async def bibliographies_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="bibliographies.html",
        context={"active": "bibliographies"}
    )

@app.get("/notebooks/{id}")
async def notebook_detail_page(id: int, request: Request):
    return templates.TemplateResponse(
        request=request,
        name="notebook_detail.html",
        context={"active": "notebooks", "notebook_id": id}
    )

@app.get("/bibliographies/{id}")
async def bibliography_detail_page(id: int, request: Request):
    return templates.TemplateResponse(
        request=request,
        name="bibliography_detail.html",
        context={"active": "bibliographies", "bibliography_id": id}
    )

@app.get("/folders")
async def folders_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="folders.html",
        context={"active": "folders"}
    )

@app.get("/folders/{id}")
async def folder_detail_page(id: int, request: Request):
    return templates.TemplateResponse(
        request=request,
        name="folder_detail.html",
        context={"active": "folders", "folder_id": id}
    )