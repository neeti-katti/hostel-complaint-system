const express = require('express');
const pool = require('../db/pool');
const { authenticate, authorize } = require('../middleware/auth');
const { generateUniqueComplaintCode } = require('../utils/code');

const router = express.Router();

const CATEGORIES = ['electricity', 'water', 'internet', 'maintenance', 'food'];

// POST /api/complaints  -> student submits a complaint
router.post('/', authenticate, authorize('student'), async (req, res) => {
  try {
    const { category, title, description } = req.body;
    if (!category || !title || !description) {
      return res.status(400).json({ message: 'Category, title and description are required' });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const code = await generateUniqueComplaintCode();
    const [result] = await pool.query(
      'INSERT INTO complaints (complaint_code, student_id, category, title, description) VALUES (?, ?, ?, ?, ?)',
      [code, req.user.id, category, title, description]
    );

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint: { id: result.insertId, complaint_code: code, status: 'Pending' },
    });
  } catch (err) {
    console.error('create complaint error:', err);
    res.status(500).json({ message: 'Server error while submitting complaint' });
  }
});

// GET /api/complaints/mine  -> student's own complaints
router.get('/mine', authenticate, authorize('student'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, s.name AS staff_name, s.phone AS staff_phone
         FROM complaints c
         LEFT JOIN users s ON s.id = c.assigned_staff_id
        WHERE c.student_id = ?
        ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json({ complaints: rows });
  } catch (err) {
    console.error('list mine error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/complaints/track/:code  -> public status tracking by complaint code
router.get('/track/:code', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.complaint_code, c.category, c.title, c.description, c.status,
              c.created_at, c.updated_at,
              u.name AS student_name, s.name AS staff_name
         FROM complaints c
         JOIN users u ON u.id = c.student_id
         LEFT JOIN users s ON s.id = c.assigned_staff_id
        WHERE c.complaint_code = ?`,
      [req.params.code.trim()]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No complaint found with that ID' });
    }
    res.json({ complaint: rows[0] });
  } catch (err) {
    console.error('track error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
