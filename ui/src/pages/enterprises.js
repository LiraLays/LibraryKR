import { addEnterprise, updateEnterprise, deleteEnterprise, getEnterprise, getEnterprises } from '../api.js';

// Page status
let allEnterprises = []; // All enterprises loaded from server
let editingId = null;    // Id edited enterprise (null = add)

// Entry point
export async function initEnterprisesPage() {
    document.getElementById('current-table-name').textContent = 'Enterprises';

    renderTableHead(); // Rendering table head

    bindEvents();

    // Then load data
    await loadEnterprises();
}

// Loading enterprises
async function loadEnterprises() {
    const response = await getEnterprises();
    if (response.status === 'ok') {
        allEnterprises = response.data;
        renderTableBody(allEnterprises);
    } else {
        showError('Can\'t load enterprises: ' + response.message);
    }
}

// Render

// Drawing table head
function renderTableHead() {
    document.getElementById('table-head').innerHTML = `
        <th>ID</th>
        <th>Enterprise</th>
        <th>Actions</th>
    `;
}

// Filling tbody with book strings
function renderTableBody(enterprises) {
    const tbody = document.getElementById('table-body');
    if (!tbody)
        return;

    if (enterprises.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align:center; color:#999; padding:32px;">
                    Enterprises not found
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = enterprises
                          .map(enterprise => `
        <tr>
            <td>${enterprise.id}</td>
            <td>${enterprise.name}</td>
            <td>
                <button class="btn-edit" onclick="window.editEnterprise('${
                                   enterprise.id}')">
                    Изменить
                </button>
                <button class="btn-delete" onclick="window.deleteEnterpriseById('${
                                   enterprise.id}')">
                    Удалить
                </button>
            </td>
        </tr>
    `).join('');
}

// Modal window

// Filling #modal-fields
function renderModalFields(enterprise = null) {

    document.getElementById('modal-fields').innerHTML = `
    <label>Enterprise</label>
    <input type="text" id="enterprise-name"
           value="${enterprise ? enterprise.name : ''}"
           placeholder="Enterprise name" />
    `;
}

// Open modal window
function openModal(enterprise = null) {
    document.getElementById('modal-title').textContent =
        enterprise ? 'Edit enterprise' : 'Add enterprise';

    renderModalFields(enterprise);

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
        await saveEnterprise();
    };
}

// CRUD operations

// Save enterprise (add or update)
async function saveEnterprise() {
    const name = document.getElementById('enterprise-name').value.trim();

    // Simple validation
    if (!name) {
        alert('Fill all fields!');
        return;
    }

    let response;
    if (editingId) // Editing
        response = await updateEnterprise(editingId, name);
    else // Adding new book
        response = await addEnterprise(name);

    if (response.status === 'ok') {
        closeModal();
        await loadEnterprises(); // Reload list
    } 
    else 
        alert('Error' + response.message);
}

// Open edit form for particular enterprise
window.editEnterprise = async function(id) {
    editingId = id;
    const response = await getEnterprise(id);

    if (response.status === 'ok' && response.data.length > 0) {
        openModal(response.data[0]);
    } else {
        alert('Can\'t load enterprise data');
    }
};

// Delete enterprise with submit
window.deleteEnterpriseById = async function(id) {
    const enterprise = allEnterprises.find(e => e.id === id);
    const name = enterprise ? enterprise.name : `#${id}`;
    if (!confirm(`Delete enterprise "${name}"?`))
        return;
    
    const response = await deleteEnterprise(id);
    if (response.status === 'ok')
        await loadEnterprises(); // Reloading list
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