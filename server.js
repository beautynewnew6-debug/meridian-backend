const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join('/tmp', 'data.json');

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {}
  return { users: [], userData: {} };
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
  } catch (e) {}
}

app.post('/api/register', (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  const data = loadData();
  if (data.users.find(u => u.email === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email already registered' });
  }
  const user = { id: Date.now().toString(), name, email: email.toLowerCase(), password, phone: phone || '' };
  data.users.push(user);
  data.userData[user.email] = { crypto: {}, stocks: {} };
  saveData(data);
  res.json({ success: true, user: { name: user.name, email: user.email } });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const data = loadData();
  const user = data.users.find(u => u.email === email.toLowerCase() && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  res.json({ success: true, user: { name: user.name, email: user.email, id: user.id } });
});

app.get('/api/userdata/:email', (req, res) => {
  const data = loadData();
  res.json(data.userData[req.params.email] || { crypto: {}, stocks: {} });
});

app.post('/api/userdata/:email', (req, res) => {
  const data = loadData();
  data.userData[req.params.email] = req.body;
  saveData(data);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Backend running on port ${PORT}`));
