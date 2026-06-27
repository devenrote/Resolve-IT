const pool = require('../config/db');

let profileColumnsEnsured = false;

const ensureProfileColumns = async () => {
  if (profileColumnsEnsured) return;

  const hasColumn = async (columnName) => {
    const { rows } = await pool.query(
      `SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'users'
         AND column_name = $1
       LIMIT 1`,
      [columnName]
    );
    return rows.length > 0;
  };

  if (!(await hasColumn('role'))) {
    await pool.query("ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'employee'");
  }
  if (!(await hasColumn('nick_name'))) {
    await pool.query('ALTER TABLE users ADD COLUMN nick_name VARCHAR(100) DEFAULT NULL');
  }
  if (!(await hasColumn('country'))) {
    await pool.query('ALTER TABLE users ADD COLUMN country VARCHAR(100) DEFAULT NULL');
  }
  if (!(await hasColumn('language'))) {
    await pool.query('ALTER TABLE users ADD COLUMN language VARCHAR(100) DEFAULT NULL');
  }
  if (!(await hasColumn('timezone'))) {
    await pool.query('ALTER TABLE users ADD COLUMN timezone VARCHAR(100) DEFAULT NULL');
  }
  if (!(await hasColumn('linkedin_url'))) {
    await pool.query('ALTER TABLE users ADD COLUMN linkedin_url VARCHAR(255) DEFAULT NULL');
  }

  if (!(await hasColumn('created_at'))) {
    await pool.query('ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  }

  profileColumnsEnsured = true;
};

const findUserByEmail = async (email) => {
  await ensureProfileColumns();
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
};

const findUserById = async (id) => {
  await ensureProfileColumns();
  const { rows } = await pool.query(
    `SELECT id, name, email, role, nick_name, country, language, timezone, linkedin_url, created_at
     FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

const createUser = async ({ name, email, passwordHash, role }) => {
  await ensureProfileColumns();
  const result = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
    [name, email, passwordHash, role]
  );

  return result.rows[0].id;
};

const updateUserProfile = async ({ id, name, email, nick_name, country, language, timezone, linkedin_url }) => {
  await ensureProfileColumns();
  await pool.query(
    `UPDATE users
     SET name = $1, email = $2, nick_name = $3, country = $4, language = $5, timezone = $6, linkedin_url = $7
     WHERE id = $8`,
    [name, email, nick_name || null, country || null, language || null, timezone || null, linkedin_url || null, id]
  );
  return findUserById(id);
};

const listUsers = async ({ page, limit }) => {
  await ensureProfileColumns();
  const offset = (page - 1) * limit;

  const { rows } = await pool.query(
    `SELECT id, name, email, role, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const totalRes = await pool.query('SELECT COUNT(*) AS total FROM users');
  const total = Number(totalRes.rows[0].total || 0);

  const statsRes = await pool.query(`
    SELECT
      COUNT(*) AS total_users,
      SUM(CASE WHEN role = 'employee' THEN 1 ELSE 0 END) AS total_employees,
      SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS total_admins
    FROM users
  `);
  
  const rawStats = statsRes.rows[0] || {};
  const stats = {
    total_users: Number(rawStats.total_users || 0),
    total_employees: Number(rawStats.total_employees || 0),
    total_admins: Number(rawStats.total_admins || 0),
  };

  return { rows, total, stats };
};

const updateUserPasswordById = async ({ id, passwordHash }) => {
  await ensureProfileColumns();
  const result = await pool.query('UPDATE users SET password = $1 WHERE id = $2', [passwordHash, id]);
  return result.rowCount > 0;
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserProfile,
  listUsers,
  updateUserPasswordById,
};
