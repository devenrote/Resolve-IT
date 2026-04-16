const express = require('express');
const { getUsers, createUserByAdmin, resetUserPassword } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', auth, authorizeRoles('admin'), getUsers);
router.post('/', auth, authorizeRoles('admin'), createUserByAdmin);
router.patch('/:id/reset-password', auth, authorizeRoles('admin'), resetUserPassword);

module.exports = router;
