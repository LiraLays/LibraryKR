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
export async function addBook(name, authorId, year, cost) {
    return await sendCommand(`ADD_BOOK|${name}|${authorId}|${year}|${cost}`);
}

export async function editBook(editingId, name, authorId, year, cost) {
    return await sendCommand(`UPDATE_BOOK|${editingId}|${name}|${authorId}|${year}|${cost}`);
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