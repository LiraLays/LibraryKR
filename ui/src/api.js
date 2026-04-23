// Base function - sending command and return parsed JSON
async function sendCommand(command) {
    return await window.sendCommand(command);
}

// ----------------------------------------------- Books -----------------------------------------------

// Get all books
// Return: { status: "ok", data: [{id, name, author, year}, ...] }
export async function getBooks() {
    return await sendCommand("GET_BOOKS");
}

// Get one book by id
// Return: { status: "ok", data: [{id, name, author, year}, ...] }
export async function getBook(id) {
    return await sendCommand(`GET_BOOK|${id}`);
}

// Add book
// Return: { status: "ok", message: "..."}
export async function addBook(author_id, group_id, name, year, publisher_id, cost) {
    return await sendCommand(`ADD_BOOK|${author_id}|${group_id}|${name}|${year}|${publisher_id}|${cost}`);
}

export async function editBook(editingId, author_id, group_id, name, year,
                               publisher_id, cost) {
    return await sendCommand(`UPDATE_BOOK|${editingId}|${author_id}|${group_id}|${name}|${year}|${publisher_id}|${cost}`);
}

// Delete book
export async function deleteBook(id) {
    return await sendCommand(`DELETE_BOOK|${id}`);
}
// ----------------------------------------------- Authors -----------------------------------------------

// Authors
export async function getAuthors() { 
    return await sendCommand("GET_AUTHORS");
}

// Add author
export async function addAuthor(name) {
    return await sendCommand(`ADD_AUTHOR|${name}`);
}

// Edit author
export async function updateAuthor(id, name) {
    return await sendCommand(`UPDATE_AUTHOR|${id}|${name}`);
}

// Delete author
export async function deleteAuthor(id) {
    return await sendCommand(`DELETE_AUTHOR|${id}`);
}

// ----------------------------------------------- Readers -----------------------------------------------

// Get readers
export async function getReaders() { return await sendCommand("GET_READERS"); }

// Get reader
export async function getReader(id) {
    return await sendCommand(`GET_READER|${id}`);
}

// Add reader
export async function addReader(name, enterpriseId, year) {
    return await sendCommand(`ADD_READER|${name}|${enterpriseId}|${year}`);
}

// Edit reader
export async function updateReader(id, name, enterpriseId, year) {
    return await sendCommand(`UPDATE_READER|${id}|${name}|${enterpriseId}|${year}`);
}

// Delete reader
export async function deleteReader(id) {
    return await sendCommand(`DELETE_READER|${id}`);
}

// ----------------------------------------------- Enterprise -----------------------------------------------

// Get enterprises
export async function getEnterprises() {
    return await sendCommand("GET_ENTERPEISES");
}

// Get enterprise
export async function getEnterprise(id) {
    return await sendCommand(`GET_ENTERPEISE|${id}`);
}

// Add enterprise
export async function addEnterprise(name) {
    return await sendCommand(`ADD_ENTERPEISE|${name}`);
}

// Edit enterprise
export async function updateEnterprise(id, name) {
    return await sendCommand(
        `UPDATE_ENTERPEISE|${id}|${name}`);
}

// Delete enterprise
export async function deleteEnterprise(id) {
    return await sendCommand(`DELETE_ENTERPEISE|${id}`);
}

// ----------------------------------------------- Bookgroup -----------------------------------------------

// Get bookgroups
export async function getBookgroups() {
    return await sendCommand("GET_BOOKGROUPS");
}

// Get bookgroup
export async function getBookgroup(id) {
    return await sendCommand(`GET_BOOKGROUP|${id}`);
}

// Add bookgroup
export async function addBookgroup(name) {
    return await sendCommand(`ADD_BOOKGROUP|${name}`);
}

// Edit bookgroup
export async function updateBookgroup(id, name) {
    return await sendCommand(`UPDATE_BOOKGROUP|${id}|${name}`);
}

// Delete bookgroup
export async function deleteBookgroup(id) {
    return await sendCommand(`DELETE_BOOKGROUP|${id}`);
}

