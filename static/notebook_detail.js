const API = 'http://127.0.0.1:8000'

const container = document.querySelector('#notes-container')
const subNotebooksContainer = document.querySelector('#sub-notebooks-container')
const notebookTitle = document.querySelector('#notebook-title')
const backButton = document.querySelector('.back-button')


// notas
const buttonNewNote = document.querySelector('#button-new-note')
const buttonSaveNote = document.querySelector('#button-save-note')
const buttonCancelNote = document.querySelector('#button-cancel-note')
const noteForm = document.querySelector('#new-note-form')
const inputNoteTitle = document.querySelector('#input-note-title')
const inputNoteBody = document.querySelector('#input-note-body')

// sub-notebooks
const buttonNewNotebook = document.querySelector('#button-new-notebook')
const buttonSaveNotebook = document.querySelector('#button-save-notebook')
const buttonCancelNotebook = document.querySelector('#button-cancel-notebook')
const notebookForm = document.querySelector('#new-notebook-form')
const inputNotebookTitle = document.querySelector('#input-notebook-title')
const inputNotebookDescription = document.querySelector('#input-notebook-description')
const selectNotebookType = document.querySelector('#select-notebook-type')

const searchInput = document.querySelector('#search-input')

searchInput.addEventListener('input', function() {
    const query = searchInput.value.toLowerCase()
    const rows = container.querySelectorAll('tbody tr')
    rows.forEach(row => {
        const text = row.textContent.toLowerCase()
        row.style.display = text.includes(query) ? '' : 'none'
    })
})

// notas
buttonNewNote.addEventListener('click', function() {
    noteForm.classList.remove('hidden')
})

buttonCancelNote.addEventListener('click', function() {
    noteForm.classList.add('hidden')
    inputNoteTitle.value = ''
    inputNoteBody.value = ''
})

// sub-notebooks
buttonNewNotebook.addEventListener('click', function() {
    notebookForm.classList.remove('hidden')
})

buttonCancelNotebook.addEventListener('click', function() {
    notebookForm.classList.add('hidden')
    inputNotebookTitle.value = ''
    inputNotebookDescription.value = ''
})

async function loadNotebook() {
    const response = await fetch(`${API}/api/notebooks/${NOTEBOOK_ID}`)
    const notebook = await response.json()
    notebookTitle.textContent = notebook.title

    // actualizar back button
    if (notebook.parent_id) {
        backButton.href = `/notebooks/${notebook.parent_id}`
    } else {
        backButton.href = '/notebooks'
    }
}

async function loadSubNotebooks() {
    const response = await fetch(`${API}/api/notebooks/${NOTEBOOK_ID}/notebooks`)
    const notebooks = await response.json()
    subNotebooksContainer.innerHTML = ''
    notebooks.forEach(notebook => renderSubNotebook(notebook))
}

async function loadNotes() {
    const response = await fetch(`${API}/api/notebooks/${NOTEBOOK_ID}/notes`)  // ← correcto
    const notes = await response.json()

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Content</th>
                    <th></th>
                </tr>
            </thead>
            <tbody id="notes-tbody"></tbody>
        </table>
    `
    const tbody = document.querySelector('#notes-tbody')
    notes.forEach(note => renderNote(note, tbody))
}

buttonSaveNotebook.addEventListener('click', async function() {
    const title = inputNotebookTitle.value.trim()
    const description = inputNotebookDescription.value.trim()
    if (title === '') return

    const response = await fetch(`${API}/api/notebooks/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, parent_id: NOTEBOOK_ID, type: selectNotebookType.value })
        
    })
    const notebook = await response.json()
    renderSubNotebook(notebook)
    inputNotebookTitle.value = ''
    inputNotebookDescription.value = ''
    notebookForm.classList.add('hidden')
})

buttonSaveNote.addEventListener('click', async function() {
    const title = inputNoteTitle.value.trim()
    const content = inputNoteBody.value.trim()
    if (title === '' || content === '') return

    const response = await fetch(`${API}/api/notes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, notebook_ids: [NOTEBOOK_ID] })
    })
    const note = await response.json()
    const tbody = document.querySelector('#notes-tbody')
    renderNote(note, tbody)
    inputNoteTitle.value = ''
    inputNoteBody.value = ''
    noteForm.classList.add('hidden')
})

function renderSubNotebook(notebook) {
    const div = document.createElement('div')

    const title = document.createElement('p')
    const icon = notebook.type === 'folder' ? '📁' : '📓'
    title.textContent = `${icon} ${notebook.title}`


    const description = document.createElement('p')
    description.textContent = notebook.description || ''

    const actions = document.createElement('div')
    actions.classList.add('note-actions')

    const buttonDelete = document.createElement('button')
    buttonDelete.textContent = 'Delete'
    buttonDelete.addEventListener('click', function(e) {
        e.stopPropagation()
        deleteSubNotebook(notebook.id, div)
    })

    div.addEventListener('click', function() {
        window.location.href = `/notebooks/${notebook.id}`
    })

    actions.appendChild(buttonDelete)
    div.appendChild(title)
    div.appendChild(description)
    div.appendChild(actions)
    subNotebooksContainer.appendChild(div)
}

function renderNote(note, tbody) {
    const tr = document.createElement('tr')

    const tdTitle = document.createElement('td')
    tdTitle.textContent = note.title

    const tdContent = document.createElement('td')
    tdContent.textContent = note.content

    const tdActions = document.createElement('td')

    const actions = document.createElement('div')
    actions.classList.add('note-actions')

    const buttonEdit = document.createElement('button')
    buttonEdit.textContent = 'Edit'
    buttonEdit.addEventListener('click', function(e) {
        e.stopPropagation()

        const inputTitle = document.createElement('input')
        inputTitle.value = note.title

        const inputContent = document.createElement('textarea')
        inputContent.value = note.content
        inputContent.rows = 2

        const buttonSave = document.createElement('button')
        buttonSave.textContent = 'Save'
        buttonSave.addEventListener('click', async function(e) {
            e.stopPropagation()
            const newTitle = inputTitle.value.trim()
            const newContent = inputContent.value.trim()
            if (newTitle === '' || newContent === '') return

            await fetch(`${API}/api/notes/${note.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle, content: newContent })
            })

            note.title = newTitle
            note.content = newContent
            tdTitle.textContent = newTitle
            tdContent.textContent = newContent

            tdTitle.replaceChild(document.createTextNode(newTitle), tdTitle.firstChild)
            actions.replaceChild(buttonEdit, buttonSave)
        })

        tdTitle.innerHTML = ''
        tdTitle.appendChild(inputTitle)
        tdContent.innerHTML = ''
        tdContent.appendChild(inputContent)
        actions.replaceChild(buttonSave, buttonEdit)
    })

    const buttonDelete = document.createElement('button')
    buttonDelete.textContent = 'Delete'
    buttonDelete.addEventListener('click', function(e) {
        e.stopPropagation()
        deleteNote(note.id, tr)
    })

    actions.appendChild(buttonEdit)
    actions.appendChild(buttonDelete)
    tdActions.appendChild(actions)
    tr.appendChild(tdTitle)
    tr.appendChild(tdContent)
    tr.appendChild(tdActions)
    tbody.appendChild(tr)
}

async function deleteSubNotebook(id, element) {
    await fetch(`${API}/api/notebooks/${id}`, { method: 'DELETE' })
    element.remove()
}

async function deleteNote(id, element) {
    await fetch(`${API}/api/notes/${id}`, { method: 'DELETE' })
    element.remove()
}

loadNotebook()
loadSubNotebooks()
loadNotes()