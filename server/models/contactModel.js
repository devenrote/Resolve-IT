const pool = require('../config/db');

let contactTableEnsured = false;

const ensureContactTable = async () => {
  if (contactTableEnsured) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      email VARCHAR(150) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  contactTableEnsured = true;
};

const createContactMessage = async ({ email, message }) => {
  await ensureContactTable();
  const result = await pool.query(
    'INSERT INTO contact_messages (email, message) VALUES ($1, $2) RETURNING id',
    [email, message]
  );

  return result.rows[0].id;
};

module.exports = {
  createContactMessage,
};
