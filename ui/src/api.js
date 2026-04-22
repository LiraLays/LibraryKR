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
export async function addBook(name, authorId, year) {
    return await sendCommand(`ADD_BOOK|${name}|${authorId}|${year}`);
}

// Delete book
export async function deleteBook(id) {
    return await sendCommand(`DELETE_BOOK|${id}`);
}

// Authors
export async function getAuthors() {
    return await sendCommand("GET_AUTHORS");
}