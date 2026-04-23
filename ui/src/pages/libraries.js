import { addLibrary, updateLibrary, deleteLibrary, getLibrary, getLibraries } from '../api.js';

// Page status
let allLibraries = [];    
let editingId = null; // Id edited book (null = add)

// Entry point
export async function initLibrariesPage() {
    document.getElementById('current-table-name').textContent = 'Libraries';

    renderTableHead(); // Rendering table head

    bindEvents();

    // Then load data
    await loadLibraries();
}

// Loading data
async function loadLibraries() {
    const response = await getLibraries();
    if (response.status === 'ok') {
        allLibraries = response.data;
        renderTableBody(allLibraries);
    } else {
        showError('Can\'t load libraries: ' + response.message);
    }
}

// Render

// Drawing table head
function renderTableHead() {
    document.getElementById('table-head').innerHTML = `
        <th>ID</th>
        <th>Name</th>
        <th>Address</th>
    `;
}

// Filling tbody with book strings
function renderTableBody(libraries) {
    const tbody = document.getElementById('table-body');
    if (!tbody)
        return;

    if (libraries.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; color:#999; padding:32px;">
                    Libraries not found
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = libraries
                          .map(library => `
        <tr>
            <td>${library.id}</td>
            <td>${library.name}</td>
            <td>${library.address}</td>
            <td>
                <button class="btn-edit" onclick="window.editLibrary('${
                                   library.id}')">
                    Edit
                </button>
                <button class="btn-delete" onclick="window.deleteLibraryById('${
                                   library.id}')">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Modal window

// Filling #modal-fields
function renderModalFields(library = null) {
    document.getElementById('modal-fields').innerHTML = `
    <label>Name</label>
    <input type="text" id="library-name"
           value="${library ? library.name : ''}"
           placeholder="Library name" />
    
    <label>Address</label>
    <input type="text" id="library-address"
           value="${library ? library.address : ''}"
           placeholder="Library address" />
    `;
}

// Open modal window
function openModal(library = null) {
    document.getElementById('modal-title').textContent =
        library ? 'Edit library' : 'Add library';

    renderModalFields(library);

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
        await saveLibrary();
    };
}

// CRUD operations

// Save library (add or update)
async function saveLibrary() {
    const name = document.getElementById('library-name').value.trim();
    const address = document.getElementById('library-address').value.trim();

    // Simple validation
    if (!name || !address) {
        alert('Fill all fields!');
        return;
    }

    let response;
    if (editingId) // Editing
        response = await updateLibrary(editingId, name, address);
    else // Adding new book
        response = await addLibrary(name, address);

    if (response.status === 'ok') {
        closeModal();
        await loadLibraries(); // Reload list
    } 
    else 
        alert('Error' + response.message);
}

// Open edit form for particular library
window.editLibrary = async function(id) {
    editingId = id;
    const response = await getLibrary(id);

    if (response.status === 'ok' && response.data.length > 0) {
        openModal(response.data[0]);
    } else {
        alert('Can\'t load library data');
    }
};

// Delete library with submit
window.deleteLibraryById = async function(id) {
    const library = allLibraries.find(l => l.id === id);
    const name = library ? library.name : `#${id}`;
    if (!confirm(`Delete library "${name}"?`))
        return;
    
    const response = await deleteLibrary(id);
    if (response.status === 'ok')
        await loadLibraries(); // Reloading list
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