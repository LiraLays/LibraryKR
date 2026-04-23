import { getAuthors, addAuthor, updateAuthor, deleteAuthor } from "../api.js";

let allAuthors = [];
let editingId = [];

export async function initAuthorsPage() {
    document.getElementById('current-table-name').textContent = 'Авторы';
    renderTableHead();
    bindEvents();
    await loadAuthors();
}

async function loadAuthors() {
    const response = await getAuthors();
    if (response.status === 'ok') {
        allAuthors = response.data;
        renderTableBody(allAuthors);
    } else {
        showError('Не удалось загрузить авторов: ' + response.message);
    }
}

function renderTableHead() {
    document.getElementById('table-head').innerHTML = `
        <th>ID</th>
        <th>Name</th>
        <th>Actions</th>
    `;
}

// Filling tbody with author strings
function renderTableBody(authors) {
    const tbody = document.getElementById('table-body');

    if (authors.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align:center; color:#999; padding:32px;">
                    Authors not found
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = authors.map(author => `
        <tr>
            <td>${author.id}</td>
            <td>${author.name}</td>
            <td>
                <button class="btn-edit" onclick="window.editAuthor('${author.id}')">
                    Edit
                </button>
                <button class="btn-delete" onclick="window.deleteAuthorById('${author.id}')">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function renderModalFields(author = null) {
    document.getElementById('modal-fields').innerHTML = `
    <label>Author name</label>
    <input type="text" id="author-name"
           value="${author ? author.name : ''}"
           placeholder="Full author name" />
    `;
}

function openModal(author = null) {
    document.getElementById('modal-title').textContent = 
        author ? 'Edit author' : 'Add author';
    renderModalFields(author);
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    editingId = null;
}

function bindEvents() {
    document.getElementById('add-record-btn').onclick = () => {
        editingId = null;
        openModal();
    };
    document.getElementById('close-modal').onclick = closeModal;
    document.getElementById('cancel-btn').onclick = closeModal;
    document.getElementById('modal-overlay').onclick = (e) => {
        if (e.target.id === 'modal-overlay') closeModal();
    };
    document.getElementById('modal-form').onsubmit = async (e) => {
        e.preventDefault();
        await saveAuthor();
    };
}

async function saveAuthor() {
    const name = document.getElementById('author-name').value.trim();
    if (!name) { alert('Input author name'); return; }

    const response = editingId
        ? await updateAuthor(editingId, name)
        : await addAuthor(name);

    if (response.status === 'ok') {
        closeModal();
        await loadAuthors();
    } else {
        alert('Ошибка: ' + response.message);
    }
}

window.editAuthor = function(id) {
    editingId = id;
    const author = allAuthors.find(a => a.id === id);
    if (author) openModal(author);
};

window.deleteAuthorById = async function(id) {
    const author = allAuthors.find(a => a.id === id);
    if (!confirm(`Delete author "${author ? author.name : id}"?`)) return;
    const response = await deleteAuthor(id);
    if (response.status === 'ok') {
        await loadAuthors();
    } else {
        alert('Ошибка: ' + response.message);
    }
};

function showError(msg) {
    document.getElementById('table-body').innerHTML = `
    <tr><td colspan="3" style="color:#ef4444; padding:16px; text-align:center;">
        ${msg}
    </td></tr>`;
}