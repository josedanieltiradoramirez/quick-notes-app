const API = 'http://127.0.0.1:8000'

const buttonNewFolder = document.querySelector('#button-new-folder')
const buttonSaveFolder = document.querySelector('#button-save-folder')
const buttonCancelFolder = document.querySelector('#button-cancel-folder')
const form = document.querySelector('#new-folder-form')
const inputTitle = document.querySelector('#input-folder-title')
const inputDescription = document.querySelector('#input-folder-description')
const container = document.querySelector('#folders-container')
const searchInput = document.querySelector('#search-input')

searchInput.addEventListener('input', function() {
    const query = searchInput.value.toLowerCase()
    const cards = container.querySelectorAll(':scope > div')
    cards.forEach(card => {
        const text = card.textContent.toLowerCase()
        card.style.display = text.includes(query) ? 'flex' : 'none'
    })
})

buttonNewFolder.addEventListener('click', function() {
    form.classList.remove('hidden')
})

buttonCancelFolder.addEventListener('click', function() {
    form.classList.add('hidden')
    inputTitle.value = ''
    inputDescription.value = ''
})

async function loadFolders() {
    const response = await fetch(`/api/folders/`)
    const folders = await response.json()
    container.innerHTML = ''
    folders.forEach(folder => renderFolder(folder))
}

buttonSaveFolder.addEventListener('click', async function() {
    const title = inputTitle.value.trim()
    const description = inputDescription.value.trim()
    if (title === '') return

    const response = await fetch(`/api/folders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
    })
    const folder = await response.json()
    renderFolder(folder)
    inputTitle.value = ''
    inputDescription.value = ''
    form.classList.add('hidden')
})

function renderFolder(folder) {
    const div = document.createElement('div')

    const title = document.createElement('p')
    title.textContent = `📁 ${folder.title}`

    const description = document.createElement('p')
    description.textContent = folder.description || ''

    const actions = document.createElement('div')
    actions.classList.add('note-actions')

    const buttonEdit = document.createElement('button')
    buttonEdit.textContent = 'Edit'
    buttonEdit.addEventListener('click', function(e) {
        e.stopPropagation()

        const inputTitle = document.createElement('input')
        inputTitle.value = folder.title

        const inputDescription = document.createElement('textarea')
        inputDescription.value = folder.description || ''
        inputDescription.rows = 2

        const buttonSave = document.createElement('button')
        buttonSave.textContent = 'Save'
        buttonSave.addEventListener('click', async function(e) {
            e.stopPropagation()
            const newTitle = inputTitle.value.trim()
            const newDescription = inputDescription.value.trim()
            if (newTitle === '') return

            await fetch(`/api/folders/${folder.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle, description: newDescription })
            })

            title.textContent = `📁 ${newTitle}`
            description.textContent = newDescription
            folder.title = newTitle
            folder.description = newDescription

            div.replaceChild(title, inputTitle)
            div.replaceChild(description, inputDescription)
            actions.replaceChild(buttonEdit, buttonSave)
        })

        div.replaceChild(inputTitle, title)
        div.replaceChild(inputDescription, description)
        actions.replaceChild(buttonSave, buttonEdit)
    })

    const buttonDelete = document.createElement('button')
    buttonDelete.textContent = 'Delete'
    buttonDelete.addEventListener('click', function(e) {
        e.stopPropagation()
        deleteFolder(folder.id, div)
    })

    div.addEventListener('click', function() {
        window.location.href = `/folders/${folder.id}`
    })

    actions.appendChild(buttonEdit)
    actions.appendChild(buttonDelete)
    div.appendChild(title)
    div.appendChild(description)
    div.appendChild(actions)
    container.appendChild(div)
}

async function deleteFolder(id, element) {
    await fetch(`/api/folders/${id}`, { method: 'DELETE' })
    element.remove()
}

loadFolders()