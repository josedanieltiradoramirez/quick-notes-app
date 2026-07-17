

const container = document.querySelector('#notes-container')
const subFoldersContainer = document.querySelector('#sub-folders-container')
const folderTitle = document.querySelector('#folder-title')
const backButton = document.querySelector('.back-button')
const searchInput = document.querySelector('#search-input')

// sub-folders
const buttonNewFolder = document.querySelector('#button-new-folder')
const buttonSaveFolder = document.querySelector('#button-save-folder')
const buttonCancelFolder = document.querySelector('#button-cancel-folder')
const folderForm = document.querySelector('#new-folder-form')
const inputFolderTitle = document.querySelector('#input-folder-title')
const inputFolderDescription = document.querySelector('#input-folder-description')

// note modal
const buttonNewNote = document.querySelector('#button-new-note')
const buttonSaveNote = document.querySelector('#button-save-note')
const buttonCancelNote = document.querySelector('#button-cancel-note')
const buttonCloseModal = document.querySelector('#button-close-modal')
const modal = document.querySelector('#note-modal')
const inputTitle = document.querySelector('#input-note-title')
const inputBody = document.querySelector('#input-note-body')

// edit note modal
const editModal = document.querySelector('#edit-note-modal')
const buttonCloseEditModal = document.querySelector('#button-close-edit-modal')
const buttonCancelEditNote = document.querySelector('#button-cancel-edit-note')
const buttonSaveEditNote = document.querySelector('#button-save-edit-note')
const inputEditTitle = document.querySelector('#input-edit-note-title')
const inputEditBody = document.querySelector('#input-edit-note-body')
const inputEditNoteType = document.querySelector('#input-edit-note-type')

let currentEditNote = null

// tag system - create modal
let selectedNotebooks = []
let selectedFolders = []
let selectedBibliographies = []
let allNotebooks = []
let allFolders = []
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

// tag system - edit modal
let editSelectedNotebooks = []
let editSelectedFolders = []
let editSelectedBibliographies = []

const editNotebookSearch = document.querySelector('#input-edit-notebook-search')
const editNotebookDropdown = document.querySelector('#edit-notebook-dropdown')
const editNotebookTagsContainer = document.querySelector('#edit-notebook-tags-container')

const editFolderSearch = document.querySelector('#input-edit-folder-search')
const editFolderDropdown = document.querySelector('#edit-folder-dropdown')
const editFolderTagsContainer = document.querySelector('#edit-folder-tags-container')

const editBibliographySearch = document.querySelector('#input-edit-bibliography-search')
const editBibliographyDropdown = document.querySelector('#edit-bibliography-dropdown')
const editBibliographyTagsContainer = document.querySelector('#edit-bibliography-tags-container')

// filters
let activeNotebookFilters = []
let activeFolderFilters = []
let activeBibliographyFilters = []

const filterNotebookSearch = document.querySelector('#input-filter-notebook-search')
const filterNotebookDropdown = document.querySelector('#filter-notebook-dropdown')
const filterNotebookTagsContainer = document.querySelector('#filter-notebook-tags-container')

const filterFolderSearch = document.querySelector('#input-filter-folder-search')
const filterFolderDropdown = document.querySelector('#filter-folder-dropdown')
const filterFolderTagsContainer = document.querySelector('#filter-folder-tags-container')

const filterBibliographySearch = document.querySelector('#input-filter-bibliography-search')
const filterBibliographyDropdown = document.querySelector('#filter-bibliography-dropdown')
const filterBibliographyTagsContainer = document.querySelector('#filter-bibliography-tags-container')

async function loadAllNotebooks() {
    const response = await fetch(`/api/notebooks/`)
    allNotebooks = await response.json()
}

async function loadAllFolders() {
    const response = await fetch(`/api/folders/`)
    allFolders = await response.json()
}

async function loadAllBibliographies() {
    const response = await fetch(`/api/bibliographies/`)
    allBibliographies = await response.json()
}

