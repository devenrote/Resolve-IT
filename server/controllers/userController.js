const bcrypt = require('bcrypt');
const { findUserByEmail, createUser, listUsers, updateUserPasswordById, findUserById } = require('../models/userModel');

const DEFAULT_USER_PASSWORD = process.env.DEFAULT_USER_PASSWORD || 'Admin@123';

const mapServerError = (error, fallback) => {
  if (!error) return fallback;
  if (error.code === 'ECONNREFUSED') return 'Database connection refused. Ensure MySQL server is running.';
  if (error.code === 'ER_ACCESS_DENIED_ERROR') return 'Database access denied. Check DB_USER and DB_PASSWORD in server/.env.';
  if (error.code === 'ER_BAD_DB_ERROR') return 'Database not found. Create DB and import server/scripts/schema.sql.';
  if (error.code === 'ER_NO_SUCH_TABLE') return 'Required tables missing. Import server/scripts/schema.sql.';
  return error.message || fallback;
};

const parsePagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  return { page, limit };
};

const getUsers = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const { rows, total, stats } = await listUsers({ page, limit });

    return res.json({
      defaultPassword: DEFAULT_USER_PASSWORD,
      users: rows,
      stats: {
        total_users: Number(stats.total_users || 0),
        total_employees: Number(stats.total_employees || 0),
        total_admins: Number(stats.total_admins || 0),
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: mapServerError(error, 'Failed to fetch users') });
  }
};

const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, role = 'employee' } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'name and email are required' });
    }

    if (!['employee', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'role must be employee or admin' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(DEFAULT_USER_PASSWORD, 10);
    const userId = await createUser({ name, email, passwordHash, role });
    const user = await findUserById(userId);

    return res.status(201).json({
      message: 'User created successfully',
      user,
      defaultPassword: DEFAULT_USER_PASSWORD,
    });
  } catch (error) {
    return res.status(500).json({ message: mapServerError(error, 'Failed to create user') });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const passwordHash = await bcrypt.hash(DEFAULT_USER_PASSWORD, 10);
    const updated = await updateUserPasswordById({ id: req.params.id, passwordHash });

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      message: 'Password reset to default',
      defaultPassword: DEFAULT_USER_PASSWORD,
    });
  } catch (error) {
    return res.status(500).json({ message: mapServerError(error, 'Failed to reset password') });
  }
};

module.exports = {
  getUsers,
  createUserByAdmin,
  resetUserPassword,
};
