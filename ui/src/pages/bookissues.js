import { addBookIssue, updateBookIssue, deleteBookIssue, getReaders, getBooks, getBookIssue, getBookIssues } from '../api.js';

// Page status
let allBookIssues = [];    // All bookIssues loaded from server
let allReaders = [];       // All readers for drop-down list
let allBooks = [];         // All books for drop-down list
let editingId = null;      // Id edited book (null = add)

// Entry point
export async function initBookIssuesPage() {
    document.getElementById('current-table-name').textContent = 'Book issues';

    renderTableHead(); // Rendering table head

    bindEvents();

    // Then load data
    await loadReaders();
    await loadBooks();
    await loadBookIssues();
}

// Loading book issues
async function loadBookIssues() {
    const response = await getBookIssues();
    if (response.status === 'ok') {
        allBookIssues = response.data;
        renderTableBody(allBookIssues);
    } else {
        showError('Can\'t load book issues: ' + response.message);
    }
}

// Loading readers
async function loadReaders() {
    const response = await getReaders();
    if (response.status === 'ok') {
        allReaders = response.data;
    }
}

// Loading books
async function loadBooks() {
    const response = await getBooks();
    if (response.status === 'ok') {
        allBooks = response.data;
    }
}

// Render

// Drawing table head
function renderTableHead() {
    document.getElementById('table-head').innerHTML = `
        <th>ID</th>
        <th>Client</th>
        <th>Book</th>
        <th>Issue date</th>
        <th>Due date</th>
        <th>Return date</th>
        <th>Actions</th>
    `;
}

// Filling tbody with book strings
function renderTableBody(bookIssues) {
    const tbody = document.getElementById('table-body');
    if (!tbody)
        return;

    if (bookIssues.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; color:#999; padding:32px;">
                    Book issues not found
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = bookIssues
                          .map(bookIssue => `
        <tr>
            <td>${bookIssue.id}</td>
            <td>${bookIssue.clientname}</td>
            <td>${bookIssue.bookname}</td>
            <td>${bookIssue.issuedate}</td>
            <td>${bookIssue.duedate}</td>
            <td>${bookIssue.returndate}</td>
            <td>
                <button class="btn-edit" onclick="window.editBookIssue('${
                                   bookIssue.id}')">
                    Edit
                </button>
                <button class="btn-delete" onclick="window.deleteBookIssueById('${
                                   bookIssue.id}')">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Modal window

// Filling #modal-fields
function renderModalFields(bookIssue = null) {
    // Building drop-down list
    const readerOptions = allReaders.map(r =>
        `<option value="${r.id}" ${bookIssue && bookIssue.clientname == r.name ? 'selected' : ''}>
            ${r.name}
        </option>`
    ).join('');

    const bookOptions = allBooks.map(b => 
        `<option value="${b.id}" ${bookIssue && bookIssue.bookname == b.name ? 'selected' : ''}>
            ${b.name}
        </option>`
    ).join('');

    document.getElementById('modal-fields').innerHTML = `
    <label>Reader</label>
    <select id="bookissue-reader-select">
        <option value="">Select reader...</option>
        ${readerOptions}
    </select>

    <label>Book</label>
    <select id="bookissue-book-select">
        <option value="">Select book...</option>
        ${bookOptions}
    </select>

    <label>Issue date</label>
    <input type="date" id="bookissue-issue"
           value="${bookIssue ? bookIssue.issuedate : ''}"
           placeholder="Issue date" />

    <label>Due date</label>
    <input type="date" id="bookissue-due"
           value="${bookIssue ? bookIssue.duedate : ''}"
           placeholder="Due date" />

    <label>Return date</label>
    <input type="date" id="bookissue-return"
           value="${bookIssue ? bookIssue.returndate : ''}"
           placeholder="Return date" />
    `;
}

// Open modal window
function openModal(bookIssue = null) {
    document.getElementById('modal-title').textContent =
        bookIssue ? 'Edit book issue' : 'Add book issue';

    renderModalFields(bookIssue);

    document.getElementById('modal-overlay').classList.remove('hidden');
}

// Close modal window
function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    editingId = null;
}

// Event processors
function bindEvents() {
    document.getElementById('add-record-btn').onclick = () => {
        editingId = null;
        openModal();
    };

    document.getElementById('close-modal').onclick = closeModal;

    document.getElementById('cancel-btn').onclick = closeModal;

    document.getElementById('modal-overlay').onclick = (e) => {
        if (e.target.id === 'modal-overlay')
            closeModal();
    };

    document.getElementById('modal-form').onsubmit = async (e) => {
        e.preventDefault();
        await saveBookIssue();
    };
}

// CRUD operations

// Save reader (add or update)
async function saveBookIssue() {
    const client_id = document.getElementById('bookissue-reader-select').value;
    const book_id = document.getElementById('bookissue-book-select').value;

    const isuueDate = document.getElementById('bookissue-issue').value;
    const dueDate = document.getElementById('bookissue-due').value;
    const returnDate = document.getElementById('bookissue-return').value;

    // Simple validation
    if (!client_id || !book_id || !isuueDate || !dueDate || !returnDate) {
        alert('Fill all fields!');
        return;
    }

    let response;
    if (editingId) // Editing
        response =
            await updateBookIssue(editingId, client_id, book_id, isuueDate, dueDate, returnDate);
    else // Adding 
        response = await addBookIssue(client_id, book_id, isuueDate, dueDate,
                                      returnDate);

    if (response.status === 'ok') {
        closeModal();
        await loadBookIssues(); // Reload list
    } 
    else 
        alert('Error' + response.message);
}

// Open edit form 
window.editBookIssue = async function(id) {
    editingId = id;
    const response = await getBookIssue(id);

    if (response.status === 'ok' && response.data.length > 0) {
        openModal(response.data[0]);
    } else {
        alert('Can\'t load book issue data');
    }
};

// Delete reader with submit
window.deleteBookIssueById = async function(id) {
    const bookIssue = allBookIssues.find(bi => bi.id === id);
    const name = bookIssue ? bookIssue.name : `#${id}`;
    if (!confirm(`Delete book issue "${name}"?`))
        return;
    
    const response = await deleteBookIssue(id);
    if (response.status === 'ok')
        await loadBookIssues(); // Reloading list
    else
        alert('Deleting error: ' + response.message);
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