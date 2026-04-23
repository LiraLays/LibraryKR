import { addReader, updateReader, deleteReader, getEnterprises, getReader, getReaders } from '../api.js';

// Page status
let allReaders = [];    // All books loaded from server
let allEnterprises = [];  // All authors for drop-down list
let editingId = null; // Id edited book (null = add)

// Entry point
export async function initReadersPage() {
    document.getElementById('current-table-name').textContent = 'Readers';

    renderTableHead(); // Rendering table head

    bindEvents();

    // Then load data
    await loadEnterprises();
    await loadReaders();
}

// Loading data
async function loadReaders() {
    const response = await getReaders();
    if (response.status === 'ok') {
        allReaders = response.data;
        renderTableBody(allReaders);
    } else {
        showError('Can\'t load readers: ' + response.message);
    }
}

// Loading authors
async function loadEnterprises() {
    const response = await getEnterprises();
    if (response.status === 'ok') {
        allEnterprises = response.data;
    }
}

// Render

// Drawing table head
function renderTableHead() {
    document.getElementById('table-head').innerHTML = `
        <th>ID</th>
        <th>Name</th>
        <th>Enterprise</th>
        <th>Workphone</th>
        <th>Actions</th>
    `;
}

// Filling tbody with book strings
function renderTableBody(readers) {
    const tbody = document.getElementById('table-body');
    if (!tbody)
        return;

    if (readers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; color:#999; padding:32px;">
                    Readers not found
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = readers
                          .map(reader => `
        <tr>
            <td>${reader.id}</td>
            <td>${reader.name}</td>
            <td>${reader.enterprise}</td>
            <td>${reader.workphone}</td>
            <td>
                <button class="btn-edit" onclick="window.editReader('${
                                   reader.id}')">
                    Edit
                </button>
                <button class="btn-delete" onclick="window.deleteReaderById('${
                                   reader.id}')">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Modal window

// Filling #modal-fields
function renderModalFields(reader = null) {
    // Building drop-down list
    const enterpriseOptions = allEnterprises.map(r =>
        `<option value="${r.id}" ${r && r.enterprise == r.enterprise ? 'selected' : ''}>
            ${r.name}
        </option>`
    ).join('');

    document.getElementById('modal-fields').innerHTML = `
    <label>Name</label>
    <input type="text" id="reader-name"
           value="${reader ? reader.name : ''}"
           placeholder="Reader name" />
           
    <label>Enterprise</label>
    <select id="reader-enterprise-select">
        <option value="">Select interprise...</option>
        ${enterpriseOptions}
    </select>
    
    <label>Workphone</label>
    <input type="number" id="reader-workphone"
           value="${reader ? reader.workphone : ''}"
           placeholder="Phone number" min="70000000000" max="89999999999" />  
    `;
}

// Open modal window
function openModal(reader = null) {
    document.getElementById('modal-title').textContent =
        reader ? 'Edit reader' : 'Add reader';

    renderModalFields(reader);

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
        await saveReader();
    };
}

// CRUD operations

// Save reader (add or update)
async function saveReader() {
    const name = document.getElementById('reader-name').value.trim();
    const enterpriseId =
        document.getElementById('reader-enterprise-select').value;
    const year = document.getElementById('reader-workphone').value.trim();

    // Simple validation
    if (!name || !enterpriseId || !year) {
        alert('Fill all fields!');
        return;
    }

    let response;
    if (editingId) // Editing
        response = await updateReader(editingId, name, enterpriseId, year);
    else // Adding new book
        response = await addReader(name, enterpriseId, year);

    if (response.status === 'ok') {
        closeModal();
        await loadReaders(); // Reload list
    } 
    else 
        alert('Error' + response.message);
}

// Open edit form for particular reader
window.editReader = async function(id) {
    editingId = id;
    const response = await getReader(id);

    if (response.status === 'ok' && response.data.length > 0) {
        openModal(response.data[0]);
    } else {
        alert('Can\'t load reader data');
    }
};

// Delete reader with submit
window.deleteReaderById = async function(id) {
    const reader = allReaders.find(r => r.id === id);
    const name = reader ? reader.name : `#${id}`;
    if (!confirm(`Delete reader "${name}"?`))
        return;
    
    const response = await deleteReader(id);
    if (response.status === 'ok')
        await loadReaders(); // Reloading list
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