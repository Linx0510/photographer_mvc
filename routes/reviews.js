const express = require('express');
const router = express.Router();
const { reviewsPage, submitReview } = require('../controllers/reviewController');

router.get('/reviews', reviewsPage);
router.post('/reviews', submitReview);

module.exports = router;
