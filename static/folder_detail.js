const API = 'http://127.0.0.1:8000'

const container = document.querySelector('#notes-container')
const subFoldersContainer = document.querySelector('#sub-folders-container')
const folderTitle = document.querySelector('#folder-title')
const backButton = document.querySelector('#back-button')

const buttonNewNote = document.querySelector('#button-new-note')
const buttonSaveNote = document.querySelector('#button-save-note')
const buttonCancelNote = document.querySelector('#button-cancel-note')
const noteForm = document.querySelector('#new-note-form')
const inputNoteTitle = document.querySelector('#input-note-title')
const inputNoteBody = document.querySelector('#input-note-body')

const buttonNewFolder = document.querySelector('#button-new-folder')
const buttonSaveFolder = document.querySelector('#button-save-folder')
const buttonCancelFolder = document.querySelector('#button-cancel-folder')
const folderForm = document.querySelector('#new-folder-form')
const inputFolderTitle = document.querySelector('#input-folder-title')
const inputFolderDescription = document.querySelector('#input-folder-description')

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
    noteForm.classList.remove('hidden')
})

buttonCancelNote.addEventListener('click', function() {
    noteForm.classList.add('hidden')
    inputNoteTitle.value = ''
    inputNoteBody.value = ''
})

buttonNewFolder.addEventListener('click', function() {
    folderForm.classList.remove('hidden')
})

buttonCancelFolder.addEventListener('click', function() {
    folderForm.classList.add('hidden')
    inputFolderTitle.value = ''
    inputFolderDescription.value = ''
})

async function loadFolder() {
    const response = await fetch(`${API}/api/folders/${FOLDER_ID}`)
    const folder = await response.json()
    folderTitle.textContent = `📁 ${folder.title}`

    if (folder.parent_id) {
        // verificar si el padre es notebook o folder
        const parentResponse = await fetch(`${API}/api/notebooks/${folder.parent_id}`)
        const parent = await parentResponse.json()
        
        if (parent.type === 'folder') {
            backButton.href = `/folders/${folder.parent_id}`
        } else {
            backButton.href = `/notebooks/${folder.parent_id}`
        }
    } else {
        backButton.href = '/folders'
    }
}

async function loadSubFolders() {
    const response = await fetch(`${API}/api/folders/${FOLDER_ID}/folders`)
    const folders = await response.json()
    subFoldersContainer.innerHTML = ''
    folders.forEach(folder => renderSubFolder(folder))
}

async function loadNotes() {
    const response = await fetch(`${API}/api/folders/${FOLDER_ID}/notes`)
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

buttonSaveFolder.addEventListener('click', async function() {
    const title = inputFolderTitle.value.trim()
    const description = inputFolderDescription.value.trim()
    if (title === '') return

    const response = await fetch(`${API}/api/folders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, parent_id: FOLDER_ID })
    })
    const folder = await response.json()
    renderSubFolder(folder)
    inputFolderTitle.value = ''
    inputFolderDescription.value = ''
    folderForm.classList.add('hidden')
})

buttonSaveNote.addEventListener('click', async function() {
    const title = inputNoteTitle.value.trim()
    const content = inputNoteBody.value.trim()
    if (title === '' || content === '') return

    const response = await fetch(`${API}/api/notes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, notebook_ids: [FOLDER_ID] })
    })
    const note = await response.json()
    const tbody = document.querySelector('#notes-tbody')
    renderNote(note, tbody)
    inputNoteTitle.value = ''
    inputNoteBody.value = ''
    noteForm.classList.add('hidden')
})

function renderSubFolder(folder) {
    const div = document.createElement('div')

    const title = document.createElement('p')
    title.textContent = `📁 ${folder.title}`

    const description = document.createElement('p')
    description.textContent = folder.description || ''

    const actions = document.createElement('div')
    actions.classList.add('note-actions')

    const buttonDelete = document.createElement('button')
    buttonDelete.textContent = 'Delete'
    buttonDelete.addEventListener('click', function(e) {
        e.stopPropagation()
        deleteSubFolder(folder.id, div)
    })

    div.addEventListener('click', function() {
        window.location.href = `/folders/${folder.id}`
    })

    actions.appendChild(buttonDelete)
    div.appendChild(title)
    div.appendChild(description)
    div.appendChild(actions)
    subFoldersContainer.appendChild(div)
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

async function deleteSubFolder(id, element) {
    await fetch(`${API}/api/folders/${id}`, { method: 'DELETE' })
    element.remove()
}

async function deleteNote(id, element) {
    await fetch(`${API}/api/notes/${id}`, { method: 'DELETE' })
    element.remove()
}

loadFolder()
loadSubFolders()
loadNotes()