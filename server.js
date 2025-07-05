const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Обслуговування статичних файлів
app.use(express.static(__dirname));

// Спеціальне обслуговування component.js як модуля
app.get('/component.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.sendFile(path.join(__dirname, 'component.js'));
});

// Завантаження бази даних
function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

// Збереження бази даних
function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// API маршрути
app.get('/api/user/:id', (req, res) => {
  const db = loadDB();
  const user = db.users[req.params.id];
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.post('/api/user/:id/save', (req, res) => {
  const db = loadDB();
  const user = db.users[req.params.id];
  if (!user) return res.status(404).json({ error: 'User not found' });
  const data = req.body;
  db.users[req.params.id] = { ...user, ...data };
  saveDB(db);
  res.json({ success: true });
});

app.post('/api/user/:id/click', (req, res) => {
  const db = loadDB();
  const user = db.users[req.params.id];
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.energy <= 0) return res.status(400).json({ error: 'No energy' });
  const earnedCoins = Math.floor(user.tapPower * (user.comboMultiplier || 1));
  user.coins += earnedCoins;
  user.experience += earnedCoins;
  user.energy -= 1;
  user.lastOfflineTime = Date.now();
  saveDB(db);
  res.json({ coins: user.coins, experience: user.experience, energy: user.energy });
});

// Головна сторінка (в кінці)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🎮 Game available at: http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${__dirname}`);
}); 