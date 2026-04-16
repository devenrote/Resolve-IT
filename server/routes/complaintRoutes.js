const express = require('express');
const {
  create,
  myComplaints,
  trackMyComplaintByTicket,
  updateMine,
  cancelMine,
  allComplaints,
  changeStatus,
  remove,
  analytics,
} = require('../controllers/complaintController');
const auth = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  validateComplaintCreate,
  validateComplaintUpdate,
  validateComplaintStatusUpdate,
} = require('../middleware/validationMiddleware');

const router = express.Router();

router.post(
  '/',
  auth,
  authorizeRoles('employee'),
  upload.fields([
    { name: 'attachment', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  validateComplaintCreate,
  create
);
router.get('/my', auth, authorizeRoles('employee'), myComplaints);
router.get('/my/track/:ticketId', auth, authorizeRoles('employee'), trackMyComplaintByTicket);
router.put(
  '/my/:id',
  auth,
  authorizeRoles('employee'),
  upload.fields([
    { name: 'attachment', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  validateComplaintUpdate,
  updateMine
);
router.delete('/my/:id', auth, authorizeRoles('employee'), cancelMine);

router.get('/', auth, authorizeRoles('admin'), allComplaints);
router.patch('/:id/status', auth, authorizeRoles('admin'), validateComplaintStatusUpdate, changeStatus);
router.delete('/:id', auth, authorizeRoles('admin'), remove);
router.get('/analytics/summary', auth, authorizeRoles('admin'), analytics);

module.exports = router;
