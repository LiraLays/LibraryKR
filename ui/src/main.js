import './style.css';

// Имитация данных от БД (так должен отвечать твой сервер)
const mockData = {
  books: [
    { id: 1, title: "Мастер и Маргарита", author: "Булгаков", year: 1967 },
    { id: 2, title: "1984", author: "Оруэлл", year: 1949 }
  ],
  authors: [
    { id: 1, name: "Михаил Булгаков", country: "СССР" },
    { id: 2, name: "Джордж Оруэлл", country: "Великобритания" }
  ]
};

function main() {
  const authSection = document.querySelector("#auth-section");
  const appSection = document.querySelector("#app-section");
  const tableBody = document.querySelector("#table-body");
  const tableHead = document.querySelector("#table-head");
  const tableNameDisplay = document.querySelector("#current-table-name"); 

  // Универсальная функция отрисовки
  function renderTable(tableName, data) {
    tableNameDisplay.textContent = `Таблица: ${tableName}`;
    tableHead.innerHTML = "";
    tableBody.innerHTML = "";

    if (!data || data.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='100%'>Нет данных</td></tr>";
      return;
    }

    // Генерация заголовков (ключи первого объекта в массиве)
    const headers = Object.keys(data[0]);
    headers.forEach(key => {
      const th = document.createElement("th");
      th.textContent = key.toUpperCase();
      tableHead.appendChild(th);
    });

    // Колонка для действий
    const actionTh = document.createElement("th");
    actionTh.textContent = "ДЕЙСТВИЯ";
    tableHead.appendChild(actionTh);

    // Генерация строк
    data.forEach(row => {
      const tr = document.createElement("tr");

      headers.forEach(key => {
        const td = document.createElement("td");
        td.textContent = row[key];
        tr.appendChild(td);
      });

      // Кнопки управления
      const actionsTd = document.createElement("td");
      actionsTd.innerHTML = `
      <button class="btn-edit" onclick="editRecord('${tableName}', '${row.id}')">✏️</button>
      <button class="btn-delete" onclick="deleteRecord('${tableName}', '${row.id}')">🗑️</button>
      `;
      tr.appendChild(actionsTd);
      tableBody.appendChild(tr);
    });
  }

  // 2. Обработка навигации по таблицам
  document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", (e) => {
      // Визуальное переключение в меню
      document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      const tableName = button.getAttribute("data-table");

      // Отправка запроса в C++
      if (window.ping) {
        window.ping(`GET_TABLE:${tableName}`);
      }

      // Пока сервера нет, данные из mockData для теста
      renderTable(tableName, mockData[tableName] || []);
    });
  });

  // 3. Логика входа
  document.querySelector("#login-btn").addEventListener("click", () => {
    const user = document.querySelector("#username").value;
    const pass = document.querySelector("#password").value;
    
    // Simple check
    if (user === "admin" && pass === "1234") {
      console.log("Пароль верный! Переключение экрана...");
      authSection.classList.add("hidden");
      appSection.classList.remove("hidden");

      renderTable("books", mockData.books);
    } else {
      alert("Неверные данные! Попробуйте admin / 1234");
    }
  });

  // 4. Модальное окно
  let currentMode = 'add';
  let currentTable = '';

  const modalOverlay = document.querySelector("#modal-overlay");
  const modalFields = document.querySelector("#modal-fields");
  const modalTitle = document.querySelector("#modal-title");
  const modalForm = document.querySelector("#modal-form");

  // Функция открытия модального окна
  window.openModal = (mode, table, data = null) => {
    currentMode = mode;
    currentTable = table;
    modalOverlay.classList.remove("hidden");
    modalTitle.textContent = mode === "add" ? `Добавить поля в ${table}` : `Правка записи #${data.id}`;
    
    modalFields.innerHTML = ""; // Очистка старых полей

    const fields = data ? Object.keys(data) : ['title', 'author', 'year'];

    fields.forEach(key => {
      if (key === 'id' && mode === 'edit') return;

      const container = document.createElement("div");
      container.className = "form-group";
      container.innerHTML = `
      <label>${key.toUpperCase()}</label>
      <input type="text" name="${key}" value="${data ? data[key] : ''}" required>
      `;
      modalFields.appendChild(container);
    });
  };

  const closeModal = () => modalOverlay.classList.add("hidden");
  document.querySelector("#close-modal").onclick = closeModal;
  document.querySelector("#cancel-btn").onclick = closeModal;

  // Отправка формы
  modalForm.onsubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(modalForm);
    const result = Object.fromEntries(formData.entries());

    if (window.ping) {
      const cmd = currentMode === 'add' ? 'INSERT' : 'UPDATE';
      window.ping(`${cmd}:${currentTable}:${JSON.stringify(result)}`);
    }

    console.log("Данные для отправки", result);
    closeModal();
  };

  document.querySelector("#add-record-btn").onclick = () => window.openModal('add', 'books');
}

window.editRecord = (table, id) => {
  const newVal = prompt(`Редактирование записи ID ${id} в таблице ${table}. Введите новое значение:`);
  if (newVal && window.ping) window.ping(`UPDATE:${table}:${id}:${newVal}`);
};

window.deleteRecord = (table, id) => {
  if (confirm(`Удалить запись ID ${id}?`)) {
    if (window.ping) window.ping(`DELETE:${table}:${id}`);
  }
};

window.addEventListener('DOMContentLoaded', main);