import { getBooks, getBook, addBook, deleteBook, getAuthors } from '../api.js';

// Page status
let allBooks = [];    // All books loaded from server 
let allAuthors = [];  // All authors for drop-down list
let editingId = null; // Id edited book (null = add)

// Entry point
export async function initBooksPage() {
    renderPage();        // First render
    await loadBooks();   // Then load data
    await loadAuthors();
}

// Loading data
async function loadBooks() {
    showLoading(true);
    const response = await getBooks();
    showLoading(false);

    if (response.status === "ok") {
        allBooks = response.data;
        renderTable(allBooks);
    } else {
        showError("Can't load books: " + response.message);
    }
}

// Loading authors
async function loadAuthors() {
    const response = await getAuthors();
    if (response.status === 'ok') {
        allAuthors = response.data;
        // Filling drop-down list with authors
        const select = document.getElementById('book-author-select');
        if (select) {
            select.innerHTML = allAuthors.map(a =>
                `<option value="${a.id}">${a.name}</option>`
            ).join('');
        }
    }
}

// Render

// Drawing all page - table and form
function renderPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="books-page">
            <!-- Header + "add" button -->
            <div class="page-header">
                <h1>Books</h1>
                <button id="btn-add-book" class="btn btn-primary">
                    + Add book
                </button>
            </div>

            <!-- Search -->
            <input type="text" id="book-search"
                placeholder="Search by name or author..."
                class="search-input" />
            
            <!-- Loading indicator -->
            <div id="loading" style="display:none">Loading...</div>

            <!-- Error message -->
            <div id="error-msg" class="error" style="display:none"></div>

            <!-- Books table -->
            <table class="books-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Author</th>
                        <th>Year</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="books-tbody">
                    <!-- String adding dynamicly -->
                </tbody>
            </table>

            <div id="modal-overlay" class="modal-overlay" style="display:none">
                <div class="modal">
                    <h2 id="modal-title">Add book</h2>

                    <label>Name</label>
                    <input type="text" id="book-name" placeholder="Book name" />
                    
                    <label>Author</label>
                    <select id="book-author-select">
                        <option value="">Loading...</option>
                    </select>

                    <label>Publication year</label>
                    <input type="number" id="book-year" 
                           placeholder="Year" min="1000" max="2100" />

                    <div class="modal-buttons">
                        <button id="btn-save" class="btn btn-primary">Save</button>
                        <button id="btn-cancel" class="btn btn-secondary">Back</button>
                    </div>
                </div>
            </div>

        </div>
    `;

    // Event processors
    bindEvents();
}

// Filling tbody with book strings
function renderTable(books) {
    const tbody = document.getElementById('books-tbody');
    if (!tbody) return;

    if (books.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty">Books not found</td>
            </tr>`;
        return;
    }

    tbody.innerHTML = books.map(book => `
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

// Event processors
function bindEvents() {
    // On "Add" book open empty form
    document.getElementById('btn-add-book').addEventListener('click', () => {
        editingId = null;
        openModal();
    });

    // Button "Save" on form
    document.getElementById('btn-save').addEventListener('click', saveBook);

    // Button "Back" on form
    document.getElementById('btn-cancel').addEventListener('click', closeModal);

    // Click on overlay closing modal
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') closeModal();
    });

    // Search - filter the table locally without request to server
    document.getElementById('book-search').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allBooks.filter(book =>
            book.name.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query)
        );
        renderTable(filtered);
    });
}

// Modal window

function openModal(book = null) {
    const modal = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');

    if (book) {
        // Editing mode
        title.textContent = 'Edit book';
        document.getElementById('book-name').value = book.name;
        document.getElementById('book-year').value = book.year;
        document.getElementById('book-author-select').value = book.authorId || '';
    } else {
        // Adding mode
        title.textContent = 'Add book';
        document.getElementById('book-name').value = '';
        document.getElementById('book-year').value = '';
    }

    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    editingId = null;
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
        response = await sendCommand(`UPDATE_BOOK|${editingId}|${name}|${authorId}|${year}`);
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
        alert("Can't load book data");
    }
}

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
}

// Additional

function showLoading(visible) {
    document.getElementById('loading').style.display = visible ? 'block' : 'none';
}

function showError(msg) {
    const el = document.getElementById('error-msg');
    el.textContent = msg;
    el.style.display = 'block';
}