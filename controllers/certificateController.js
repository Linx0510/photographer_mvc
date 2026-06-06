const path = require('path');
const PDFDocument = require('pdfkit');
const { Certificate } = require('../models/Certificate');
const { Purchase } = require('../models/Purchase');
const { isCertificatePurchase } = require('../services/purchaseClassifier');

const PDF_FONT_PATH = path.join(__dirname, '../fonts', 'Roboto-Regular.ttf');

function formatRuDate(value) {
  return new Date(value).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function addOneYear(value) {
  const date = new Date(value);
  date.setFullYear(date.getFullYear() + 1);
  return date;
}

function sendUnauthorized(res) {
  return res.status(401).json({ ok: false, redirect: '/auth', message: 'Сначала войдите в аккаунт.' });
}

async function purchaseCertificate(req, res) {
  if (!req.session.user) {
    return sendUnauthorized(res);
  }

  const certificateId = Number(req.body.certificateId);
  const clientName = (req.body.clientName || '').trim();
  const phone = (req.body.phone || '').trim();
  const bookingDate = (req.body.bookingDate || '').trim();
  const bookingTime = (req.body.bookingTime || '').trim();

  if (!certificateId) {
    return res.status(400).json({ ok: false, message: 'Некорректный сертификат.' });
  }
  if (!clientName || !phone || !bookingDate || !bookingTime) {
    return res.status(400).json({ ok: false, message: 'Заполните все поля формы.' });
  }

  const cert = await Certificate.findByPk(certificateId);
  if (!cert) {
    return res.status(404).json({ ok: false, message: 'Сертификат не найден.' });
  }

  await Purchase.create({
    userId: req.session.user.id,
    certificateId: cert.id,
    kind: 'certificate',
    price: cert.price,
    clientName,
    phone,
    bookingDate,
    bookingTime
  });

  return res.json({
    ok: true,
    message: `✅ Сертификат оформлен! ${bookingDate} в ${bookingTime}. Он появится в личном кабинете.`
  });
}

async function downloadCertificatePdf(req, res) {
  if (!req.session.user) {
    return res.redirect('/auth');
  }

  const purchase = await Purchase.findOne({
    where: {
      id: req.params.id,
      userId: req.session.user.id
    },
    include: [Certificate]
  });

  if (!purchase || !isCertificatePurchase(purchase)) {
    req.session.flash = { type: 'error', message: 'Сертификат не найден.' };
    return res.redirect('/cabinet');
  }

  const issuedAt = purchase.createdAt || new Date();
  const expiresAt = addOneYear(issuedAt);
  const certificateTitle = purchase.Certificate ? purchase.Certificate.title : 'Сертификат';
  const certificatePrice = purchase.price || (purchase.Certificate ? purchase.Certificate.price : 0);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="certificate-${purchase.id}.pdf"`);

  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    bufferPages: true
  });

  doc.pipe(res);

  // Регистрируем Arial Unicode MS для поддержки кириллицы
  doc.registerFont('arial-unicode', PDF_FONT_PATH);
  doc.font('arial-unicode');

  doc.fontSize(24).text('Подарочный сертификат', { align: 'center' });
  doc.moveDown(1);
  doc.fontSize(14).text(`Название: ${certificateTitle}`);
  doc.text(`Стоимость: ${certificatePrice} ₽`);
  doc.text(`Дата оформления: ${formatRuDate(issuedAt)}`);
  doc.text(`Дата истечения: ${formatRuDate(expiresAt)}`);
  doc.moveDown(1);

  doc.fontSize(12).text(`Клиент: ${purchase.clientName || '—'}`);
  doc.text(`Телефон: ${purchase.phone || '—'}`);
  if (purchase.bookingDate) {
    doc.text(`Желаемая дата съёмки: ${formatRuDate(purchase.bookingDate)}`);
  }
  if (purchase.bookingTime) {
    doc.text(`Желаемое время: ${purchase.bookingTime}`);
  }

  doc.moveDown(1);
  doc.text('Сертификат действителен 12 месяцев с даты оформления.', {
    align: 'left'
  });

  doc.end();
}

module.exports = { purchaseCertificate, downloadCertificatePdf };
