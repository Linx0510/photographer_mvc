const bcrypt = require('bcryptjs');
const { User } = require('../models/User');

async function postAuth(req, res) {
  const { mode } = req.body;
  try {
    if (mode === 'register') {
      return await register(req, res);
    }
    return await login(req, res);
  } catch (err) {
    console.error(err);
    req.session.flash = { type: 'error', message: 'Ошибка сервера. Попробуйте еще раз.' };
    return res.redirect('/auth');
  }
}

async function register(req, res) {
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';

  if (!name || !email || !password) {
    req.session.flash = { type: 'error', message: 'Заполните все поля регистрации.' };
    return res.redirect('/auth');
  }
  if (password.length < 3) {
    req.session.flash = { type: 'error', message: 'Пароль слишком короткий (минимум 3 символа).' };
    return res.redirect('/auth');
  }

  const exists = await User.findOne({ where: { email } });
  if (exists) {
    req.session.flash = { type: 'error', message: 'Пользователь с таким email уже существует.' };
    return res.redirect('/auth');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });

  req.session.user = { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin };
  req.session.flash = { type: 'success', message: 'Вы успешно зарегистрированы!' };
  return res.redirect('/');
}

async function login(req, res) {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';

  if (!email || !password) {
    req.session.flash = { type: 'error', message: 'Введите email и пароль.' };
    return res.redirect('/auth');
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    req.session.flash = { type: 'error', message: 'Пользователь не найден.' };
    return res.redirect('/auth');
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    req.session.flash = { type: 'error', message: 'Неверный пароль.' };
    return res.redirect('/auth');
  }

  req.session.user = { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin };
  req.session.flash = { type: 'success', message: 'Вы успешно вошли!' };
  return res.redirect('/');
}

function logout(req, res) {
  req.session.destroy(() => res.redirect('/'));
}

module.exports = { postAuth, logout };
