import '../src/style.css' // или правильный путь до твоих css файлов
import '../src/styles/books.css'

import {initBooksPage} from "./pages/books.js";

document.getElementById('login-btn').addEventListener('click', async () => {
    const login = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!login || !password) {
        alert('Enter login and password');
        return;
    }

    const raw = await window.sendCommand(`LOGIN|${login}|${password}`);
    console.log('Raw login response:', raw); // ← добавь эту строку
    const response = JSON.parse(raw);
    console.log('Parsed response:', JSON.stringify(response)); // ← и эту

    if (response.status === 'ok') {
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('app-section').classList.remove('hidden');

        // Loading books page by default
        initBooksPage();
    } else {
        alert("Incorrect login or password");
    }
});

document.getElementById('table-navigation').addEventListener('click', (e) => {
    if (!e.target.matches('.nav-item'))
        return;

    // Clear all active
    document.querySelectorAll('.nav-item')
        .forEach(btn => btn.classList.remove('active'));

    // Making active clicked
    e.target.classList.add('active');

    // Loading needed page
    const table = e.target.dataset.table;
    switch (table) {
    case 'books':
        initBooksPage();
        break;
    }
});

// Simple router - show desired page
function navigate(page) {
    switch (page) {
    case 'books':
        initBooksPage();
        break;
    }
}

navigate('books');