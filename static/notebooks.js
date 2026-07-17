

const buttonNewNotebook = document.querySelector('#button-new-notebook')
const buttonSaveNotebook = document.querySelector('#button-save-notebook')
const buttonCancelNotebook = document.querySelector('#button-cancel-notebook')
const form = document.querySelector('#new-notebook-form')
const inputTitle = document.querySelector('#input-notebook-title')
const inputDescription = document.querySelector('#input-notebook-description')
const container = document.querySelector('#notebooks-container')
const searchInput = document.querySelector('#search-input')

searchInput.addEventListener('input', function() {
    const query = searchInput.value.toLowerCase()
    const cards = container.querySelectorAll(':scope > div')
    
    cards.forEach(card => {
        const text = card.textContent.toLowerCase()
        if (text.includes(query)) {
            card.style.display = 'flex'
        } else {
            card.style.display = 'none'
        }
    })
})

// show/hide form
buttonNewNotebook.addEventListener('click', function() {
    form.classList.remove('hidden')
})

buttonCancelNotebook.addEventListener('click', function() {
    form.classList.add('hidden')
    inputTitle.value = ''
    inputDescription.value = ''
})

// load notebooks on startup
async function loadNotebooks() {
    const response = await fetch(`/api/notebooks/?root_only=true`)
    const notebooks = await response.json()
    container.innerHTML = ''
    notebooks.forEach(notebook => renderNotebook(notebook))
}

// crear notebook
buttonSaveNotebook.addEventListener('click', async function() {
    const title = inputTitle.value.trim()
    const description = inputDescription.value.trim()
    if (title === '') return

    const response = await fetch(`/api/notebooks/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
    })
    const notebook = await response.json()
    renderNotebook(notebook)
    inputTitle.value = ''
    inputDescription.value = ''
    form.classList.add('hidden')
})

// renderizar tarjeta de notebook
function renderNotebook(notebook) {
    const div = document.createElement('div')

    const title = document.createElement('p')
    title.textContent = notebook.title

    const description = document.createElement('p')
    description.textContent = notebook.description || ''

    const actions = document.createElement('div')
    actions.classList.add('note-actions')

    const buttonEdit = document.createElement('button')
    buttonEdit.textContent = 'Edit'
    buttonEdit.addEventListener('click', function(e) {
        e.stopPropagation()
        const inputTitle = document.createElement('input')
        inputTitle.value = notebook.title
        inputTitle.addEventListener('click', function(e) {
            e.stopPropagation()
        })

        const inputDescription = document.createElement('textarea')
        inputDescription.value = notebook.description || ''
        inputDescription.rows = 2
        inputDescription.addEventListener('click', function(e) {
            e.stopPropagation()
        })

        const buttonSave = document.createElement('button')
        buttonSave.textContent = 'Save'
        buttonSave.addEventListener('click', async function(e) {
            e.stopPropagation()
            const newTitle = inputTitle.value.trim()
            const newDescription = inputDescription.value.trim()
            if (newTitle === '') return

            await fetch(`/api/notebooks/${notebook.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle, description: newDescription })
            })

            title.textContent = newTitle
            description.textContent = newDescription
            notebook.title = newTitle
            notebook.description = newDescription

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
        deleteNotebook(notebook.id, div)
    })

    div.addEventListener('click', function() {
    window.location.href = `/notebooks/${notebook.id}`
    })

    actions.appendChild(buttonEdit)
    actions.appendChild(buttonDelete)
    div.appendChild(title)
    div.appendChild(description)
    div.appendChild(actions)
    container.appendChild(div)
}

async function deleteNotebook(id, element) {
    await fetch(`/api/notebooks/${id}`, { method: 'DELETE' })
    element.remove()
}

loadNotebooks()