const API = 'http://127.0.0.1:8000'

const buttonNewBibliography = document.querySelector('#button-new-bibliography')
const buttonSaveBibliography = document.querySelector('#button-save-bibliography')
const buttonCancelBibliography = document.querySelector('#button-cancel-bibliography')
const form = document.querySelector('#new-bibliography-form')
const inputTitle = document.querySelector('#input-bibliography-title')
const inputUrl = document.querySelector('#input-bibliography-url')
const inputDescription = document.querySelector('#input-bibliography-description')
const container = document.querySelector('#bibliographies-container')

buttonNewBibliography.addEventListener('click', function() {
    form.classList.remove('hidden')
})

buttonCancelBibliography.addEventListener('click', function() {
    form.classList.add('hidden')
    inputTitle.value = ''
    inputUrl.value = ''
    inputDescription.value = ''
})

async function loadBibliographies() {
    const response = await fetch(`${API}/api/bibliographies/`)
    const bibliographies = await response.json()
    container.innerHTML = ''
    bibliographies.forEach(bibliography => renderBibliography(bibliography))
}

buttonSaveBibliography.addEventListener('click', async function() {
    const title = inputTitle.value.trim()
    const url = inputUrl.value.trim()
    const description = inputDescription.value.trim()
    if (title === '') return

    const response = await fetch(`${API}/api/bibliographies/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, url, description })
    })
    const bibliography = await response.json()
    renderBibliography(bibliography)
    inputTitle.value = ''
    inputUrl.value = ''
    inputDescription.value = ''
    form.classList.add('hidden')
})

function renderBibliography(bibliography) {
    const div = document.createElement('div')

    const title = document.createElement('p')
    title.textContent = bibliography.title

    const url = document.createElement('a')
    url.href = bibliography.url || '#'
    url.textContent = bibliography.url || ''
    url.target = '_blank'

    const description = document.createElement('p')
    description.textContent = bibliography.description || ''

    const actions = document.createElement('div')
    actions.classList.add('note-actions')

    const buttonEdit = document.createElement('button')
    buttonEdit.textContent = 'Edit'
    buttonEdit.addEventListener('click', function() {
        const inputTitle = document.createElement('input')
        inputTitle.value = bibliography.title

        const inputUrl = document.createElement('input')
        inputUrl.value = bibliography.url || ''
        inputUrl.placeholder = 'URL'

        const inputDescription = document.createElement('textarea')
        inputDescription.value = bibliography.description || ''
        inputDescription.rows = 2

        const buttonSave = document.createElement('button')
        buttonSave.textContent = 'Save'
        buttonSave.addEventListener('click', async function() {
            const newTitle = inputTitle.value.trim()
            const newUrl = inputUrl.value.trim()
            const newDescription = inputDescription.value.trim()
            if (newTitle === '') return

            await fetch(`${API}/api/bibliographies/${bibliography.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle, url: newUrl, description: newDescription })
            })

            title.textContent = newTitle
            url.href = newUrl
            url.textContent = newUrl
            description.textContent = newDescription
            bibliography.title = newTitle
            bibliography.url = newUrl
            bibliography.description = newDescription

            div.replaceChild(title, inputTitle)
            div.replaceChild(url, inputUrl)
            div.replaceChild(description, inputDescription)
            actions.replaceChild(buttonEdit, buttonSave)
        })

        div.replaceChild(inputTitle, title)
        div.replaceChild(inputUrl, url)
        div.replaceChild(inputDescription, description)
        actions.replaceChild(buttonSave, buttonEdit)
    })

    const buttonDelete = document.createElement('button')
    buttonDelete.textContent = 'Delete'
    buttonDelete.addEventListener('click', function(e) {
        e.stopPropagation()
        deleteNote(bibliography.id, div)
    })

    actions.appendChild(buttonEdit)
    actions.appendChild(buttonDelete)
    div.appendChild(title)
    div.appendChild(url)
    div.appendChild(description)
    div.appendChild(actions)
    container.appendChild(div)
}

async function deleteNote(id, element) {
    await fetch(`${API}/api/bibliographies/${id}`, { method: 'DELETE' })
    element.remove()
}

loadBibliographies()