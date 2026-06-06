const express = require('express');
const router = express.Router();
const { Photo } = require('../models/Photo');
const { getChatResponse } = require('../services/aiChatbot');

router.get('/api/photos', async (req, res) => {
  const offset = Math.max(0, Number(req.query.offset || 0));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 4)));

  const { count, rows } = await Photo.findAndCountAll({
    order: [['sort', 'ASC'], ['id', 'ASC']],
    offset,
    limit
  });

  res.json({
    total: count,
    offset,
    limit,
    items: rows
  });
});

router.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Сообщение не может быть пустым' });
    }

    const reply = await getChatResponse(message);
    res.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;
