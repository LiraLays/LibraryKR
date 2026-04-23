import { addBookgroup, updateBookgroup, deleteBookgroup, getBookgroup, getBookgroups } from '../api.js';

// Page status
let allBookgroups = []; // All bookgroups loaded from server
let editingId = null;    // Id edited bookgroup (null = add)

// Entry point
export async function initBookgroupsPage() {
    document.getElementById('current-table-name').textContent = 'Bookgroups';

    renderTableHead(); // Rendering table head

    bindEvents();

    // Then load data
    await loadBookgroups();
}

// Loading bookgroups
async function loadBookgroups() {
    const response = await getBookgroups();
    if (response.status === 'ok') {
        allBookgroups = response.data;
        renderTableBody(allBookgroups);
    } else {
        showError('Can\'t load bookgroups: ' + response.message);
    }
}

// Render

// Drawing table head
function renderTableHead() {
    document.getElementById('table-head').innerHTML = `
        <th>ID</th>
        <th>Bookgroup</th>
        <th>Actions</th>
    `;
}

// Filling tbody with book strings
function renderTableBody(bookgroups) {
    const tbody = document.getElementById('table-body');
    if (!tbody)
        return;

    if (bookgroups.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align:center; color:#999; padding:32px;">
                    Bookgroups not found
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = bookgroups
                          .map(bookgroup => `
        <tr>
            <td>${bookgroup.id}</td>
            <td>${bookgroup.name}</td>
            <td>
                <button class="btn-edit" onclick="window.editBookgroup('${
                                   bookgroup.id}')">
                    Edit
                </button>
                <button class="btn-delete" onclick="window.deleteBookgroupById('${
                                   bookgroup.id}')">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Modal window

// Filling #modal-fields
function renderModalFields(bookgroup = null) {

    document.getElementById('modal-fields').innerHTML = `
    <label>Bookgroup</label>
    <input type="text" id="bookgroup-name"
           value="${bookgroup ? bookgroup.name : ''}"
           placeholder="Bookgroup name" />
    `;
}

// Open modal window
function openModal(bookgroup = null) {
    document.getElementById('modal-title').textContent =
        bookgroup ? 'Edit bookgroup' : 'Add bookgroup';

    renderModalFields(bookgroup);

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
        await saveBookgroup();
    };
}

// CRUD operations

// Save bookgroup (add or update)
async function saveBookgroup() {
    const name = document.getElementById('bookgroup-name').value.trim();

    // Simple validation
    if (!name) {
        alert('Fill all fields!');
        return;
    }

    let response;
    if (editingId) // Editing
        response = await updateBookgroup(editingId, name);
    else // Adding new book
        response = await addBookgroup(name);

    if (response.status === 'ok') {
        closeModal();
        await loadBookgroups(); // Reload list
    } 
    else 
        alert('Error' + response.message);
}

// Open edit form for particular bookgroup
window.editBookgroup = async function(id) {
    editingId = id;
    const response = await getBookgroup(id);

    if (response.status === 'ok' && response.data.length > 0) {
        openModal(response.data[0]);
    } else {
        alert('Can\'t load bookgroup data');
    }
};

// Delete bookgroup with submit
window.deleteBookgroupById = async function(id) {
    const bookgroup = allBookgroups.find(e => e.id === id);
    const name = bookgroup ? bookgroup.name : `#${id}`;
    if (!confirm(`Delete bookgroup "${name}"?`))
        return;
    
    const response = await deleteBookgroup(id);
    if (response.status === 'ok')
        await loadBookgroups(); // Reloading list
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