const { Message } = require('../models/Message');

async function sendMessage(req, res) {
  const name = (req.body.name || '').trim();
  const phone = (req.body.phone || '').trim();
  const email = (req.body.email || '').trim();
  const text = (req.body.text || '').trim();

  if (!name || !text) {
    req.session.flash = { type: 'error', message: 'Пожалуйста, укажите имя и сообщение.' };
    return res.redirect('/contacts');
  }

  await Message.create({ name, phone: phone || null, email: email || null, text });
  req.session.flash = { type: 'success', message: '✅ Сообщение отправлено! Отвечу в течение часа.' };
  return res.redirect('/contacts');
}

module.exports = { sendMessage };
