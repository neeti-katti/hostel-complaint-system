// Generates a unique complaint code like HCMS-7F3K9A2B.
const pool = require('../db/pool');

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing 0/O/1/I

function randomCode() {
  let s = '';
  for (let i = 0; i < 8; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `HCMS-${s}`;
}

async function generateUniqueComplaintCode() {
  // Retry until we find a code not already in the table.
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode();
    const [rows] = await pool.query(
      'SELECT id FROM complaints WHERE complaint_code = ? LIMIT 1',
      [code]
    );
    if (rows.length === 0) return code;
  }
  throw new Error('Could not generate a unique complaint code');
}

module.exports = { generateUniqueComplaintCode };
