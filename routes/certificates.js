const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

router.post('/certificates/purchase', certificateController.purchaseCertificate);
router.get('/certificates/:id/pdf', certificateController.downloadCertificatePdf);

module.exports = router;
