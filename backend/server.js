const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db/pool');
const { initDb } = require('./db/init');
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const adminRoutes = require('./routes/admin');
const staffRoutes = require('./routes/staff');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected', message: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);

// Unknown API routes -> JSON 404.
app.use('/api', (req, res) => res.status(404).json({ message: 'Route not found' }));

// In production, serve the built React app and let the client router handle
// any non-API path (so a shared link to /admin, /track, etc. works on refresh).
// Skipped in local dev where the Vite server (port 5173) serves the UI instead.
const clientDir = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(path.join(clientDir, 'index.html'))) {
  app.use(express.static(clientDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDir, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

async function start() {
  // On managed hosts there's often no shell to run migrations, so optionally
  // create tables + seed accounts on boot. Idempotent, so it's safe to repeat.
  if (String(process.env.INIT_DB_ON_BOOT).toLowerCase() === 'true') {
    try {
      await initDb();
    } catch (err) {
      console.error('DB init on boot failed:', err.message);
    }
  }
  app.listen(PORT, () => {
    console.log(`Hostel Complaint app running on http://localhost:${PORT}`);
  });
}

start();
