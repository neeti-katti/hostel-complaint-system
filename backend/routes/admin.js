const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes here require an admin.
router.use(authenticate, authorize('admin'));

// GET /api/admin/complaints  -> all complaints (optional ?status= & ?category=)
router.get('/complaints', async (req, res) => {
  try {
    const { status, category } = req.query;
    const where = [];
    const params = [];
    if (status) { where.push('c.status = ?'); params.push(status); }
    if (category) { where.push('c.category = ?'); params.push(category); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT c.*, u.name AS student_name, u.room_number, s.name AS staff_name
         FROM complaints c
         JOIN users u ON u.id = c.student_id
         LEFT JOIN users s ON s.id = c.assigned_staff_id
         ${whereSql}
        ORDER BY c.created_at DESC`,
      params
    );
    res.json({ complaints: rows });
  } catch (err) {
    console.error('admin list error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/stats  -> dashboard summary counts
router.get('/stats', async (req, res) => {
  try {
    const [[totals]] = await pool.query(
      `SELECT
         COUNT(*) AS total,
         SUM(status = 'Pending') AS pending,
         SUM(status = 'In Progress') AS in_progress,
         SUM(status = 'Resolved') AS resolved
       FROM complaints`
    );
    res.json({ stats: totals });
  } catch (err) {
    console.error('admin stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/staff  -> staff members with performance metrics
router.get('/staff', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone,
              COUNT(c.id) AS total_assigned,
              SUM(c.status = 'Resolved') AS resolved,
              SUM(c.status = 'In Progress') AS active
         FROM users u
         LEFT JOIN complaints c ON c.assigned_staff_id = u.id
        WHERE u.role = 'staff'
        GROUP BY u.id, u.name, u.email, u.phone
        ORDER BY u.name`
    );
    res.json({ staff: rows });
  } catch (err) {
    console.error('admin staff error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/staff  -> add a new staff member
router.post('/staff', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
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
      "INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, 'staff', ?)",
      [name, email, hash, phone || null]
    );
    res.status(201).json({
      message: 'Staff member added',
      staff: { id: result.insertId, name, email, phone: phone || null },
    });
  } catch (err) {
    console.error('admin add staff error:', err);
    res.status(500).json({ message: 'Server error while adding staff' });
  }
});

// DELETE /api/admin/staff/:id  -> remove a staff member
// (their assigned complaints are released back to unassigned via ON DELETE SET NULL)
router.delete('/staff/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM users WHERE id = ? AND role = 'staff'",
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json({ message: 'Staff member removed' });
  } catch (err) {
    console.error('admin remove staff error:', err);
    res.status(500).json({ message: 'Server error while removing staff' });
  }
});

// PUT /api/admin/complaints/:id/assign  -> assign complaint to a staff member
router.put('/complaints/:id/assign', async (req, res) => {
  try {
    const { staff_id } = req.body;
    if (!staff_id) {
      return res.status(400).json({ message: 'staff_id is required' });
    }

    const [staff] = await pool.query(
      "SELECT id FROM users WHERE id = ? AND role = 'staff'",
      [staff_id]
    );
    if (staff.length === 0) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Assigning moves a Pending complaint into "In Progress".
    const [result] = await pool.query(
      `UPDATE complaints
          SET assigned_staff_id = ?,
              status = CASE WHEN status = 'Pending' THEN 'In Progress' ELSE status END
        WHERE id = ?`,
      [staff_id, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json({ message: 'Complaint assigned successfully' });
  } catch (err) {
    console.error('admin assign error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
