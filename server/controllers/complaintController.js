const {
  createComplaint,
  getComplaintsByUser,
  getComplaintByTicketForUser,
  getAllComplaints,
  updateComplaintByUserIfPending,
  cancelComplaintByUserIfPending,
  updateComplaintStatus,
  deleteComplaint,
  getComplaintAnalytics,
} = require('../models/complaintModel');

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

const create = async (req, res) => {
  try {
    const attachmentFile = req.files?.attachment?.[0] || req.files?.image?.[0] || null;
    const attachment = attachmentFile ? attachmentFile.filename : null;

    const image = attachmentFile && attachmentFile.mimetype.startsWith('image/') ? attachmentFile.filename : null;

    const complaint = await createComplaint({
      userId: req.user.id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority,
      image,
      attachment,
    });

    return res.status(201).json({ message: 'Complaint created', complaint });
  } catch (error) {
    return res.status(500).json({ message: mapServerError(error, 'Failed to create complaint') });
  }
};

const myComplaints = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const { rows, total } = await getComplaintsByUser({ userId: req.user.id, page, limit });

    return res.json({
      complaints: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: mapServerError(error, 'Failed to fetch complaints') });
  }
};

const trackMyComplaintByTicket = async (req, res) => {
  try {
    const ticketId = (req.params.ticketId || '').trim().toUpperCase();

    if (!ticketId) {
      return res.status(400).json({ message: 'ticketId is required' });
    }

    const complaint = await getComplaintByTicketForUser({
      userId: req.user.id,
      ticketId,
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found for this ticket ID' });
    }

    return res.json({ complaint });
  } catch (error) {
    return res.status(500).json({ message: mapServerError(error, 'Failed to track complaint') });
  }
};

const allComplaints = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const { status, category, priority } = req.query;

    const { rows, total } = await getAllComplaints({
      status,
      category,
      priority,
      page,
      limit,
    });

    return res.json({
      complaints: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: mapServerError(error, 'Failed to fetch all complaints') });
  }
};

const updateMine = async (req, res) => {
  try {
    const attachmentFile = req.files?.attachment?.[0] || req.files?.image?.[0];
    const attachment = attachmentFile ? attachmentFile.filename : undefined;
    const image = attachmentFile
      ? attachmentFile.mimetype.startsWith('image/')
        ? attachmentFile.filename
        : null
      : undefined;

    const result = await updateComplaintByUserIfPending({
      id: req.params.id,
      userId: req.user.id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority,
      image,
      attachment,
    });

    if (result && result.error) {
      return res.status(result.code).json({ message: result.error });
    }

    return res.json({ message: 'Complaint updated', complaint: result });
  } catch (error) {
    return res.status(500).json({ message: mapServerError(error, 'Failed to update complaint') });
  }
};

const cancelMine = async (req, res) => {
  try {
    const result = await cancelComplaintByUserIfPending({
      id: req.params.id,
      userId: req.user.id,
    });

    if (result && result.error) {
      return res.status(result.code).json({ message: result.error });
    }

    if (!result) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    return res.json({ message: 'Complaint cancelled' });
  } catch (error) {
    return res.status(500).json({ message: mapServerError(error, 'Failed to cancel complaint') });
  }
};

const changeStatus = async (req, res) => {
  try {
    const result = await updateComplaintStatus({ id: req.params.id, status: req.body.status });

    if (result && result.error) {
      return res.status(result.code).json({ message: result.error });
    }

    return res.json({ message: 'Status updated', complaint: result });
  } catch (error) {
    return res.status(500).json({ message: mapServerError(error, 'Failed to update status') });
  }
};

const remove = async (req, res) => {
  try {
    const deleted = await deleteComplaint(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    return res.json({ message: 'Complaint deleted' });
  } catch (error) {
    return res.status(500).json({ message: mapServerError(error, 'Failed to delete complaint') });
  }
};

const analytics = async (_req, res) => {
  try {
    const data = await getComplaintAnalytics();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: mapServerError(error, 'Failed to fetch analytics') });
  }
};

module.exports = {
  create,
  myComplaints,
  trackMyComplaintByTicket,
  updateMine,
  cancelMine,
  allComplaints,
  changeStatus,
  remove,
  analytics,
};
