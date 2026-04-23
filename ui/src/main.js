import '../src/style.css'
import '../src/styles/books.css'

import { initBooksPage } from "./pages/books.js";
import { initAuthorsPage } from "./pages/authors.js";
import { initReadersPage } from "./pages/readers.js";
import { initEnterprisesPage } from "./pages/enterprises.js";
import { initBookgroupsPage } from "./pages/bookgroups.js";
import { initPublishersPage } from "./pages/publishers.js";
import { initBookIssuesPage } from "./pages/bookissues.js";
import { initAccountsPage } from "./pages/accounts.js";
import { initEmployeesPage } from './pages/employees.js';
import { initLibrariesPage } from './pages/libraries.js';

document.getElementById('login-btn').addEventListener('click', async () => {
    const login = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    if (!login || !password) {
        alert('Enter login and password');
        return;
    }
    const response = await window.sendCommand(`LOGIN|${login}|${password}`);
    if (response.status === 'ok') {
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('app-section').classList.remove('hidden');
        // Loading books page by default
        initBooksPage();
    } else {
        alert("Incorrect login or password");
    }
});

document.getElementById('table-navigation')
    .addEventListener('click', (e) => {
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
            case 'authors':
                initAuthorsPage();
                break;
            case 'readers':
                initReadersPage();
                break;
            case 'bookissues':
                initBookIssuesPage();
                break;
            case 'enterprises':
                initEnterprisesPage();
                break;
            case 'bookgroups':
                initBookgroupsPage();
                break;
            case 'publishers':
                initPublishersPage();
                break;
            case 'accounts':
                initAccountsPage();
                break;
            case 'employees':
                initEmployeesPage();
                break;
            case 'libraries':
                initLibrariesPage();
                break;
            }
    });