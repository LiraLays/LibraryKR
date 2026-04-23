import { addEmployee, updateEmployee, deleteEmployee, getLibraries, getEmployee, getEmployees } from '../api.js';

// Page status
let allEmployees = [];    // All books loaded from server
let allLibraries = [];    // All authors for drop-down list
let editingId = null; // Id edited book (null = add)

// Entry point
export async function initEmployeesPage() {
    document.getElementById('current-table-name').textContent = 'Employees';

    renderTableHead(); // Rendering table head

    bindEvents();

    // Then load data
    await loadLibraries();
    await loadEmployees();
}

// Loading data
async function loadEmployees() {
    const response = await getEmployees();
    if (response.status === 'ok') {
        allEmployees = response.data;
        renderTableBody(allEmployees);
    } else {
        showError('Can\'t load employees: ' + response.message);
    }
}

// Loading authors
async function loadLibraries() {
    const response = await getLibraries();
    if (response.status === 'ok') {
        allLibraries = response.data;
    }
}

// Render

// Drawing table head
function renderTableHead() {
    document.getElementById('table-head').innerHTML = `
        <th>ID</th>
        <th>Name</th>
        <th>Position</th>
        <th>Libary</th>
        <th>Phone</th>
    `;
}

// Filling tbody with book strings
function renderTableBody(employees) {
    const tbody = document.getElementById('table-body');
    if (!tbody)
        return;

    if (employees.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; color:#999; padding:32px;">
                    Employees not found
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = employees
                          .map(employee => `
        <tr>
            <td>${employee.id}</td>
            <td>${employee.name}</td>
            <td>${employee.position}</td>
            <td>${employee.libraryname}</td>
            <td>${employee.phone}</td>
            <td>
                <button class="btn-edit" onclick="window.editEmployee('${
                                   employee.id}')">
                    Edit
                </button>
                <button class="btn-delete" onclick="window.deleteEmployeeById('${
                                   employee.id}')">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Modal window

// Filling #modal-fields
function renderModalFields(employee = null) {
    // Building drop-down list
    const libraryOptions = allLibraries.map(l =>
        `<option value="${l.id}" ${employee && employee.libraryname == l.name ? 'selected' : ''}>
            ${l.name}
        </option>`
    ).join('');

    document.getElementById('modal-fields').innerHTML = `
    <label>Name</label>
    <input type="text" id="employee-name"
           value="${employee ? employee.name : ''}"
           placeholder="Employee name" />
    
    <label>Position</label>
    <input type="text" id="employee-position"
           value="${employee ? employee.position : ''}"
           placeholder="Employee position" />
           
    <label>Library</label>
    <select id="employee-library-select">
        <option value="">Select library...</option>
        ${libraryOptions}
    </select>
    
    <label>Phone</label>
    <input type="number" id="employee-phone"
           value="${employee ? employee.phone : ''}"
           placeholder="Phone number" min="70000000000" max="89999999999" />  
    `;
}

// Open modal window
function openModal(employee = null) {
    document.getElementById('modal-title').textContent =
        employee ? 'Edit employee' : 'Add employee';

    renderModalFields(employee);

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
        await saveEmployee();
    };
}

// CRUD operations

// Save employee (add or update)
async function saveEmployee() {
    const name = document.getElementById('employee-name').value.trim();
    const position = document.getElementById('employee-position').value.trim();
    const library_id =
        document.getElementById('employee-library-select').value;
    const phone = document.getElementById('employee-phone').value.trim();

    // Simple validation
    if (!name || !position || !library_id || !phone) {
        alert('Fill all fields!');
        return;
    }

    let response;
    if (editingId) // Editing
        response =
            await updateEmployee(editingId, name, position, library_id, phone);
    else // Adding 
        response = await addEmployee(name, position, library_id, phone);

    if (response.status === 'ok') {
        closeModal();
        await loadEmployees(); // Reload list
    } 
    else 
        alert('Error' + response.message);
}

// Open edit form for particular employee
window.editEmployee = async function(id) {
    editingId = id;
    const response = await getEmployee(id);

    if (response.status === 'ok' && response.data.length > 0) {
        openModal(response.data[0]);
    } else {
        alert('Can\'t load employee data');
    }
};

// Delete employee with submit
window.deleteEmployeeById = async function(id) {
    const employee = allEmployees.find(emp => emp.id === id);
    const name = employee ? employee.name : `#${id}`;
    if (!confirm(`Delete employee "${name}"?`))
        return;
    
    const response = await deleteEmployee(id);
    if (response.status === 'ok')
        await loadEmployees(); // Reloading list
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