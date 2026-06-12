const API = 'http://127.0.0.1:8000'

const buttonNewNote = document.querySelector('#button-new-note')
const buttonSaveNote = document.querySelector('#button-save-note')
const buttonCancelNote = document.querySelector('#button-cancel-note')
const form = document.querySelector('#new-note-form')
const inputTitle = document.querySelector('#input-note-title')
const inputBody = document.querySelector('#input-note-body')
const container = document.querySelector('#notes-container')
const searchInput = document.querySelector('#search-input')

// tag system
let selectedNotebooks = []
let selectedFolders = []
let allNotebooks = []
let allFolders = []
let selectedBibliographies = []
let allBibliographies = []

const notebookSearch = document.querySelector('#input-notebook-search')
const notebookDropdown = document.querySelector('#notebook-dropdown')
const notebookTagsContainer = document.querySelector('#notebook-tags-container')

const folderSearch = document.querySelector('#input-folder-search')
const folderDropdown = document.querySelector('#folder-dropdown')
const folderTagsContainer = document.querySelector('#folder-tags-container')

const bibliographySearch = document.querySelector('#input-bibliography-search')
const bibliographyDropdown = document.querySelector('#bibliography-dropdown')
const bibliographyTagsContainer = document.querySelector('#bibliography-tags-container')

async function loadAllNotebooks() {
    const response = await fetch(`${API}/api/notebooks/`)
    allNotebooks = await response.json()
}

async function loadAllFolders() {
    const response = await fetch(`${API}/api/folders/`)
    allFolders = await response.json()
}


async function loadAllBibliographies() {
    const response = await fetch(`${API}/api/bibliographies/`)
    allBibliographies = await response.json()
}



// notebook search
notebookSearch.addEventListener('input', function() {
    const query = notebookSearch.value.toLowerCase()
    if (query === '') {
        notebookDropdown.classList.add('hidden')
        return
    }
    const matches = allNotebooks.filter(n =>
        n.title.toLowerCase().includes(query) &&
        !selectedNotebooks.find(s => s.id === n.id)
    )
    renderDropdown(notebookDropdown, matches, addNotebookTag)
})

notebookSearch.addEventListener('blur', function() {
    setTimeout(() => notebookDropdown.classList.add('hidden'), 150)
})

// folder search
folderSearch.addEventListener('input', function() {
    const query = folderSearch.value.toLowerCase()
    if (query === '') {
        folderDropdown.classList.add('hidden')
        return
    }
    const matches = allFolders.filter(f =>
        f.title.toLowerCase().includes(query) &&
        !selectedFolders.find(s => s.id === f.id)
    )
    renderDropdown(folderDropdown, matches, addFolderTag)
})

folderSearch.addEventListener('blur', function() {
    setTimeout(() => folderDropdown.classList.add('hidden'), 150)
})

// bibliography search
bibliographySearch.addEventListener('input', function() {
    const query = bibliographySearch.value.toLowerCase()
    if (query === '') {
        bibliographyDropdown.classList.add('hidden')
        return
    }
    const matches = allBibliographies.filter(b =>
        b.title.toLowerCase().includes(query) &&
        !selectedBibliographies.find(s => s.id === b.id)
    )
    renderDropdown(bibliographyDropdown, matches, addBibliographyTag)
})

bibliographySearch.addEventListener('blur', function() {
    setTimeout(() => bibliographyDropdown.classList.add('hidden'), 150)
})

function addBibliographyTag(bibliography) {
    selectedBibliographies.push(bibliography)
    renderTag(bibliographyTagsContainer, bibliographySearch, bibliography, function() {
        selectedBibliographies = selectedBibliographies.filter(b => b.id !== bibliography.id)
    })
    bibliographySearch.value = ''
}

function renderDropdown(dropdown, items, onSelect) {
    dropdown.innerHTML = ''
    if (items.length === 0) {
        dropdown.classList.add('hidden')
        return
    }
    items.forEach(item => {
        const div = document.createElement('div')
        div.classList.add('tag-dropdown-item')
        div.textContent = item.title
        div.addEventListener('click', function() {
            onSelect(item)
            dropdown.classList.add('hidden')
        })
        dropdown.appendChild(div)
    })
    dropdown.classList.remove('hidden')
}

function addNotebookTag(notebook) {
    selectedNotebooks.push(notebook)
    renderTag(notebookTagsContainer, notebookSearch, notebook, function() {
        selectedNotebooks = selectedNotebooks.filter(n => n.id !== notebook.id)
    })
    notebookSearch.value = ''
}

function addFolderTag(folder) {
    selectedFolders.push(folder)
    renderTag(folderTagsContainer, folderSearch, folder, function() {
        selectedFolders = selectedFolders.filter(f => f.id !== folder.id)
    })
    folderSearch.value = ''
}

function renderTag(container, input, item, onRemove) {
    const tag = document.createElement('div')
    tag.classList.add('tag')
    tag.dataset.id = item.id

    const label = document.createElement('span')
    label.textContent = item.title

    const removeBtn = document.createElement('button')
    removeBtn.textContent = '×'
    removeBtn.addEventListener('click', function() {
        tag.remove()
        onRemove()
    })

    tag.appendChild(label)
    tag.appendChild(removeBtn)
    container.insertBefore(tag, input)
}

function clearTags() {
    selectedNotebooks = []
    selectedFolders = []
    selectedBibliographies = []
    notebookTagsContainer.querySelectorAll('.tag').forEach(t => t.remove())
    folderTagsContainer.querySelectorAll('.tag').forEach(t => t.remove())
    bibliographyTagsContainer.querySelectorAll('.tag').forEach(t => t.remove())
    notebookSearch.value = ''
    folderSearch.value = ''
    bibliographySearch.value = ''
}

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

async function loadNotes() {
    const response = await fetch(`${API}/api/notes/`)
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

    const notebookIds = selectedNotebooks.map(n => n.id)
    const folderIds = selectedFolders.map(f => f.id)

    const response = await fetch(`${API}/api/notes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title,
            content,
            notebook_ids: selectedNotebooks.map(n => n.id),
            bibliography_ids: selectedBibliographies.map(b => b.id),
            folder_ids: selectedFolders.map(f => f.id)
        })
    })
    const note = await response.json()
    const tbody = document.querySelector('#notes-tbody')
    renderNote(note, tbody)
    inputTitle.value = ''
    inputBody.value = ''
    clearTags()
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
loadAllNotebooks()
loadAllFolders()
loadAllBibliographies()