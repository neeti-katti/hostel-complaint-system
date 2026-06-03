const express = require('express');
const pool = require('../db/pool');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, authorize('staff'));

const STATUSES = ['Pending', 'In Progress', 'Resolved'];

// GET /api/staff/complaints  -> complaints assigned to this staff member
router.get('/complaints', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, u.name AS student_name, u.room_number
         FROM complaints c
         JOIN users u ON u.id = c.student_id
        WHERE c.assigned_staff_id = ?
        ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json({ complaints: rows });
  } catch (err) {
    console.error('staff list error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/staff/complaints/:id/status  -> update status of an assigned complaint
router.put('/complaints/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const [result] = await pool.query(
      'UPDATE complaints SET status = ? WHERE id = ? AND assigned_staff_id = ?',
      [status, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Complaint not found or not assigned to you' });
    }
    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    console.error('staff status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
