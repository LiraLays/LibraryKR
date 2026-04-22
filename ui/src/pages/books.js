import { addBook, deleteBook, getAuthors, getBook, getBooks } from '../api.js';

// Page status
let allBooks = [];    // All books loaded from server
let allAuthors = [];  // All authors for drop-down list
let editingId = null; // Id edited book (null = add)

// Entry point
export async function initBooksPage() {
    document.getElementById('current-table-name').textContent = 'Книги';

    renderTableHead(); // Rendering table head

    bindEvents();

    // Then load data
    await loadAuthors();
    await loadBooks();
}

// Loading data
async function loadBooks() {
    const response = await getBooks();
    if (response.status === 'ok') {
        allBooks = response.data;
        renderTableBody(allBooks);
    } else {
        showError('Can\'t load books: ' + response.message);
    }
}

// Loading authors
async function loadAuthors() {
    const response = await getAuthors();
    if (response.status === 'ok') {
        allAuthors = response.data;
    }
}

// Render

// Drawing table head
function renderTableHead() {
    document.getElementById('table-head').innerHTML = `
        <th>ID</th>
        <th>Название</th>
        <th>Автор</th>
        <th>Год</th>
        <th>Действия</th>
    `;

    // tbody.innerHTML = 
    //     .map(book => `
    //     <tr>
    //         <td>${book.id}</td>
    //         <td>${book.name}</td>
    //         <td>${book.author}</td>
    //         <td>${book.year}</td>
    //         <td>
    //             <button class="btn-edit">
    //                     onclick="window.editBook('${book.id}')">
    //                     Change
    //             </button>
    //             <button class="btn-delete"
    //                     onclick="window.deleteBookById('${book.id}')">
    //                     Delete
    //             </button>
    //         </td>
    //     <tr>
    // `).join('');
}

// Filling tbody with book strings
function renderTable(books) {
    const tbody = document.getElementById('books-tbody');
    if (!tbody)
        return;

    if (books.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty">Books not found</td>
            </tr>`;
        return;
    }

    tbody.innerHTML = books
        .map(book => `
        <tr data-id="${book.id}">
            <td>${book.id}</td>
            <td>${book.name}</td>
            <td>${book.author}</td>
            <td>${book.year}</td>
            <td class="actions">
                <button class="btn btn-small btn-secondary"
                    onclick="editBook('${book.id}')">
                    Edit
                </button>
                <button class="btn btn-small btn-danger"
                    onclick="deleteBookById('${book.id}')">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Modal window

// Filling #modal-fields 
function renderModalFields(book = null) {
    // Building drop-down authors list
    const authorOptions = allAuthors.map(a =>
        `<option value="${a.id}" ${book && book.authorId == a.id ? 'selected' : ''}>
            ${a.name}
        </option>`
    ).join('');

    document.getElementById('modal-fields').innerHTML = `
    <label>Название</label>
    <input type="text" id="book-name"
           value="${book ? book.name : ''}"
           placeholder="Название книги" />
           
    <label>Автор</label>
    <select id="book-author-select">
        <option value="">Выберите автора...</option>
        ${authorOptions}
    </select>
    
    <label>Год издания</label>
    <input type="number" id="book-year"
           value="${book ? book.year : ''}"
           placeholder="Год" min="1000" max="2100" />
    `;
}

// Open modal window
function openModal(book = null) {
    document.getElementById('modal-title').textContent =
        book ? 'Редактировать книгу' : 'Добавить книгу';

    renderModalFields(book);

    document.getElementById('modal-overlay').classList.remove('hidden');
}

// Close modal window
function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    editingId = null;
}

// Event processors
function bindEvents() {
    // On "Add" book open empty form
    document.getElementById('add-record-btn').onclick = () => {
        editingId = null;
        openModal();
    };

    // Button "Close" on form
    document.getElementById('close-modal').onclick = closeModal;

    // Button "Back" on form
    document.getElementById('cancel-btn').onclick = closeModal;

    // Click on overlay closing modal
    document.getElementById('modal-overlay').onclick = (e) => {
        if (e.target.id === 'modal-overlay')
            closeModal();
    };

    document.getElementById('modal-form').onsubmit = async (e) => {
        e.preventDefault();
        await saveBook();
    };
}

// CRUD operations

// Save book (add or update)
async function saveBook() {
    const name = document.getElementById('book-name').value.trim();
    const authorId = document.getElementById('book-author-select').value;
    const year = document.getElementById('book-year').value.trim();

    // Simple validation
    if (!name || !authorId || !year) {
        alert('Fill all fields!');
        return;
    }

    let response;
    if (editingId) {
        // Editing
        response = await window.sendCommand(
            `UPDATE_BOOK|${editingId}|${name}|${authorId}|${year}`
        ).then(r => JSON.parse(r));
    } else {
        // Adding new book
        response = await addBook(name, authorId, year);
    }

    if (response.status === 'ok') {
        closeModal();
        await loadBooks(); // Reload list
    } else {
        alert('Error' + response.message);
    }
}

// Open edit form for particular book
window.editBook = async function (id) {
    editingId = id;
    const response = await getBook(id);

    if (response.status === 'ok' && response.data.length > 0) {
        openModal(response.data[0]);
    } else {
        alert('Can\'t load book data');
    }
};

// Delete book with submit
window.deleteBookById = async function (id) {
    const book = allBooks.find(b => b.id === id);
    const name = book ? book.name : `#${id}`;
    if (!confirm(`Delete book "${name}"?`)) return;
    
    const response = await deleteBook(id);
    if (response.status === 'ok') {
        await loadBooks(); // Reloading list
    } else {
        alert('Deleting error: ' + response.message);
    }
};

// Additional

function showError(msg) {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = `
        <tr>
            <td colspan="5"
                style="color:#ef4444; padding:16px; text-align:center;">
                ${msg}
            </td>
        </tr>`;
}