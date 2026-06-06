const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

router.get('/', pageController.home);
router.get('/contacts', pageController.contactsPage);
router.get('/certificates', pageController.certificates);
router.get('/auth', pageController.authPage);
router.get('/cabinet', pageController.cabinet);
router.get('/booking', pageController.bookingPage);
router.post('/booking', pageController.submitBooking);

module.exports = router;