// ===== sub-folders listeners =====
buttonNewFolder.addEventListener('click', function() {
    folderForm.classList.remove('hidden')
})
buttonCancelFolder.addEventListener('click', function() {
    folderForm.classList.add('hidden')
    inputFolderTitle.value = ''
    inputFolderDescription.value = ''
})

async function loadFolder() {
    const response = await fetch(`/api/folders/${FOLDER_ID}`)
    const folder = await response.json()
    folderTitle.textContent = `📁 ${folder.title}`

    if (folder.parent_id) {
        const parentResponse = await fetch(`/api/notebooks/${folder.parent_id}`)
        const parent = await parentResponse.json()
        if (parent.type === 'folder') {
            backButton.href = `/folders/${folder.parent_id}`
        } else {
            backButton.href = `/notebooks/${folder.parent_id}`
        }
    } else {
        backButton.href = '/folders'
    }

    // pre-cargar el filtro de la carpeta actual
    addFolderFilter({ id: folder.id, title: folder.title })
}

async function loadSubFolders() {
    const response = await fetch(`/api/folders/${FOLDER_ID}/folders`)
    const folders = await response.json()
    subFoldersContainer.innerHTML = ''
    folders.forEach(folder => renderSubFolder(folder))
}

buttonSaveFolder.addEventListener('click', async function() {
    const title = inputFolderTitle.value.trim()
    const description = inputFolderDescription.value.trim()
    if (title === '') return

    const response = await fetch(`/api/folders/`, {
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

async function deleteSubFolder(id, element) {
    await fetch(`/api/folders/${id}`, { method: 'DELETE' })
    element.remove()
}

// ===== note modal =====
function openModal() {
    modal.classList.remove('hidden')

    activeNotebookFilters.forEach(notebook => {
        if (!selectedNotebooks.find(n => n.id === notebook.id)) addNotebookTag(notebook)
    })
    activeFolderFilters.forEach(folder => {
        if (!selectedFolders.find(f => f.id === folder.id)) addFolderTag(folder)
    })
    activeBibliographyFilters.forEach(bibliography => {
        if (!selectedBibliographies.find(b => b.id === bibliography.id)) addBibliographyTag(bibliography)
    })
}

function closeModal() {
    modal.classList.add('hidden')
    inputTitle.value = ''
    inputBody.value = ''
    inputNoteType.value = 'note'
    clearTags()
}

buttonNewNote.addEventListener('click', openModal)
buttonCancelNote.addEventListener('click', closeModal)
buttonCloseModal.addEventListener('click', closeModal)
modal.addEventListener('click', function(e) { if (e.target === modal) closeModal() })

notebookSearch.addEventListener('input', function() {
    const query = notebookSearch.value.toLowerCase()
    if (query === '') { notebookDropdown.classList.add('hidden'); return }
    const matches = allNotebooks.filter(n => n.title.toLowerCase().includes(query) && !selectedNotebooks.find(s => s.id === n.id))
    renderDropdown(notebookDropdown, matches, addNotebookTag)
})
notebookSearch.addEventListener('blur', function() { setTimeout(() => notebookDropdown.classList.add('hidden'), 150) })

folderSearch.addEventListener('input', function() {
    const query = folderSearch.value.toLowerCase()
    if (query === '') { folderDropdown.classList.add('hidden'); return }
    const matches = allFolders.filter(f => f.title.toLowerCase().includes(query) && !selectedFolders.find(s => s.id === f.id))
    renderDropdown(folderDropdown, matches, addFolderTag)
})
folderSearch.addEventListener('blur', function() { setTimeout(() => folderDropdown.classList.add('hidden'), 150) })

bibliographySearch.addEventListener('input', function() {
    const query = bibliographySearch.value.toLowerCase()
    if (query === '') { bibliographyDropdown.classList.add('hidden'); return }
    const matches = allBibliographies.filter(b => b.title.toLowerCase().includes(query) && !selectedBibliographies.find(s => s.id === b.id))
    renderDropdown(bibliographyDropdown, matches, addBibliographyTag)
})
bibliographySearch.addEventListener('blur', function() { setTimeout(() => bibliographyDropdown.classList.add('hidden'), 150) })

function renderDropdown(dropdown, items, onSelect) {
    dropdown.innerHTML = ''
    if (items.length === 0) { dropdown.classList.add('hidden'); return }
    items.forEach(item => {
        const div = document.createElement('div')
        div.classList.add('tag-dropdown-item')
        div.textContent = item.title
        div.addEventListener('click', function() { onSelect(item); dropdown.classList.add('hidden') })
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

function addBibliographyTag(bibliography) {
    selectedBibliographies.push(bibliography)
    renderTag(bibliographyTagsContainer, bibliographySearch, bibliography, function() {
        selectedBibliographies = selectedBibliographies.filter(b => b.id !== bibliography.id)
    })
    bibliographySearch.value = ''
}

function renderTag(container, input, item, onRemove) {
    const tag = document.createElement('div')
    tag.classList.add('tag')
    tag.dataset.id = item.id
    const label = document.createElement('span')
    label.textContent = item.title
    const removeBtn = document.createElement('button')
    removeBtn.textContent = '×'
    removeBtn.addEventListener('click', function() { tag.remove(); onRemove() })
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

buttonSaveNote.addEventListener('click', async function() {
    const title = inputTitle.value.trim()
    const content = inputBody.value.trim()
    if (title === '' || content === '') return

    await fetch(`/api/notes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title,
            content,
            type: inputNoteType.value,
            notebook_ids: selectedNotebooks.map(n => n.id),
            bibliography_ids: selectedBibliographies.map(b => b.id),
            folder_ids: selectedFolders.map(f => f.id)
        })
    })
    await applyFilters()
    closeModal()
})

// ===== edit modal =====
async function openEditModal(note) {
    currentEditNote = note
    inputEditTitle.value = note.title
    inputEditBody.value = note.content
    clearEditTags()

    const response = await fetch(`/api/notes/${note.id}`)
    const fullNote = await response.json()
    inputEditNoteType.value = fullNote.type || 'note'

    fullNote.notebooks.filter(n => n.type === 'notebook').forEach(n => addEditNotebookTag(n))
    fullNote.notebooks.filter(n => n.type === 'folder').forEach(f => addEditFolderTag(f))
    fullNote.bibliographies.forEach(b => addEditBibliographyTag(b))

    editModal.classList.remove('hidden')
}

function closeEditModal() {
    editModal.classList.add('hidden')
    currentEditNote = null
    inputEditNoteType.value = 'note'
    clearEditTags()
}

buttonCloseEditModal.addEventListener('click', closeEditModal)
buttonCancelEditNote.addEventListener('click', closeEditModal)
editModal.addEventListener('click', function(e) { if (e.target === editModal) closeEditModal() })

editNotebookSearch.addEventListener('input', function() {
    const query = editNotebookSearch.value.toLowerCase()
    if (query === '') { editNotebookDropdown.classList.add('hidden'); return }
    const matches = allNotebooks.filter(n => n.title.toLowerCase().includes(query) && !editSelectedNotebooks.find(s => s.id === n.id))
    renderDropdown(editNotebookDropdown, matches, addEditNotebookTag)
})
editNotebookSearch.addEventListener('blur', function() { setTimeout(() => editNotebookDropdown.classList.add('hidden'), 150) })

editFolderSearch.addEventListener('input', function() {
    const query = editFolderSearch.value.toLowerCase()
    if (query === '') { editFolderDropdown.classList.add('hidden'); return }
    const matches = allFolders.filter(f => f.title.toLowerCase().includes(query) && !editSelectedFolders.find(s => s.id === f.id))
    renderDropdown(editFolderDropdown, matches, addEditFolderTag)
})
editFolderSearch.addEventListener('blur', function() { setTimeout(() => editFolderDropdown.classList.add('hidden'), 150) })

editBibliographySearch.addEventListener('input', function() {
    const query = editBibliographySearch.value.toLowerCase()
    if (query === '') { editBibliographyDropdown.classList.add('hidden'); return }
    const matches = allBibliographies.filter(b => b.title.toLowerCase().includes(query) && !editSelectedBibliographies.find(s => s.id === b.id))
    renderDropdown(editBibliographyDropdown, matches, addEditBibliographyTag)
})
editBibliographySearch.addEventListener('blur', function() { setTimeout(() => editBibliographyDropdown.classList.add('hidden'), 150) })

function addEditNotebookTag(notebook) {
    editSelectedNotebooks.push(notebook)
    renderTag(editNotebookTagsContainer, editNotebookSearch, notebook, function() {
        editSelectedNotebooks = editSelectedNotebooks.filter(n => n.id !== notebook.id)
    })
    editNotebookSearch.value = ''
}

function addEditFolderTag(folder) {
    editSelectedFolders.push(folder)
    renderTag(editFolderTagsContainer, editFolderSearch, folder, function() {
        editSelectedFolders = editSelectedFolders.filter(f => f.id !== folder.id)
    })
    editFolderSearch.value = ''
}

function addEditBibliographyTag(bibliography) {
    editSelectedBibliographies.push(bibliography)
    renderTag(editBibliographyTagsContainer, editBibliographySearch, bibliography, function() {
        editSelectedBibliographies = editSelectedBibliographies.filter(b => b.id !== bibliography.id)
    })
    editBibliographySearch.value = ''
}

function clearEditTags() {
    editSelectedNotebooks = []
    editSelectedFolders = []
    editSelectedBibliographies = []
    editNotebookTagsContainer.querySelectorAll('.tag').forEach(t => t.remove())
    editFolderTagsContainer.querySelectorAll('.tag').forEach(t => t.remove())
    editBibliographyTagsContainer.querySelectorAll('.tag').forEach(t => t.remove())
    editNotebookSearch.value = ''
    editFolderSearch.value = ''
    editBibliographySearch.value = ''
}

buttonSaveEditNote.addEventListener('click', async function() {
    const newTitle = inputEditTitle.value.trim()
    const newContent = inputEditBody.value.trim()
    if (newTitle === '' || newContent === '') return

    await fetch(`/api/notes/${currentEditNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: newTitle,
            content: newContent,
            type: inputEditNoteType.value,
            notebook_ids: editSelectedNotebooks.map(n => n.id),
            folder_ids: editSelectedFolders.map(f => f.id),
            bibliography_ids: editSelectedBibliographies.map(b => b.id)
        })
    })
    await applyFilters()
    closeEditModal()
})

// ===== filters =====
filterNotebookSearch.addEventListener('input', function() {
    const query = filterNotebookSearch.value.toLowerCase()
    if (query === '') { filterNotebookDropdown.classList.add('hidden'); return }
    const matches = allNotebooks.filter(n => n.title.toLowerCase().includes(query) && !activeNotebookFilters.find(s => s.id === n.id))
    renderDropdown(filterNotebookDropdown, matches, addNotebookFilter)
})
filterNotebookSearch.addEventListener('blur', function() { setTimeout(() => filterNotebookDropdown.classList.add('hidden'), 150) })

filterFolderSearch.addEventListener('input', function() {
    const query = filterFolderSearch.value.toLowerCase()
    if (query === '') { filterFolderDropdown.classList.add('hidden'); return }
    const matches = allFolders.filter(f => f.title.toLowerCase().includes(query) && !activeFolderFilters.find(s => s.id === f.id))
    renderDropdown(filterFolderDropdown, matches, addFolderFilter)
})
filterFolderSearch.addEventListener('blur', function() { setTimeout(() => filterFolderDropdown.classList.add('hidden'), 150) })

filterBibliographySearch.addEventListener('input', function() {
    const query = filterBibliographySearch.value.toLowerCase()
    if (query === '') { filterBibliographyDropdown.classList.add('hidden'); return }
    const matches = allBibliographies.filter(b => b.title.toLowerCase().includes(query) && !activeBibliographyFilters.find(s => s.id === b.id))
    renderDropdown(filterBibliographyDropdown, matches, addBibliographyFilter)
})
filterBibliographySearch.addEventListener('blur', function() { setTimeout(() => filterBibliographyDropdown.classList.add('hidden'), 150) })

function addNotebookFilter(notebook) {
    activeNotebookFilters.push(notebook)
    renderTag(filterNotebookTagsContainer, filterNotebookSearch, notebook, function() {
        activeNotebookFilters = activeNotebookFilters.filter(n => n.id !== notebook.id)
        applyFilters()
    })
    filterNotebookSearch.value = ''
    applyFilters()
}

function addFolderFilter(folder) {
    activeFolderFilters.push(folder)
    renderTag(filterFolderTagsContainer, filterFolderSearch, folder, function() {
        activeFolderFilters = activeFolderFilters.filter(f => f.id !== folder.id)
        applyFilters()
    })
    filterFolderSearch.value = ''
    applyFilters()
}

function addBibliographyFilter(bibliography) {
    activeBibliographyFilters.push(bibliography)
    renderTag(filterBibliographyTagsContainer, filterBibliographySearch, bibliography, function() {
        activeBibliographyFilters = activeBibliographyFilters.filter(b => b.id !== bibliography.id)
        applyFilters()
    })
    filterBibliographySearch.value = ''
    applyFilters()
}

// ===== notes table =====
searchInput.addEventListener('input', function() {
    const query = searchInput.value.toLowerCase()
    const rows = container.querySelectorAll('tbody tr')
    rows.forEach(row => {
        const text = row.textContent.toLowerCase()
        row.style.display = text.includes(query) ? '' : 'none'
    })
})

async function applyFilters() {
    const notebookIds = activeNotebookFilters.map(n => n.id)
    const folderIds = activeFolderFilters.map(f => f.id)
    const bibliographyIds = activeBibliographyFilters.map(b => b.id)

    const params = new URLSearchParams()
    notebookIds.forEach(id => params.append('notebook_ids', id))
    folderIds.forEach(id => params.append('folder_ids', id))
    bibliographyIds.forEach(id => params.append('bibliography_ids', id))

    const url = `/api/notes/filter/folder/${FOLDER_ID}?${params.toString()}`

    const response = await fetch(url)
    const notes = await response.json()

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Content</th>
                    <th>Notebooks</th>
                    <th>Folders</th>
                    <th>Bibliographies</th>
                    <th></th>
                </tr>
            </thead>
            <tbody id="notes-tbody"></tbody>
        </table>
    `
    const tbody = document.querySelector('#notes-tbody')
    notes.forEach(note => renderNote(note, tbody))
}

async function loadNotes() {
    await applyFilters()
}

function renderNote(note, tbody) {
    const tr = document.createElement('tr')
    tr.style.cursor = 'pointer'

    const tdTitle = document.createElement('td')
    tdTitle.textContent = note.title

    const tdContent = document.createElement('td')
    tdContent.textContent = note.content

    const tdNotebooks = document.createElement('td')
    tdNotebooks.textContent = (note.notebooks || []).filter(n => n.type === 'notebook').map(n => n.title).join(', ')

    const tdFolders = document.createElement('td')
    tdFolders.textContent = (note.notebooks || []).filter(n => n.type === 'folder').map(n => n.title).join(', ')

    const tdBibliographies = document.createElement('td')
    tdBibliographies.textContent = (note.bibliographies || []).map(b => b.title).join(', ')

    const tdActions = document.createElement('td')
    const actions = document.createElement('div')
    actions.classList.add('note-actions')

    tr.addEventListener('click', function() { openEditModal(note) })

    const buttonDelete = document.createElement('button')
    buttonDelete.textContent = 'Delete'
    buttonDelete.addEventListener('click', function(e) {
        e.stopPropagation()
        deleteNote(note.id, tr)
    })

    actions.appendChild(buttonDelete)
    tdActions.appendChild(actions)
    tr.appendChild(tdTitle)
    tr.appendChild(tdContent)
    tr.appendChild(tdNotebooks)
    tr.appendChild(tdFolders)
    tr.appendChild(tdBibliographies)
    tr.appendChild(tdActions)
    tbody.appendChild(tr)
}

async function deleteNote(id, element) {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' })
    element.remove()
}

async function init() {
    await loadAllNotebooks()
    await loadAllFolders()
    await loadAllBibliographies()
    await loadFolder()
    await loadSubFolders()
}

init()