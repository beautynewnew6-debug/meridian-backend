const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const users = [];

app.get('/', (req, res) => {
  res.send('Meridian Backend is running');
});

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  if (users.find(u => u.email === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email already registered' });
  }
  const user = { name, email: email.toLowerCase(), password };
  users.push(user);
  res.json({ success: true, user: { name: user.name, email: user.email } });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email.toLowerCase() && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  res.json({ success: true, user: { name: user.name, email: user.email } });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server started on port ' + PORT);
});
