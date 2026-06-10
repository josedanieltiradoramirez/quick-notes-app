const API = 'http://127.0.0.1:8000'

const buttonNewNote = document.querySelector('#button-new-note')
const buttonSaveNote = document.querySelector('#button-save-note')
const buttonCancelNote = document.querySelector('#button-cancel-note')
const form = document.querySelector('#new-note-form')
const inputTitle = document.querySelector('#input-note-title')
const inputBody = document.querySelector('#input-note-body')
const container = document.querySelector('#notes-container')
const bibliographyTitle = document.querySelector('#bibliography-title')
const searchInput = document.querySelector('#search-input')

searchInput.addEventListener('input', function() {
    const query = searchInput.value.toLowerCase()
    const rows = container.querySelectorAll('tbody tr')
    rows.forEach(row => {
        const text = row.textContent.toLowerCase()
        row.style.display = text.includes(query) ? '' : 'none'
    })
})

buttonNewNote.addEventListener('click', function() {
    form.classList.remove('hidden')
})

buttonCancelNote.addEventListener('click', function() {
    form.classList.add('hidden')
    inputTitle.value = ''
    inputBody.value = ''
})

async function loadBibliography() {
    const response = await fetch(`${API}/api/bibliographies/${BIBLIOGRAPHY_ID}`)
    const bibliography = await response.json()
    bibliographyTitle.textContent = bibliography.title
}

async function loadNotes() {
    const response = await fetch(`${API}/api/bibliographies/${BIBLIOGRAPHY_ID}/notes`)  // ← correcto
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

buttonSaveNote.addEventListener('click', async function() {
    const title = inputTitle.value.trim()
    const content = inputBody.value.trim()
    if (title === '' || content === '') return

    const response = await fetch(`${API}/api/notes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, bibliography_ids: [BIBLIOGRAPHY_ID] })
    })
    const note = await response.json()
    const tbody = document.querySelector('#notes-tbody')
    renderNote(note, tbody)
    inputTitle.value = ''
    inputBody.value = ''
    form.classList.add('hidden')
})

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

async function deleteNote(id, element) {
    await fetch(`${API}/api/notes/${id}`, { method: 'DELETE' })
    element.remove()
}

loadBibliography()
loadNotes()