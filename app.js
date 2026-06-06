const path = require('path');
const express = require('express');
const session = require('express-session');

const { sequelize } = require('./config/database');
const { seedIfNeeded } = require('./config/seed');

// Import all models to ensure they're synced
require('./models/User');
require('./models/Photo');
require('./models/Certificate');
require('./models/Purchase');
require('./models/Message');
require('./models/BookingSlot');
require('./models/Review');

const pageRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const apiRoutes = require('./routes/api');
const certificateRoutes = require('./routes/certificates');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');

const app = express();
const PORT = process.env.PORT || 4000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false
}));

app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  // copy flash to locals and clear from session so it shows only once
  res.locals.flash = req.session.flash || null;
  req.session.flash = null;
  res.locals.path = req.path;
  next();
});

app.use(pageRoutes);
app.use(authRoutes);
app.use(contactRoutes);
app.use(certificateRoutes);
app.use(apiRoutes);
app.use(adminRoutes);
app.use(reviewRoutes);

app.use((req, res) => res.status(404).send('404 Not Found'));

(async () => {
  try {
    // Disable foreign key constraints for SQLite sync
    await sequelize.query('PRAGMA foreign_keys = OFF');
    await sequelize.sync({ alter: true });
    await sequelize.query('PRAGMA foreign_keys = ON');

    await seedIfNeeded();
    app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
  } catch (err) {
    console.error('Error during sync:', err);
    process.exit(1);
  }
})();
