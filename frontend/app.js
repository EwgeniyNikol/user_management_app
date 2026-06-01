const API_URL = 'https://user-management-api-7n9t.onrender.com';

const elements = {
    tbody: document.getElementById('usersTableBody'),
    form: document.getElementById('addUserForm'),
    name: document.getElementById('nameInput'),
    email: document.getElementById('emailInput'),
    message: document.getElementById('message'),
    modalBody: document.getElementById('modalBody'),
    modal: new bootstrap.Modal(document.getElementById('userModal'))
};

const showMessage = (text, isError = false) => {
    elements.message.innerHTML = `
        <div class="alert alert-${isError ? 'danger' : 'success'} alert-dismissible fade show" role="alert">
            ${text}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`;
};

const fetchJson = (url, options = {}) =>
    fetch(url, options).then(response =>
        response.json().then(data => ({ ok: response.ok, status: response.status, data }))
    );

const loadUsers = () => {
    fetchJson(`${API_URL}/users`)
        .then(({ ok, data }) => {
            if (!ok) throw new Error('Ошибка загрузки');
            renderUsers(data);
        })
        .catch(() => {
            elements.tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Ошибка загрузки данных</td></tr>';
        });
};

const renderUsers = (users) => {
    if (!users.length) {
        elements.tbody.innerHTML = '<tr><td colspan="4" class="text-center">Нет пользователей</td></tr>';
        return;
    }

    elements.tbody.innerHTML = users
        .map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name} <button class="btn btn-sm btn-link text-secondary copy-btn p-0 ms-1" data-copy="${user.name}" title="Копировать имя">${icons.copy}</button></td>
                <td>${user.email} <button class="btn btn-sm btn-link text-secondary copy-btn p-0 ms-1" data-copy="${user.email}" title="Копировать email">${icons.copy}</button></td>
                <td>
                    <button class="btn btn-sm btn-info details-btn" data-id="${user.id}">Подробнее</button>
                    <button class="btn btn-sm btn-link text-danger delete-btn" data-id="${user.id}" title="Удалить">
                        ${icons.trash}
                    </button>
                </td>
            </tr>`)
        .join('');

    document.querySelectorAll('.details-btn').forEach(btn =>
        btn.addEventListener('click', () => showUserDetails(btn.dataset.id))
    );

    document.querySelectorAll('.delete-btn').forEach(btn =>
        btn.addEventListener('click', () => deleteUser(btn.dataset.id))
    );

    document.querySelectorAll('.copy-btn').forEach(btn =>
        btn.addEventListener('click', function () {
            navigator.clipboard.writeText(this.dataset.copy).then(() => {
                this.innerHTML = icons.check;
                setTimeout(() => {
                    this.innerHTML = icons.copy;
                }, 1500);
            });
        })
    );
};

const showUserDetails = (userId) => {
    elements.modalBody.innerHTML = 'Загрузка...';
    elements.modal.show();

    fetchJson(`${API_URL}/users/${userId}`)
        .then(({ ok, data }) => {
            if (!ok) throw new Error('Пользователь не найден');
            elements.modalBody.innerHTML = `
                <p><strong>ID:</strong> ${data.id}</p>
                <p><strong>Имя:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>`;
        })
        .catch(() => {
            elements.modalBody.innerHTML = '<p class="text-danger">Ошибка загрузки данных</p>';
        });
};

const addUser = (name, email) => {
    fetchJson(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
    })
        .then(({ ok, data }) => {
            if (!ok) throw new Error(data.error || 'Ошибка добавления');
            showMessage(`Пользователь "${data.name}" успешно добавлен!`);
            elements.form.reset();
            loadUsers();
        })
        .catch(error => showMessage(error.message, true));
};

const deleteUser = (userId) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    fetchJson(`${API_URL}/users/${userId}`, { method: 'DELETE' })
        .then(({ ok, data }) => {
            if (!ok) throw new Error(data.error || 'Ошибка удаления');
            showMessage('Пользователь удалён!');
            loadUsers();
        })
        .catch(error => showMessage(error.message, true));
};

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = elements.name.value.trim();
    const email = elements.email.value.trim();

    if (!name || name.length < 2) {
        showMessage('Имя должно содержать минимум 2 символа', true);
        return;
    }

    if (!validateEmail(email)) {
        showMessage('Введите корректный email', true);
        return;
    }

    addUser(name, email);
});

loadUsers();