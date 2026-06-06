const express = require('express');
const page = require('../controllers/pageController');

const router = express.Router();

router.get('/', page.home);
router.get('/contacts', page.contacts);
router.get('/certificates', page.certificates);
router.get('/auth', page.auth);
router.post('/logout', page.logout);

module.exports = router;
