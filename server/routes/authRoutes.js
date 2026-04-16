const express = require('express');
const { register, login, me, updateProfile } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', auth, me);
router.put('/profile', auth, updateProfile);

module.exports = router;
