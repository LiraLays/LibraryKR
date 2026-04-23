import { addBook, editBook, deleteBook, getAuthors, getBookgroups, getPublishers, getBook, getBooks } from '../api.js';

// Page status
let allBooks = [];      // All books loaded from server
let allAuthors = [];    // All authors for drop-down list
let allBookgroups = []; // All bookgroups for drop-down list
let allPublishers = []; // All publishers for drop-down list
let editingId = null;   // Id edited book (null = add)

// Entry point
export async function initBooksPage() {
    document.getElementById('current-table-name').textContent = 'Books';

    renderTableHead(); // Rendering table head

    bindEvents();

    // Then load data
    await loadAuthors();
    await loadBookgroups();
    await loadPublishers();
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

// Loading bookgroups
async function loadBookgroups() {
    const response = await getBookgroups();
    if (response.status === 'ok') {
        allBookgroups = response.data;
    }
}

// Loading publishers
async function loadPublishers() {
    const response = await getPublishers();
    if (response.status === 'ok') {
        allPublishers = response.data;
    }
}

// Render

// Drawing table head
function renderTableHead() {
    document.getElementById('table-head').innerHTML = `
        <th>ID</th>
        <th>Name</th>
        <th>Author</th>
        <th>Group</th>
        <th>Year</th>
        <th>Publisher</th>
        <th>Cost</th>
        <th>Actions</th>
    `;
}

// Filling tbody with book strings
function renderTableBody(books) {
    const tbody = document.getElementById('table-body');
    if (!tbody)
        return;

    if (books.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; color:#999; padding:32px;">
                    Books not found
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = books
                          .map(book => `
        <tr>
            <td>${book.id}</td>
            <td>${book.name}</td>
            <td>${book.author}</td>
            <td>${book.group}</td>
            <td>${book.year}</td>
            <td>${book.publisher}</td>
            <td>${book.cost}</td>
            <td>
                <button class="btn-edit" onclick="window.editBook('${
                                   book.id}')">
                    Edit
                </button>
                <button class="btn-delete" onclick="window.deleteBookById('${
                                   book.id}')">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Modal window

// Filling #modal-fields 
function renderModalFields(book = null) {
    // Building drop-down lists
    const authorOptions = allAuthors.map(a =>
        `<option value="${a.id}" ${book && book.author == a.name ? 'selected' : ''}>
            ${a.name}
        </option>`
    ).join('');

    const bookgroupsOptions = allBookgroups.map(bgr => 
        `<option value="${bgr.id}" ${book && book.group == bgr.name ? 'selected' : ''}>
            ${bgr.name}
        </option>`).join('');

    const publisherOptions = allPublishers.map(pbl => 
        `<option value="${pbl.id}" ${ book && book.publisher == pbl.name ? 'selected' : ''}>
            ${pbl.name}
        </option>`).join('');

    document.getElementById('modal-fields').innerHTML = `
    
    <label>Author</label>
    <select id="book-author-select">
        <option value="">Select author...</option>
        ${authorOptions}
    </select>

    <label>Group</label>
    <select id="book-group-select">
        <option value="">Select group...</option>
        ${bookgroupsOptions}
    </select>

    <label>Publisher</label>
    <select id="book-publisher-select">
        <option value="">Select publisher...</option>
        ${publisherOptions}
    </select>

    <label>Book</label>
    <input type="text" id="book-name"
           value="${book ? book.name : ''}"
           placeholder="Book name" />
    
    <label>Publication year</label>
    <input type="number" id="book-year"
           value="${book ? book.year : ''}"
           placeholder="Year" min="1000" max="2100" />

    <label>Cost</label>
    <input type="number" id="book-cost"
           value="${book ? (book.cost || '') : ''}"
           placeholder="Cost" min="0" step="0.01" />     
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
    const author_id = document.getElementById('book-author-select').value;
    const group_id = document.getElementById('book-group-select').value;
    const name = document.getElementById('book-name').value.trim();
    const year = document.getElementById('book-year').value.trim();
    const publisher_id = document.getElementById('book-publisher-select').value;
    const cost = document.getElementById('book-cost').value.trim();

    // Simple validation
    if (!author_id || !group_id || !publisher_id || !name || !year || !cost) {
        alert('Fill all fields!');
        return;
    }

    let response;
    if (editingId) {
        // Editing
        response = await editBook(editingId, author_id, group_id, name, year,
                                  publisher_id, cost);
        // window.sendCommand(
        //     `UPDATE_BOOK|${editingId}|${name}|${authorId}|${year}|${cost}`
        // ).then(r => JSON.parse(r));
    } else {
        // Adding new book
        response = await addBook(author_id, group_id, name, year, publisher_id, cost);
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