const pool = require('../config/db');

const STATUS_ORDER = ['Pending', 'In Progress', 'Resolved', 'Closed'];
let attachmentColumnEnsured = false;

const ensureAttachmentColumn = async () => {
  if (attachmentColumnEnsured) return;

  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'complaints'
       AND COLUMN_NAME = 'attachment'`
  );

  const exists = Number(rows?.[0]?.count || 0) > 0;
  if (!exists) {
    await pool.query('ALTER TABLE complaints ADD COLUMN attachment VARCHAR(255) DEFAULT NULL');
  }

  attachmentColumnEnsured = true;
};

const generateTicketId = async () => {
  const year = new Date().getFullYear();
  const prefix = `CMP-${year}-`;

  const [rows] = await pool.query(
    'SELECT ticket_id FROM complaints WHERE ticket_id LIKE ? ORDER BY id DESC LIMIT 1',
    [`${prefix}%`]
  );

  let nextNumber = 1;

  if (rows.length > 0) {
    const last = rows[0].ticket_id;
    const split = last.split('-');
    const lastNumber = Number(split[2]);
    nextNumber = Number.isNaN(lastNumber) ? 1 : lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
};

const createComplaint = async ({ userId, title, description, category, priority, image, attachment }) => {
  await ensureAttachmentColumn();
  const ticketId = await generateTicketId();

  const [result] = await pool.query(
    `INSERT INTO complaints (ticket_id, user_id, title, description, category, priority, status, image, attachment)
     VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?)`,
    [ticketId, userId, title, description, category, priority, image || null, attachment || null]
  );

  const [rows] = await pool.query('SELECT * FROM complaints WHERE id = ?', [result.insertId]);
  return rows[0];
};

const getComplaintsByUser = async ({ userId, page, limit }) => {
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    'SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [userId, limit, offset]
  );

  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM complaints WHERE user_id = ?', [userId]);

  return { rows, total };
};

const getComplaintByTicketForUser = async ({ userId, ticketId }) => {
  await ensureAttachmentColumn();

  const [rows] = await pool.query(
    `SELECT id, ticket_id, title, category, priority, status, image, attachment, created_at, updated_at
     FROM complaints
     WHERE user_id = ? AND ticket_id = ?
     LIMIT 1`,
    [userId, ticketId]
  );

  return rows[0] || null;
};

const getAllComplaints = async ({ status, category, priority, page, limit }) => {
  const filters = [];
  const values = [];

  if (status) {
    filters.push('c.status = ?');
    values.push(status);
  }

  if (category) {
    filters.push('c.category = ?');
    values.push(category);
  }

  if (priority) {
    filters.push('c.priority = ?');
    values.push(priority);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const query = `
    SELECT c.*, u.name AS employee_name, u.email AS employee_email
    FROM complaints c
    JOIN users u ON c.user_id = u.id
    ${where}
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.query(query, [...values, limit, offset]);

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM complaints c
    ${where}
  `;
  const [[{ total }]] = await pool.query(countQuery, values);

  return { rows, total };
};

const findComplaintById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM complaints WHERE id = ?', [id]);
  return rows[0] || null;
};

const updateComplaintByUserIfPending = async ({
  id,
  userId,
  title,
  description,
  category,
  priority,
  image,
  attachment,
}) => {
  await ensureAttachmentColumn();
  const complaint = await findComplaintById(id);

  if (!complaint || Number(complaint.user_id) !== Number(userId)) {
    return { error: 'Complaint not found', code: 404 };
  }

  if (complaint.status !== 'Pending') {
    return { error: 'Only pending complaints can be edited', code: 400 };
  }

  const updates = ['title = ?', 'description = ?', 'category = ?', 'priority = ?'];
  const values = [title, description, category, priority];

  if (attachment !== undefined) {
    updates.push('attachment = ?');
    values.push(attachment);
  }

  if (image !== undefined) {
    updates.push('image = ?');
    values.push(image);
  }

  values.push(id);

  await pool.query(
    `UPDATE complaints
     SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    values
  );

  return findComplaintById(id);
};

const cancelComplaintByUserIfPending = async ({ id, userId }) => {
  const complaint = await findComplaintById(id);

  if (!complaint || Number(complaint.user_id) !== Number(userId)) {
    return { error: 'Complaint not found', code: 404 };
  }

  if (complaint.status !== 'Pending') {
    return { error: 'Only pending complaints can be cancelled', code: 400 };
  }

  const [result] = await pool.query('DELETE FROM complaints WHERE id = ? AND user_id = ?', [id, userId]);
  return result.affectedRows > 0;
};

const updateComplaintStatus = async ({ id, status }) => {
  const complaint = await findComplaintById(id);
  if (!complaint) return { error: 'Complaint not found', code: 404 };

  const currentIndex = STATUS_ORDER.indexOf(complaint.status);
  const nextIndex = STATUS_ORDER.indexOf(status);

  if (nextIndex !== currentIndex + 1) {
    return {
      error: `Invalid lifecycle transition from ${complaint.status} to ${status}`,
      code: 400,
    };
  }

  await pool.query('UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
  return findComplaintById(id);
};

const deleteComplaint = async (id) => {
  const [result] = await pool.query('DELETE FROM complaints WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

const getComplaintAnalytics = async () => {
  const [[totals]] = await pool.query(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress,
      SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved,
      SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) AS closed
    FROM complaints
  `);

  const [byCategory] = await pool.query(`
    SELECT category, COUNT(*) AS value
    FROM complaints
    GROUP BY category
    ORDER BY value DESC
  `);

  const [byStatus] = await pool.query(`
    SELECT status AS name, COUNT(*) AS value
    FROM complaints
    GROUP BY status
  `);

  return {
    totals,
    byCategory,
    byStatus,
  };
};

module.exports = {
  createComplaint,
  getComplaintsByUser,
  getComplaintByTicketForUser,
  getAllComplaints,
  updateComplaintByUserIfPending,
  cancelComplaintByUserIfPending,
  updateComplaintStatus,
  deleteComplaint,
  getComplaintAnalytics,
};
