const path = require('path');
const fs = require('fs');
const { Photo } = require('../models/Photo');
const { User } = require('../models/User');
const { Review } = require('../models/Review');
const { Purchase } = require('../models/Purchase');
const { Certificate } = require('../models/Certificate');
const { splitPurchases } = require('../services/purchaseClassifier');

async function adminPage(req, res) {
  const photos = await Photo.findAll({ order: [['sort', 'ASC'], ['id', 'ASC']] });
  const users = await User.findAll({ order: [['id', 'ASC']] });
  const pendingReviews = await Review.findAll({ where: { approved: false }, order: [['id', 'DESC']] });
  const purchases = await Purchase.findAll({
    include: [User, Certificate],
    order: [['id', 'DESC']]
  });
  const { bookingPurchases } = splitPurchases(purchases);

  res.render('pages/admin', {
    photos,
    users,
    pendingReviews,
    bookings: bookingPurchases
  });

}

async function addPhoto(req, res) {
  const { category, title, subtitle, sort } = req.body;

  if (!category || !title) {
    req.session.flash = { type: 'error', message: 'Укажите категорию и название.' };
    return res.redirect('/admin');
  }

  let imagePath;
  if (req.file) {
    imagePath = '/uploads/' + req.file.filename;
  } else if (req.body.imageUrl) {
    imagePath = req.body.imageUrl.trim();
  } else {
    req.session.flash = { type: 'error', message: 'Загрузите файл или укажите путь к изображению.' };
    return res.redirect('/admin');
  }

  await Photo.create({
    category,
    title,
    subtitle: subtitle || '',
    imagePath,
    sort: parseInt(sort) || 0
  });

  req.session.flash = { type: 'success', message: 'Фото добавлено.' };
  res.redirect('/admin');
}

async function deletePhoto(req, res) {
  const photo = await Photo.findByPk(req.params.id);
  if (!photo) {
    req.session.flash = { type: 'error', message: 'Фото не найдено.' };
    return res.redirect('/admin');
  }

  // Delete uploaded file if it's in /uploads/
  if (photo.imagePath.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, '../public', photo.imagePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await photo.destroy();
  req.session.flash = { type: 'success', message: 'Фото удалено.' };
  res.redirect('/admin');
}

async function editPhotoPage(req, res) {
  const photo = await Photo.findByPk(req.params.id);
  if (!photo) return res.redirect('/admin');
  res.render('pages/admin-edit-photo', { photo });

}

async function updatePhoto(req, res) {
  const photo = await Photo.findByPk(req.params.id);
  if (!photo) return res.redirect('/admin');

  const { category, title, subtitle, sort } = req.body;

  let imagePath = photo.imagePath;
  if (req.file) {
    // Delete old uploaded file
    if (photo.imagePath.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '../public', photo.imagePath);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    imagePath = '/uploads/' + req.file.filename;
  } else if (req.body.imageUrl && req.body.imageUrl.trim()) {
    imagePath = req.body.imageUrl.trim();
  }

  await photo.update({
    category: category || photo.category,
    title: title || photo.title,
    subtitle: subtitle !== undefined ? subtitle : photo.subtitle,
    imagePath,
    sort: parseInt(sort) || photo.sort
  });

  req.session.flash = { type: 'success', message: 'Фото обновлено.' };
  res.redirect('/admin');
}

async function approveReview(req, res) {
  const review = await Review.findByPk(req.params.id);
  if (review) await review.update({ approved: true });
  req.session.flash = { type: 'success', message: 'Отзыв одобрен.' };
  res.redirect('/admin');
}

async function deleteReview(req, res) {
  const review = await Review.findByPk(req.params.id);
  if (review) await review.destroy();
  req.session.flash = { type: 'success', message: 'Отзыв удалён.' };
  res.redirect('/admin');
}

async function approveBooking(req, res) {
  const booking = await Purchase.findByPk(req.params.id);
  if (booking) await booking.update({ status: 'approved' });
  req.session.flash = { type: 'success', message: 'Запись на съемку подтверждена.' };
  res.redirect('/admin');
}

async function rejectBooking(req, res) {
  const booking = await Purchase.findByPk(req.params.id);
  if (booking) await booking.update({ status: 'rejected' });
  req.session.flash = { type: 'success', message: 'Запись на съемку отклонена.' };
  res.redirect('/admin');
}

async function completeBooking(req, res) {
  const booking = await Purchase.findByPk(req.params.id);
  if (booking) await booking.update({ status: 'completed' });
  req.session.flash = { type: 'success', message: 'Запись на съемку отмечена как завершённая.' };
  res.redirect('/admin');
}

module.exports = { adminPage, addPhoto, deletePhoto, editPhotoPage, updatePhoto, approveReview, deleteReview, approveBooking, rejectBooking, completeBooking };
