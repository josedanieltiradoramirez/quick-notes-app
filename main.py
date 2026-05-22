from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
notes = {}
counter = 0

class Note(BaseModel):
    title: str
    content: str

@app.get("/notes")
async def get_all_notes():
    return list(notes.values())

@app.post("/notes")
async def create_note(note: Note):
    global counter
    counter += 1
    id = str(counter)
    notes[id] = {"id": id, "title": note.title, "content": note.content}
    return notes[id]

@app.put("/notes/{id}")
async def edit_note(id: str, note: Note):
    if id in notes:
        notes[id]["title"] = note.title
        notes[id]["content"] = note.content
        return notes[id]
    


@app.delete("/notes/{id}")
async def delete_note(id: str):
    if id in notes:
        notes.pop(id)
        return {"ok": True}
    