import { addPublisher, updatePublisher, deletePublisher, getPublisher, getPublishers } from '../api.js';

// Page status
let allPublishers = []; // All publishers loaded from server
let editingId = null;    // Id edited publisher (null = add)

// Entry point
export async function initPublishersPage() {
    document.getElementById('current-table-name').textContent = 'Publishers';

    renderTableHead(); // Rendering table head

    bindEvents();

    // Then load data
    await loadPublishers();
}

// Loading publishers
async function loadPublishers() {
    const response = await getPublishers();
    if (response.status === 'ok') {
        allPublishers = response.data;
        renderTableBody(allPublishers);
    } else {
        showError('Can\'t load publishers: ' + response.message);
    }
}

// Render

// Drawing table head
function renderTableHead() {
    document.getElementById('table-head').innerHTML = `
        <th>ID</th>
        <th>Publisher</th>
        <th>Actions</th>
    `;
}

// Filling tbody with book strings
function renderTableBody(publishers) {
    const tbody = document.getElementById('table-body');
    if (!tbody)
        return;

    if (publishers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align:center; color:#999; padding:32px;">
                    Publishers not found
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = publishers
                          .map(publisher => `
        <tr>
            <td>${publisher.id}</td>
            <td>${publisher.name}</td>
            <td>
                <button class="btn-edit" onclick="window.editPublisher('${
                                   publisher.id}')">
                    Изменить
                </button>
                <button class="btn-delete" onclick="window.deletePublisherById('${
                                   publisher.id}')">
                    Удалить
                </button>
            </td>
        </tr>
    `).join('');
}

// Modal window

// Filling #modal-fields
function renderModalFields(publisher = null) {

    document.getElementById('modal-fields').innerHTML = `
    <label>Publisher</label>
    <input type="text" id="publisher-name"
           value="${publisher ? publisher.name : ''}"
           placeholder="Publisher name" />
    `;
}

// Open modal window
function openModal(publisher = null) {
    document.getElementById('modal-title').textContent =
        publisher ? 'Edit publisher' : 'Add publisher';

    renderModalFields(publisher);

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
        await savePublisher();
    };
}

// CRUD operations

// Save publisher (add or update)
async function savePublisher() {
    const name = document.getElementById('publisher-name').value.trim();

    // Simple validation
    if (!name) {
        alert('Fill all fields!');
        return;
    }

    let response;
    if (editingId) // Editing
        response = await updatePublisher(editingId, name);
    else // Adding new book
        response = await addPublisher(name);

    if (response.status === 'ok') {
        closeModal();
        await loadPublishers(); // Reload list
    } 
    else 
        alert('Error' + response.message);
}

// Open edit form for particular publisher
window.editPublisher = async function(id) {
    editingId = id;
    const response = await getPublisher(id);

    if (response.status === 'ok' && response.data.length > 0) {
        openModal(response.data[0]);
    } else {
        alert('Can\'t load publisher data');
    }
};

// Delete publisher with submit
window.deletePublisherById = async function(id) {
    const publisher = allPublishers.find(e => e.id === id);
    const name = publisher ? publisher.name : `#${id}`;
    if (!confirm(`Delete publisher "${name}"?`))
        return;
    
    const response = await deletePublisher(id);
    if (response.status === 'ok')
        await loadPublishers(); // Reloading list
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