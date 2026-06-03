const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register  -> student self-registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, room_number, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, room_number, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hash, 'student', room_number || null, phone || null]
    );

    const user = { id: result.insertId, name, email, role: 'student' };
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// POST /api/auth/login  -> any role
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// GET /api/auth/me  -> current user from token
router.get('/me', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, room_number, phone FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ user: rows[0] });
  } catch (err) {
    console.error('me error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/auth/me  -> update own profile (name, email, phone, room)
router.put('/me', authenticate, async (req, res) => {
  try {
    const { name, email, phone, room_number } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Ensure the new email isn't taken by someone else.
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id <> ?',
      [email, req.user.id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'That email is already in use' });
    }

    await pool.query(
      'UPDATE users SET name = ?, email = ?, phone = ?, room_number = ? WHERE id = ?',
      [name, email, phone || null, room_number || null, req.user.id]
    );

    const [rows] = await pool.query(
      'SELECT id, name, email, role, room_number, phone FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json({ user: rows[0] });
  } catch (err) {
    console.error('update profile error:', err);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

module.exports = router;
