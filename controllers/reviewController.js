const { Review } = require('../models/Review');

async function reviewsPage(req, res) {
  const reviews = await Review.findAll({
    where: { approved: true },
    order: [['id', 'DESC']]
  });

  res.render('pages/reviews', {
    user: req.session.user || null,
    reviews
  });

}

async function submitReview(req, res) {
  const { name, rating, text } = req.body;
  const r = parseInt(rating, 10);

  if (!name || !text || isNaN(r) || r < 1 || r > 5) {
    req.session.flash = { type: 'error', message: 'Заполните все поля корректно.' };
    return res.redirect('/reviews');
  }

  await Review.create({ name: name.trim(), rating: r, text: text.trim(), approved: false });

  req.session.flash = { type: 'success', message: 'Спасибо за отзыв! Он будет опубликован после модерации.' };
  res.redirect('/reviews');
}

module.exports = { reviewsPage, submitReview };
