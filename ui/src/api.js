// Base function - sending command and return parsed JSON
async function sendCommand(command) {
    return await window.sendCommand(command);
}

// Books

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

// Authors
export async function getAuthors() {
    return await sendCommand("GET_AUTHORS");
}