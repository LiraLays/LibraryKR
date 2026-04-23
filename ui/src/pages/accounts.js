import { addAccount, updateAccount, deleteAccount, getEmployees, getAccount, getAccounts } from '../api.js';

// Page status
let allAccounts = [];    // All books loaded from server
let allEmployees = [];   // All authors for drop-down list
let editingId = null; // Id edited book (null = add)

// Entry point
export async function initAccountsPage() {
    document.getElementById('current-table-name').textContent = 'Accounts';

    renderTableHead(); // Rendering table head

    bindEvents();

    // Then load data
    await loadEmployees();
    await loadAccounts();
}

// Loading accounts
async function loadAccounts() {
    const response = await getAccounts();
    if (response.status === 'ok') {
        allAccounts = response.data;
        renderTableBody(allAccounts);
    } else {
        showError('Can\'t load accounts: ' + response.message);
    }
}

// Loading employees
async function loadEmployees() {
    const response = await getEmployees();
    if (response.status === 'ok') {
        allEmployees = response.data;
    }
}

// Render

// Drawing table head
function renderTableHead() {
    document.getElementById('table-head').innerHTML = `
        <th>ID</th>
        <th>Employee</th>
        <th>Login</th>
        <th>Password</th>
    `;
}

// Filling tbody with book strings
function renderTableBody(accounts) {
    const tbody = document.getElementById('table-body');
    if (!tbody)
        return;

    if (accounts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; color:#999; padding:32px;">
                    Accounts not found
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = accounts.map(account => `
        <tr>
            <td>${account.id}</td>
            <td>${account.name}</td>
            <td>${account.enterprise}</td>
            <td>${account.workphone}</td>
            <td>
                <button class="btn-edit" onclick="window.editAccount('${
                                   account.id}')">
                    Edit
                </button>
                <button class="btn-delete" onclick="window.deleteAccountById('${
                                   account.id}')">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Modal window

// Filling #modal-fields
function renderModalFields(account = null) {
    // Building drop-down list
    const employeesOptions = allEmployees.map(e =>
        `<option value="${e.id}" ${account && account.name == e.name ? 'selected' : ''}>
            ${e.name}
        </option>`
    ).join('');

    document.getElementById('modal-fields').innerHTML = `
    <label>Employee</label>
    <select id="account-employee-select">
        <option value="">Select employee...</option>
        ${employeesOptions}
    </select>

    <label>Login</label>
    <input type="text" id="account-login"
           value="${account ? account.enterprise : ''}"
           placeholder="Login" />
    
    <label>Password</label>
    <input type="text" id="account-password"
           value="${account ? account.workphone : ''}"
           placeholder="Password" />  
    `;
}

// Open modal window
function openModal(account = null) {
    document.getElementById('modal-title').textContent =
        account ? 'Edit account' : 'Add account';

    renderModalFields(account);

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
        await saveAccount();
    };
}

// CRUD operations

// Save account (add or update)
async function saveAccount() {
    const employee_id =
        document.getElementById('account-employee-select').value;
    const login = document.getElementById('account-login').value.trim();
    const password = document.getElementById('account-password').value.trim();

    // Simple validation
    if (!employee_id || !login || !password) {
        alert('Fill all fields!');
        return;
    }

    let response;
    if (editingId) // Editing
        response = await updateAccount(editingId, employee_id, login, password);
    else // Adding 
        response = await addAccount(employee_id, login, password);

    if (response.status === 'ok') {
        closeModal();
        await loadAccounts(); // Reload list
    } 
    else 
        alert('Error' + response.message);
}

// Open edit form for particular account
window.editAccount = async function(id) {
    editingId = id;
    const response = await getAccount(id);

    if (response.status === 'ok' && response.data.length > 0) {
        openModal(response.data[0]);
    } else {
        alert('Can\'t load account data');
    }
};

// Delete account with submit
window.deleteAccountById = async function(id) {
    const account = allAccounts.find(ac => ac.id === id);
    const name = account ? account.name : `#${id}`;
    if (!confirm(`Delete account "${name}"?`))
        return;
    
    const response = await deleteAccount(id);
    if (response.status === 'ok')
        await loadAccounts(); // Reloading list
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