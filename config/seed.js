const bcrypt = require('bcryptjs');
const { Photo } = require('../models/Photo');
const { Certificate } = require('../models/Certificate');
const { BookingSlot } = require('../models/BookingSlot');
const { User } = require('../models/User');

async function seedAdmin() {
  const exists = await User.findOne({ where: { email: 'admin@photo.ru' } });
  if (exists) return;

  const passwordHash = await bcrypt.hash('admin123', 10);
  await User.create({ name: 'Администратор', email: 'admin@photo.ru', passwordHash, isAdmin: true });
  console.log('Admin created: admin@photo.ru / admin123');
}

async function seedPhotos() {
  const count = await Photo.count();
  if (count > 0) return;

  const items = [
    { category: 'portrait',  title: 'Портрет',          subtitle: 'Естественная красота', imagePath: '/images/photo_2026-01-16_10-35-03.jpg',  sort: 1 },
    { category: 'family',    title: 'Семья',             subtitle: 'Теплые моменты',       imagePath: '/images/01-16_10-35-51.jpg',              sort: 2 },
    { category: 'love',      title: 'Love Story #1',     subtitle: 'История о вас',        imagePath: '/images/0-35-37.jpg',                    sort: 3 },
    { category: 'event',     title: 'Событие',           subtitle: 'Яркие моменты',        imagePath: '/images/2026-01-16_10-35-20.jpg',         sort: 4 },
    { category: 'portrait',  title: 'Портрет #2',        subtitle: 'Красивая история',     imagePath: '/images/026-01-16_10-36-00.jpg',          sort: 5 },
    { category: 'love',      title: 'Love Story #3',     subtitle: 'Моменты любви',        imagePath: '/images/026-01-16_10-36-34.jpg',          sort: 6 },
    { category: 'event',     title: 'Свадебная съемка',  subtitle: 'Особенный день',       imagePath: '/images/026-01-16_10-36-16.jpg',          sort: 7 },
    { category: 'family',    title: 'Семейная прогулка', subtitle: 'Естественные эмоции',  imagePath: '/images/01-16_10-36-25.jpg',              sort: 8 },
    { category: 'love',      title: 'Love Story #4',     subtitle: 'Вечная любовь',        imagePath: '/images/01-16_10-36-08.jpg',              sort: 9 },
    { category: 'event',     title: 'Корпоратив',        subtitle: 'Командный дух',        imagePath: '/images/1-16_10-36-42.jpg',               sort: 10 },
    { category: 'portrait',  title: 'Портрет #3',        subtitle: 'Атмосфера кадра',      imagePath: '/images/11111222 (1).jpg',                sort: 11 },
  ];

  await Photo.bulkCreate(items);
}

async function seedCertificates() {
  const count = await Certificate.count();
  if (count > 0) return;

  await Certificate.bulkCreate([
    { title: '1 час съемки', price: 2500, perks: JSON.stringify(['1 час работы', '30 фото', 'Love Story / Портрет']), sort: 1 },
    { title: '2 часа съемки', price: 5000, perks: JSON.stringify(['2 часа работы', '70 фото', 'Любой формат', 'Видео 30 сек']), sort: 2, isPopular: true },
    { title: '4 часа VIP', price: 10000, perks: JSON.stringify(['4 часа работы', '150+ фото', 'Видео 2 мин', 'Альбом 20 фото']), sort: 3 },
  ]);
}

async function seedBookingSlots() {
  const count = await BookingSlot.count();
  if (count > 0) return;

  const slots = [];
  const today = new Date();

  for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);
    const dateStr = date.toISOString().split('T')[0];

    slots.push(
      { date: dateStr, time: '10:00', duration: 1, isAvailable: dayOffset % 3 !== 0 },
      { date: dateStr, time: '14:00', duration: 2, isAvailable: dayOffset % 2 !== 0 },
      { date: dateStr, time: '18:00', duration: 1, isAvailable: true }
    );
  }

  await BookingSlot.bulkCreate(slots);
}

async function seedIfNeeded() {
  await seedAdmin();
  await seedPhotos();
  await seedCertificates();
  await seedBookingSlots();
}

module.exports = { seedIfNeeded };
