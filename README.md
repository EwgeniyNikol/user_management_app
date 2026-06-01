![Lint](https://github.com/EwgeniyNikol/user_management_app/actions/workflows/lint.yml/badge.svg)

# User Management App

Простое приложение для управления списком пользователей. Можно смотреть, добавлять и удалять.

## Что использовал

Бэкенд написан на Flask, данные храню в SQLite. Фронтенд на чистом JS с Bootstrap для стилей.

## Что умеет

- Показывать список всех пользователей в таблице
- Смотреть подробную информацию в модальном окне
- Добавлять новых пользователей через форму
- Удалять с подтверждением
- Копировать имя и email одним кликом
- Проверяет правильность email при добавлении

## Как запустить у себя

Клонируй репозиторий и открой два терминала в папке проекта.

Сначала бэкенд:
Ввод в терминал по одной команде:
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
python backend/app.py

Фронтенд в отдельном терминале по одной команде:
npm install
npx serve .

И открываешь http://localhost:3000

## Ссылки

- Фронтенд: https://ewgeniynikol.github.io/user_management_app/
- Бэкенд: https://user-management-api-7n9t.onrender.com
