const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../public/uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Только изображения'));
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

router.get('/admin', requireAdmin, adminController.adminPage);
router.post('/admin/photos/add', requireAdmin, upload.single('image'), adminController.addPhoto);
router.post('/admin/photos/:id/delete', requireAdmin, adminController.deletePhoto);
router.get('/admin/photos/:id/edit', requireAdmin, adminController.editPhotoPage);
router.post('/admin/photos/:id/edit', requireAdmin, upload.single('image'), adminController.updatePhoto);
router.post('/admin/reviews/:id/approve', requireAdmin, adminController.approveReview);
router.post('/admin/reviews/:id/delete', requireAdmin, adminController.deleteReview);
router.post('/admin/bookings/:id/approve', requireAdmin, adminController.approveBooking);
router.post('/admin/bookings/:id/reject', requireAdmin, adminController.rejectBooking);
router.post('/admin/bookings/:id/complete', requireAdmin, adminController.completeBooking);

module.exports = router;
