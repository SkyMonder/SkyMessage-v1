const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client')));

const db = new sqlite3.Database('./db.sqlite');

// Создание таблиц
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user INTEGER,
    to_user INTEGER,
    text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Регистрация
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  db.run('INSERT INTO users(username, password) VALUES (?, ?)', [username, password], function(err) {
    if(err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID, username });
  });
});

// Логин
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if(err) return res.status(500).json({ error: err.message });
    if(!row) return res.status(400).json({ error: 'Неверный логин или пароль' });
    res.json({ id: row.id, username: row.username });
  });
});

// Поиск пользователей
app.get('/api/users', (req, res) => {
  const q = req.query.search || '';
  db.all('SELECT id, username FROM users WHERE username LIKE ?', [`%${q}%`], (err, rows) => {
    if(err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Отправка сообщений
app.post('/api/messages', (req, res) => {
  const { from, to, text } = req.body;
  db.run('INSERT INTO messages(from_user, to_user, text) VALUES (?, ?, ?)', [from, to, text], function(err) {
    if(err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// Получение сообщений между пользователями
app.get('/api/messages', (req, res) => {
  const { user1, user2 } = req.query;
  db.all(
    `SELECT * FROM messages WHERE 
     (from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?) ORDER BY created_at`,
    [user1, user2, user2, user1],
    (err, rows) => {
      if(err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.listen(10000, () => console.log('Server running on port 10000'));

});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
