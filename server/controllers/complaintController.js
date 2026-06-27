const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
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
const { cloudinary, assertCloudinaryConfigured } = require('../config/cloudinary');

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

const legacyAttachmentDirs = [
  path.join(__dirname, '..', 'uploads'),
  path.join(__dirname, '..', 'tmp', 'uploads'),
];

const findLegacyAttachmentPath = (fileName) => {
  const safeFileName = path.basename(fileName || '');
  if (!safeFileName) return null;

  for (const dir of legacyAttachmentDirs) {
    const fullPath = path.join(dir, safeFileName);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return null;
};

const getCloudinaryResourceType = (file) => {
  if (!file?.mimetype) return 'raw';
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    return 'image';
  }
  return 'raw';
};

const removeTempFile = async (file) => {
  if (!file?.path) return;

  try {
    await fsPromises.unlink(file.path);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`Failed to remove temp upload: ${file.path}`);
    }
  }
};

const uploadFileToCloudinary = async (file) => {
  if (!file) return null;

  if (!file.path) {
    const error = new Error('Missing image file for upload');
    error.statusCode = 400;
    throw error;
  }

  assertCloudinaryConfigured();

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'resolveit/complaints',
      resource_type: getCloudinaryResourceType(file),
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
    };
  } catch (error) {
    const uploadError = new Error(error?.message || 'Failed to upload file to Cloudinary');
    uploadError.statusCode = 502;
    uploadError.code = error?.http_code || error?.code || 'CLOUDINARY_UPLOAD_FAILED';
    throw uploadError;
  } finally {
    await removeTempFile(file);
  }
};

const getRequestFile = (req) => req.files?.attachment?.[0] || req.files?.image?.[0] || null;

const serveLegacyAttachment = async (req, res) => {
  const resolvedPath = findLegacyAttachmentPath(req.params.fileName);

  if (!resolvedPath) {
    return res.status(404).json({ message: 'Attachment file not found on server. Please re-upload this complaint attachment.' });
  }

  return res.sendFile(resolvedPath);
};

const create = async (req, res) => {
  try {
    const attachmentFile = getRequestFile(req);
    const uploadedFile = await uploadFileToCloudinary(attachmentFile);
    const attachment = uploadedFile ? uploadedFile.url : null;
    const image = attachmentFile?.mimetype?.startsWith('image/') ? uploadedFile?.url || null : null;

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
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }

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
    const attachmentFile = getRequestFile(req);
    const uploadedFile = await uploadFileToCloudinary(attachmentFile);
    const attachment = uploadedFile ? uploadedFile.url : undefined;
    const image = attachmentFile
      ? attachmentFile.mimetype.startsWith('image/')
        ? uploadedFile?.url || null
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
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }

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
  serveLegacyAttachment,
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
