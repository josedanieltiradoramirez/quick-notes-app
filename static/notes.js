const API = 'http://127.0.0.1:8000'

const buttonNewNote = document.querySelector('#button-new-note')
const buttonSaveNote = document.querySelector('#button-save-note')
const buttonCancelNote = document.querySelector('#button-cancel-note')
const form = document.querySelector('#new-note-form')
const inputTitle = document.querySelector('#input-note-title')
const inputBody = document.querySelector('#input-note-body')
const container = document.querySelector('#notes-container')

buttonNewNote.addEventListener('click', function() {
    form.classList.remove('hidden')
})

buttonCancelNote.addEventListener('click', function() {
    form.classList.add('hidden')
    inputTitle.value = ''
    inputBody.value = ''
})

async function loadNotes() {
    const response = await fetch(`${API}/api/notes/`)
    const notes = await response.json()
    container.innerHTML = ''
    notes.forEach(note => renderNote(note))
}

buttonSaveNote.addEventListener('click', async function() {
    const title = inputTitle.value.trim()
    const content = inputBody.value.trim()
    if (title === '' || content === '') return

    const response = await fetch(`${API}/api/notes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
    })
    const note = await response.json()
    renderNote(note)
    inputTitle.value = ''
    inputBody.value = ''
    form.classList.add('hidden')
})

function renderNote(note) {
    const div = document.createElement('div')

    const title = document.createElement('p')
    title.textContent = note.title

    const p = document.createElement('p')
    p.textContent = note.content

    const actions = document.createElement('div')
    actions.classList.add('note-actions')

    const buttonEdit = document.createElement('button')
    buttonEdit.textContent = 'Edit'
    buttonEdit.addEventListener('click', function() {
        // convertir texto en inputs
        const inputTitle = document.createElement('input')
        inputTitle.value = note.title

        const inputContent = document.createElement('textarea')
        inputContent.value = note.content
        inputContent.rows = 3

        const buttonSave = document.createElement('button')
        buttonSave.textContent = 'Save'
        buttonSave.addEventListener('click', async function() {
            const newTitle = inputTitle.value.trim()
            const newContent = inputContent.value.trim()
            if (newTitle === '' || newContent === '') return

            await editNote(note.id, newTitle, newContent, title, p)

            // volver a texto normal
            div.replaceChild(title, inputTitle)
            div.replaceChild(p, inputContent)
            actions.replaceChild(buttonEdit, buttonSave)
        })

        // reemplazar texto con inputs
        div.replaceChild(inputTitle, title)
        div.replaceChild(inputContent, p)
        actions.replaceChild(buttonSave, buttonEdit)
    })

    const buttonDelete = document.createElement('button')
    buttonDelete.textContent = 'Delete'
    buttonDelete.addEventListener('click', function(e) {
        e.stopPropagation()
        deleteNote(note.id, div)
    })

    actions.appendChild(buttonEdit)
    actions.appendChild(buttonDelete)
    div.appendChild(title)
    div.appendChild(p)
    div.appendChild(actions)
    container.appendChild(div)
}

async function deleteNote(id, element) {
    await fetch(`${API}/api/notes/${id}`, { method: 'DELETE' })
    element.remove()
}

async function editNote(id, newTitle, newContent, elementTitle, elementP) {
    await fetch(`${API}/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content: newContent })
    })
    elementTitle.textContent = newTitle
    elementP.textContent = newContent
}

loadNotes()