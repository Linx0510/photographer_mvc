const { Photo } = require('../models/Photo');
const { Certificate } = require('../models/Certificate');
const { Purchase } = require('../models/Purchase');
const { BookingSlot } = require('../models/BookingSlot');
const { splitPurchases } = require('../services/purchaseClassifier');

function parsePerks(perks) {
  if (!perks) return [];
  if (Array.isArray(perks)) return perks;
  try {
    return JSON.parse(perks);
  } catch {
    return [];
  }
}

async function home(req, res) {
  const limit = 8;
  const { count, rows } = await Photo.findAndCountAll({
    order: [['sort', 'ASC'], ['id', 'ASC']],
    limit
  });

  res.render('pages/index', {
    user: req.session.user || null,
    photos: rows,
    photosTotal: count,
    photosLoaded: rows.length
  });
}

function contactsPage(req, res) {
  res.render('pages/contacts', {
    user: req.session.user || null
  });
}

async function certificates(req, res) {
  const certs = await Certificate.findAll({ order: [['sort', 'ASC'], ['id', 'ASC']] });
  const certsView = certs.map((cert) => ({
    id: cert.id,
    title: cert.title,
    price: cert.price,
    isPopular: cert.isPopular,
    perksList: parsePerks(cert.perks)
  }));

  res.render('pages/certificates', {
    user: req.session.user || null,
    certs,
    certsView,
    certsJson: encodeURIComponent(JSON.stringify(certsView.map((cert) => ({
      id: cert.id,
      title: cert.title,
      price: cert.price
    })))),
    userNameJson: encodeURIComponent(req.session.user ? req.session.user.name : ''),
    isAuth: Boolean(req.session.user)
  });
}

async function bookingPage(req, res) {
  const certs = await Certificate.findAll({ order: [['sort', 'ASC'], ['id', 'ASC']] });
  const slots = await BookingSlot.findAll({
    where: { isAvailable: true },
    order: [['date', 'ASC'], ['time', 'ASC']]
  });

  res.render('pages/booking', {
    user: req.session.user || null,
    certs,
    slots
  });
}

async function submitBooking(req, res) {
  if (!req.session.user) {
    req.session.flash = { type: 'error', message: 'Сначала войдите в аккаунт.' };
    return res.redirect('/auth');
  }

  const { certificateId, bookingDate, bookingTime, clientName, phone } = req.body;

  if (!certificateId || !bookingDate || !bookingTime || !clientName || !phone) {
    req.session.flash = { type: 'error', message: 'Заполните все обязательные поля.' };
    return res.redirect('/booking');
  }

  const cert = await Certificate.findByPk(certificateId);
  if (!cert) {
    req.session.flash = { type: 'error', message: 'Выбранный сертификат не найден.' };
    return res.redirect('/booking');
  }

  const slot = await BookingSlot.findOne({ where: { date: bookingDate, time: bookingTime } });
  if (!slot || !slot.isAvailable) {
    req.session.flash = { type: 'error', message: 'Выбранное время больше не доступно.' };
    return res.redirect('/booking');
  }

  await Purchase.create({
    userId: req.session.user.id,
    certificateId: cert.id,
    kind: 'booking',
    price: cert.price,
    clientName: clientName.trim(),
    phone: phone.trim(),
    bookingDate,
    bookingTime,
    status: 'new'
  });

  await slot.update({ isAvailable: false });

  req.session.flash = { type: 'success', message: 'Спасибо! Ваша запись на съемку отправлена на рассмотрение администратору.' };
  res.redirect('/cabinet');
}

async function cabinet(req, res) {
  if (!req.session.user) {
    req.session.flash = { type: 'error', message: 'Сначала войдите в аккаунт.' };
    return res.redirect('/auth');
  }

  const purchases = await Purchase.findAll({
    where: { userId: req.session.user.id },
    include: [Certificate],
    order: [['id', 'DESC']]
  });

  const { certificatePurchases, bookingPurchases } = splitPurchases(purchases);

  res.render('pages/cabinet', {
    user: req.session.user,
    certificates: certificatePurchases,
    bookings: bookingPurchases
  });
}

function authPage(req, res) {
  res.render('pages/auth', {
    user: req.session.user || null
  });
}

module.exports = { home, contactsPage, certificates, authPage, cabinet, bookingPage, submitBooking };