// ----------------------------------------------- Publishers -----------------------------------------------
export async function getPublishers() {
    return await sendCommand("GET_PUBLISHERS");
}

// Get publisher
export async function getPublisher(id) {
    return await sendCommand(`GET_PUBLISHER|${id}`);
}

// Add publisher
export async function addPublisher(name) {
    return await sendCommand(`ADD_PUBLISHER|${name}`);
}

// Edit publisher
export async function updatePublisher(id, name) {
    return await sendCommand(`UPDATE_PUBLISHER|${id}|${name}`);
}

// Delete publisher
export async function deletePublisher(id) {
    return await sendCommand(`DELETE_PUBLISHER|${id}`);
}

// ----------------------------------------------- Book issues -----------------------------------------------
export async function getBookIssues() {
    return await sendCommand("GET_BOOKISSUES");
}

// Get BookIssue
export async function getBookIssue(id) {
    return await sendCommand(`GET_BOOKISSUE|${id}`);
}

// Add BookIssue
export async function addBookIssue(client_id, book_id, issuedate, duedate, returndate) {
    return await sendCommand(
        `ADD_BOOKISSUE|${client_id}|${book_id}|${issuedate}|${duedate}|${returndate}`);
}

// Edit BookIssue
export async function updateBookIssue(editingId, client_id, book_id, issuedate, duedate, returndate) {
    return await sendCommand(`UPDATE_BOOKISSUE|${editingId}|${client_id}|${
        book_id}|${issuedate}|${duedate}|${returndate}`);
}

// Delete BookIssue
export async function deleteBookIssue(id) {
    return await sendCommand(`DELETE_BOOKISSUE|${id}`);
}

// ----------------------------------------------- Library -----------------------------------------------
export async function getLibraries() {
    return await sendCommand("GET_LIBRARIES");
}

// Get BookIssue
export async function getLibrary(id) {
    return await sendCommand(`GET_LIBRARY|${id}`);
}

// Add BookIssue
export async function addLibrary(name, adress) {
    return await sendCommand(
        `ADD_LIBRARY|${name}|${adress}`);
}

// Edit BookIssue
export async function updateLibrary(editingId, name, adress) {
    return await sendCommand(`UPDATE_LIBRARY|${editingId}|${name}|${adress}`);
}

// Delete BookIssue
export async function deleteLibrary(id) {
    return await sendCommand(`DELETE_LIBRARY|${id}`);
}

// ----------------------------------------------- Employee -----------------------------------------------
export async function getEmployees() {
    return await sendCommand("GET_EMPLOYEES");
}

// Get BookIssue
export async function getEmployee(id) {
    return await sendCommand(`GET_EMPLOYEE|${id}`);
}

// Add BookIssue
export async function addEmployee(name, position, library_id, phone) {
    return await sendCommand(`ADD_EMPLOYEE|${name}|${position}|${library_id}|${
        phone}`);
}

// Edit BookIssue
export async function updateEmployee(editingId, name, position, library_id,
                                     phone) {
    return await sendCommand(`UPDATE_EMPLOYEE|${editingId}|${name}|${
        position}|${library_id}|${phone}`);
}

// Delete BookIssue
export async function deleteEmployee(id) {
    return await sendCommand(`DELETE_EMPLOYEE|${id}`);
}

// ----------------------------------------------- Account -----------------------------------------------
export async function getAccounts() {
    return await sendCommand("GET_ACCOUNTS");
}

// Get BookIssue
export async function getAccount(id) {
    return await sendCommand(`GET_ACCOUNT|${id}`);
}

// Add BookIssue
export async function addAccount(employee_id, login, password) {
    return await sendCommand(`ADD_ACCOUNT|${employee_id}|${login}|${password}`);
}

// Edit BookIssue
export async function updateAccount(editingId, employee_id, login, password) {
    return await sendCommand(
        `UPDATE_ACCOUNT|${editingId}|${employee_id}|${login}|${password}`);
}

// Delete BookIssue
export async function deleteAccount(id) {
    return await sendCommand(`DELETE_ACCOUNT|${id}`);
}
