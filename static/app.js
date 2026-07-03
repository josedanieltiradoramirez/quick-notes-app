const textareaNoteBody = document.querySelector('#textarea-note-body')
const textareaNoteTitle = document.querySelector('#textarea-note-title')
const buttonAddNote = document.querySelector('#button-add-note')
const container = document.querySelector('#notes-container')

async function loadNotes(){
  const response = await fetch(`/api/notes`)
  const notes = await response.json()

  container.innerHTML = ''
  notes.forEach(note => renderNote(note))
}

buttonAddNote.addEventListener('click',async function() {  
    const noteContent = textareaNoteBody.value.trim()
    const noteTitle = textareaNoteTitle.value.trim()
    if (noteContent === '' || noteTitle === '') return

    const response = await fetch(`/api/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({title: noteTitle, content: noteContent })
    })

    const note = await response.json()
        
    renderNote(note)
    textareaNoteTitle.value = ''
    textareaNoteBody.value = ''
}
)

function renderNote(note) {
  const div = document.createElement('div')
  const title = document.createElement('p')
  const p = document.createElement('p')
  title.textContent = note.title
  p.textContent = note.content

  const actions = document.createElement('div')
  actions.classList.add('note-actions')

  const buttonEditNote = document.createElement('button')
  buttonEditNote.textContent = 'Edit'
  buttonEditNote.addEventListener('click', async function(){
    const newTitle = prompt('Edit your note title:', note.title)
    const newText = prompt('Edit your note:', note.content)
    if (newText && newText.trim() !== '' && newTitle && newTitle.trim() !== '') {
      editNote(note.id, newText.trim(), p, newTitle.trim(), title)
    }
  })

  const buttonDeleteNote = document.createElement('button')
  buttonDeleteNote.textContent = 'Delete'
  buttonDeleteNote.addEventListener('click', function(evento) {
    evento.stopPropagation()
    deleteNote(note.id, div)
  })

  actions.appendChild(buttonEditNote)
  actions.appendChild(buttonDeleteNote)
  div.appendChild(title)
  div.appendChild(p)
  div.appendChild(actions)
  container.appendChild(div)
}

async function deleteNote(id, element) {
    await fetch(`/api/notes/${id}`, {method: 'DELETE'})
    element.remove()
}

async function editNote(id, newContent, elementP, newTitle, elementTitle) {
    const response = await fetch(`/api/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({title: newTitle, content: newContent })
    })
    elementP.textContent = newContent
    elementTitle.textContent = newTitle
}

loadNotes()
