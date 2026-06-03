// Creates the tables and seeds accounts.
// Exposed as initDb() so the server can run it on boot in production
// (handy on hosts where you don't have shell access), and also runnable
// directly via `npm run init-db` for local setup.
//
// The ADMIN account is driven by private env vars (ADMIN_EMAIL / ADMIN_PASSWORD)
// so the real admin login is NEVER stored in the public repo. Set those in your
// host's dashboard. The staff/student rows are low-risk demo logins.
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const useSsl = String(process.env.DB_SSL).toLowerCase() === 'true';
const sslOpt = useSsl ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined;
const dbName = process.env.DB_NAME || 'hostel_complaints';

const baseConn = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  ssl: sslOpt,
};

// Admin credentials come from the environment (private). Defaults are only for
// local development — in production you MUST set ADMIN_EMAIL + ADMIN_PASSWORD.
const OLD_PUBLIC_ADMIN = 'admin@hostel.com';
const admin = {
  name: process.env.ADMIN_NAME || 'System Admin',
  email: process.env.ADMIN_EMAIL || OLD_PUBLIC_ADMIN,
  password: process.env.ADMIN_PASSWORD || 'admin123',
  phone: process.env.ADMIN_PHONE || '+91 90000 00000',
};

async function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  // Best-effort: create the database if we have privilege to. On managed
  // cloud MySQL the database usually already exists, so a failure here is fine.
  try {
    const root = await mysql.createConnection(baseConn);
    await root.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await root.end();
  } catch (err) {
    console.log(`(Skipping CREATE DATABASE: ${err.message})`);
  }

  // Connect with the target database selected and apply the table schema.
  const conn = await mysql.createConnection({ ...baseConn, database: dbName, multipleStatements: true });

  console.log('Applying schema ...');
  await conn.query(schema);
  console.log('Schema applied.');

  // --- Admin (upsert from env, so rotating ADMIN_PASSWORD always takes effect) ---
  const adminHash = await bcrypt.hash(admin.password, 10);
  const [adminRows] = await conn.query('SELECT id FROM users WHERE email = ?', [admin.email]);
  if (adminRows.length > 0) {
    await conn.query(
      "UPDATE users SET name = ?, password = ?, phone = ?, role = 'admin' WHERE email = ?",
      [admin.name, adminHash, admin.phone, admin.email]
    );
    console.log(`Updated admin: ${admin.email}`);
  } else {
    await conn.query(
      "INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, 'admin', ?)",
      [admin.name, admin.email, adminHash, admin.phone]
    );
    console.log(`Seeded admin: ${admin.email}`);
  }
  // If a private admin email is configured, remove the old public default admin
  // so admin@hostel.com / admin123 can no longer be used.
  if (admin.email !== OLD_PUBLIC_ADMIN) {
    const [del] = await conn.query("DELETE FROM users WHERE email = ? AND role = 'admin'", [OLD_PUBLIC_ADMIN]);
    if (del.affectedRows > 0) console.log(`Removed old public admin: ${OLD_PUBLIC_ADMIN}`);
  }

  // --- Demo staff/student accounts (idempotent, low-risk) ---
  const seedUsers = [
    { name: 'Staff One', email: 'staff1@hostel.com', password: 'staff123', role: 'staff', phone: '+91 98765 43210' },
    { name: 'Staff Two', email: 'staff2@hostel.com', password: 'staff123', role: 'staff', phone: '+91 91234 56789' },
    { name: 'Demo Student', email: 'student@hostel.com', password: 'student123', role: 'student', room_number: 'A-101', phone: '+91 99887 76655' },
  ];

  for (const u of seedUsers) {
    const [rows] = await conn.query('SELECT id FROM users WHERE email = ?', [u.email]);
    if (rows.length > 0) {
      console.log(`Skipping existing user: ${u.email}`);
      continue;
    }
    const hash = await bcrypt.hash(u.password, 10);
    await conn.query(
      'INSERT INTO users (name, email, password, role, room_number, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [u.name, u.email, hash, u.role, u.room_number || null, u.phone || null]
    );
    console.log(`Seeded ${u.role}: ${u.email} (password: ${u.password})`);
  }

  await conn.end();
  console.log('Database initialization complete.');
}

module.exports = { initDb };

// Allow running directly: `node db/init.js` / `npm run init-db`
if (require.main === module) {
  initDb().catch((err) => {
    console.error('DB init failed:', err.message);
    process.exit(1);
  });
}
