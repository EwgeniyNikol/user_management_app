"""
User Management API - Flask + SQLite
"""

from flask import Flask, request, jsonify, g
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

DATABASE = os.path.join(os.path.dirname(__file__), "database.db")


def get_db():
    """Получить соединение с БД."""
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception):
    """Закрыть соединение с БД."""
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    """Инициализация БД и тестовых данных."""
    with app.app_context():
        db = get_db()
        db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE
            )
        """)
        count = db.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        if count == 0:
            users = [
                ("Иван Петров", "ivan@example.com"),
                ("Мария Смирнова", "maria@example.com"),
                ("Алексей Иванов", "alex@example.com"),
            ]
            db.executemany(
                "INSERT INTO users (name, email) VALUES (?, ?)", users
            )
        db.commit()


# ---- Эндпоинты ----

@app.route("/users", methods=["GET"])
def get_users():
    """Получить список всех пользователей."""
    db = get_db()
    users = db.execute("SELECT * FROM users").fetchall()
    return jsonify([dict(user) for user in users])


@app.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    """Получить пользователя по ID."""
    db = get_db()
    user = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if user is None:
        return jsonify({"error": "Пользователь не найден"}), 404
    return jsonify(dict(user))


@app.route("/users", methods=["POST"])
def create_user():
    """Создать нового пользователя."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Нет данных"}), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()

    if not name or not email:
        return jsonify({"error": "Имя и email обязательны"}), 400

    db = get_db()
    try:
        cursor = db.execute(
            "INSERT INTO users (name, email) VALUES (?, ?)", (name, email)
        )
        db.commit()
        user = db.execute(
            "SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return jsonify(dict(user)), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email уже существует"}), 409


@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    """Удалить пользователя по ID."""
    db = get_db()
    user = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if user is None:
        return jsonify({"error": "Пользователь не найден"}), 404
    db.execute("DELETE FROM users WHERE id = ?", (user_id,))
    db.commit()
    return jsonify({"message": "Пользователь удалён"}), 200


if __name__ == "__main__":
    init_db()
    app.run(debug=True)