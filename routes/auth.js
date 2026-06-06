const express = require('express');
const router = express.Router();
const { postAuth, logout } = require('../controllers/authController');

router.post('/auth', postAuth);
router.post('/logout', logout);

module.exports = router;
