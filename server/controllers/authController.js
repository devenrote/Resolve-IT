const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findUserByEmail, createUser, findUserById, updateUserProfile } = require('../models/userModel');

const mapServerError = (error, fallback) => {
  if (!error) return fallback;
  if (error.code === 'ECONNREFUSED') return 'Database connection refused. Ensure MySQL server is running.';
  if (error.code === 'ER_ACCESS_DENIED_ERROR') return 'Database access denied. Check DB_USER and DB_PASSWORD in server/.env.';
  if (error.code === 'ER_BAD_DB_ERROR') return 'Database not found. Create DB and import server/scripts/schema.sql.';
  if (error.code === 'ER_NO_SUCH_TABLE') return 'Required tables missing. Import server/scripts/schema.sql.';
  return error.message || fallback;
};

const buildToken = (user) =>
  jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await createUser({ name, email, passwordHash, role });
    const user = await findUserById(userId);

    const token = buildToken(user);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: mapServerError(error, 'Registration failed') });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      nick_name: user.nick_name || null,
      country: user.country || null,
      language: user.language || null,
      timezone: user.timezone || null,
      linkedin_url: user.linkedin_url || null,
      created_at: user.created_at,
    };

    const token = buildToken(safeUser);

    return res.json({
      message: 'Login successful',
      token,
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({ message: mapServerError(error, 'Login failed') });
  }
};

const me = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: mapServerError(error, 'Failed to fetch profile') });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, nick_name, country, language, timezone, linkedin_url } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'name and email are required' });
    }

    if (linkedin_url) {
      const isValidUrl = /^https?:\/\/.+/i.test(linkedin_url);
      if (!isValidUrl) {
        return res.status(400).json({ message: 'linkedin_url must be a valid URL starting with http:// or https://' });
      }
    }

    const existing = await findUserByEmail(email);
    if (existing && existing.id !== req.user.id) {
      return res.status(409).json({ message: 'Email already in use by another account' });
    }

    const user = await updateUserProfile({
      id: req.user.id,
      name,
      email,
      nick_name,
      country,
      language,
      timezone,
      linkedin_url,
    });
    return res.json({ message: 'Profile updated', user });
  } catch (error) {
    return res.status(500).json({ message: mapServerError(error, 'Failed to update profile') });
  }
};

module.exports = {
  register,
  login,
  me,
  updateProfile,
};
