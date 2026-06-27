const pool = require('../config/db');

const STATUS_ORDER = ['Pending', 'In Progress', 'Resolved', 'Closed'];
const DEFAULT_COMPLAINT_CATEGORIES = ['Hardware', 'Software', 'Network', 'Access', 'Email', 'Other'];
let complaintFileColumnsEnsured = false;
let complaintCategoryTableEnsured = false;

const ensureComplaintFileColumns = async () => {
  if (complaintFileColumnsEnsured) return;

  const { rows } = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'complaints'
       AND column_name IN ('image', 'attachment')`
  );

  const columns = new Set(rows.map((row) => row.column_name));

  if (!columns.has('attachment')) {
    await pool.query('ALTER TABLE complaints ADD COLUMN attachment VARCHAR(500) DEFAULT NULL');
  }

  await pool.query(`
    ALTER TABLE complaints
    ALTER COLUMN image TYPE VARCHAR(500),
    ALTER COLUMN attachment TYPE VARCHAR(500)
  `);

  complaintFileColumnsEnsured = true;
};

const ensureComplaintCategoryTable = async () => {
  if (complaintCategoryTableEnsured) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS complaint_categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  for (const categoryName of DEFAULT_COMPLAINT_CATEGORIES) {
    await pool.query(
      'INSERT INTO complaint_categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
      [categoryName]
    );
  }

  complaintCategoryTableEnsured = true;
};

const ensureComplaintCategoryValue = async (category) => {
  await ensureComplaintCategoryTable();

  if (!category) return;

  await pool.query(
    'INSERT INTO complaint_categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
    [category]
  );
};

const generateTicketId = async () => {
  const year = new Date().getFullYear();
  const prefix = `CMP-${year}-`;

  const { rows } = await pool.query(
    'SELECT ticket_id FROM complaints WHERE ticket_id LIKE $1 ORDER BY id DESC LIMIT 1',
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
  await ensureComplaintFileColumns();
  await ensureComplaintCategoryValue(category);
  const ticketId = await generateTicketId();

  const result = await pool.query(
    `INSERT INTO complaints (ticket_id, user_id, title, description, category, priority, status, image, attachment)
     VALUES ($1, $2, $3, $4, $5, $6, 'Pending', $7, $8) RETURNING id`,
    [ticketId, userId, title, description, category, priority, image || null, attachment || null]
  );

  const { rows } = await pool.query('SELECT * FROM complaints WHERE id = $1', [result.rows[0].id]);
  return rows[0];
};

const getComplaintsByUser = async ({ userId, page, limit }) => {
  const offset = (page - 1) * limit;

  const { rows } = await pool.query(
    'SELECT * FROM complaints WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [userId, limit, offset]
  );

  const totalRes = await pool.query('SELECT COUNT(*) AS total FROM complaints WHERE user_id = $1', [userId]);
  const total = Number(totalRes.rows[0].total || 0);

  return { rows, total };
};

const getComplaintByTicketForUser = async ({ userId, ticketId }) => {
  await ensureComplaintFileColumns();

  const { rows } = await pool.query(
    `SELECT id, ticket_id, title, category, priority, status, image, attachment, created_at, updated_at
     FROM complaints
     WHERE user_id = $1 AND ticket_id = $2
     LIMIT 1`,
    [userId, ticketId]
  );

  return rows[0] || null;
};

const getAllComplaints = async ({ status, category, priority, page, limit }) => {
  const filters = [];
  const values = [];

  if (status) {
    filters.push(`c.status = $${values.length + 1}`);
    values.push(status);
  }

  if (category) {
    filters.push(`c.category = $${values.length + 1}`);
    values.push(category);
  }

  if (priority) {
    filters.push(`c.priority = $${values.length + 1}`);
    values.push(priority);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const queryParams = [...values];
  const limitPlaceholder = `$${queryParams.length + 1}`;
  queryParams.push(limit);
  const offsetPlaceholder = `$${queryParams.length + 1}`;
  queryParams.push(offset);

  const query = `
    SELECT c.*, u.name AS employee_name, u.email AS employee_email
    FROM complaints c
    JOIN users u ON c.user_id = u.id
    ${where}
    ORDER BY c.created_at DESC
    LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}
  `;

  const { rows } = await pool.query(query, queryParams);

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM complaints c
    ${where}
  `;
  const countRes = await pool.query(countQuery, values);
  const total = Number(countRes.rows[0].total || 0);

  return { rows, total };
};

const findComplaintById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM complaints WHERE id = $1', [id]);
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
  await ensureComplaintFileColumns();
  await ensureComplaintCategoryValue(category);
  const complaint = await findComplaintById(id);

  if (!complaint || Number(complaint.user_id) !== Number(userId)) {
    return { error: 'Complaint not found', code: 404 };
  }

  if (complaint.status !== 'Pending') {
    return { error: 'Only pending complaints can be edited', code: 400 };
  }

  const updates = [];
  const values = [];

  values.push(title);
  updates.push(`title = $${values.length}`);

  values.push(description);
  updates.push(`description = $${values.length}`);

  values.push(category);
  updates.push(`category = $${values.length}`);

  values.push(priority);
  updates.push(`priority = $${values.length}`);

  if (attachment !== undefined) {
    values.push(attachment);
    updates.push(`attachment = $${values.length}`);
  }

  if (image !== undefined) {
    values.push(image);
    updates.push(`image = $${values.length}`);
  }

  values.push(id);
  const idPlaceholder = `$${values.length}`;

  await pool.query(
    `UPDATE complaints
     SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = ${idPlaceholder}`,
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

  const result = await pool.query('DELETE FROM complaints WHERE id = $1 AND user_id = $2', [id, userId]);
  return result.rowCount > 0;
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

  await pool.query('UPDATE complaints SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, id]);
  return findComplaintById(id);
};

const deleteComplaint = async (id) => {
  const result = await pool.query('DELETE FROM complaints WHERE id = $1', [id]);
  return result.rowCount > 0;
};

const getComplaintAnalytics = async () => {
  const totalsRes = await pool.query(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress,
      SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved,
      SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) AS closed
    FROM complaints
  `);

  const rawTotals = totalsRes.rows[0] || {};
  const totals = {
    total: Number(rawTotals.total || 0),
    pending: Number(rawTotals.pending || 0),
    in_progress: Number(rawTotals.in_progress || 0),
    resolved: Number(rawTotals.resolved || 0),
    closed: Number(rawTotals.closed || 0),
  };

  const byCategoryRes = await pool.query(`
    SELECT category, COUNT(*) AS value
    FROM complaints
    GROUP BY category
    ORDER BY value DESC
  `);

  const byCategory = byCategoryRes.rows.map((row) => ({
    category: row.category,
    value: Number(row.value || 0),
  }));

  const byStatusRes = await pool.query(`
    SELECT status AS name, COUNT(*) AS value
    FROM complaints
    GROUP BY status
  `);

  const byStatus = byStatusRes.rows.map((row) => ({
    name: row.name,
    value: Number(row.value || 0),
  }));

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
