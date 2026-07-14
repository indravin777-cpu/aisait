// server/index.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Root folder for user data (outside server folder, inside project root)
const USERS_ROOT = path.join(__dirname, '..', 'users');

// Ensure the users directory exists
if (!fs.existsSync(USERS_ROOT)) {
  fs.mkdirSync(USERS_ROOT, { recursive: true });
}

// Register route
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('Missing username or password');
  }
  const userDir = path.join(USERS_ROOT, username);
  if (fs.existsSync(userDir)) {
    return res.status(409).send('User already exists');
  }
  // Create user folder and store password in plain text (demo only)
  try {
    fs.mkdirSync(userDir, { recursive: true });
    fs.writeFileSync(path.join(userDir, 'password.txt'), password, 'utf8');
    return res.send('Registration successful');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const pwdPath = path.join(USERS_ROOT, username, 'password.txt');
  if (!fs.existsSync(pwdPath)) {
    return res.status(404).send('User not found');
  }
  const stored = fs.readFileSync(pwdPath, 'utf8');
  if (stored === password) {
    return res.send('Login successful');
  } else {
    return res.status(401).send('Invalid credentials');
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Auth server listening on http://localhost:${PORT}`));
