require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH; // format "salt:hash"
const DATA_FILE = path.join(__dirname, 'data', 'personal.json');

if (!JWT_SECRET || !ADMIN_PASSWORD_HASH) {
  console.error('\nMissing JWT_SECRET or ADMIN_PASSWORD_HASH.');
  console.error('Run this first:  npm run set-password -- yourNewPassword\n');
  process.exit(1);
}

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ---- password check (no external hashing library needed) ----
function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const check = crypto.scryptSync(password, salt, 64).toString('hex');
  // timingSafeEqual needs equal-length buffers
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(check, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// ---- auth middleware ----
function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

// ---- routes ----
app.post('/api/login', (req, res) => {
  const { passcode } = req.body || {};
  if (!passcode || !verifyPassword(passcode, ADMIN_PASSWORD_HASH)) {
    return res.status(401).json({ error: 'Incorrect passcode' });
  }
  const token = jwt.sign({ user: 'john' }, JWT_SECRET, { expiresIn: '2h' });
  res.cookie('token', token, {
    httpOnly: true,                                   // JS on the page can't read it
    secure: process.env.NODE_ENV === 'production',     // requires HTTPS in production
    sameSite: 'strict',
    maxAge: 2 * 60 * 60 * 1000
  });
  res.json({ success: true });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

app.get('/api/personal', requireAuth, (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  res.json(data);
});

app.post('/api/personal', requireAuth, (req, res) => {
  const current = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const updated = { ...current, ...req.body };
  fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2));
  res.json({ success: true, data: updated });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
