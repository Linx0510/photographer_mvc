/**
 * AI-чатбот фотостудии AMIRXWMI
 *
 * Используется собственная нейросеть (MLP), реализованная с нуля.
 * Алгоритм: многослойный перцептрон (2 скрытых слоя) с SGD и backpropagation.
 * Векторизация текста: Bag of Words по словарю из обучающих примеров.
 * Внешних API не используется.
 */

const { NeuralNetwork } = require('./neuralNet');
const { INTENTS, TRAINING_EXAMPLES } = require('./trainingData');
const { Certificate } = require('../models/Certificate');
const { BookingSlot } = require('../models/BookingSlot');

// =====================================================================
// Предобработка текста
// =====================================================================

/** Убрать пунктуацию, привести к нижнему регистру, разбить на токены */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^а-яёa-z0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1);
}

/** Построить словарь из всех токенов обучающего набора */
function buildVocabulary(examples) {
  const vocab = new Set();
  for (const ex of examples) {
    for (const token of tokenize(ex.text)) {
      vocab.add(token);
    }
  }
  return Array.from(vocab).sort();
}

/** Преобразовать текст в Bag-of-Words вектор */
function textToVector(text, vocabulary) {
  const tokens = new Set(tokenize(text));
  return vocabulary.map(word => (tokens.has(word) ? 1 : 0));
}

/** Преобразовать метку класса в one-hot вектор */
function intentToOneHot(intent, intents) {
  return intents.map(i => (i === intent ? 1 : 0));
}

// =====================================================================
// Обучение нейросети (выполняется один раз при запуске)
// =====================================================================

const VOCABULARY = buildVocabulary(TRAINING_EXAMPLES);
const INPUT_SIZE = VOCABULARY.length;

// Архитектура: Input(N) → Hidden(48) → Hidden(24) → Output(5)
// lr=0.005, momentum=0.9 — стабильное обучение на малом датасете
const nn = new NeuralNetwork(INPUT_SIZE, 48, 24, INTENTS.length, 0.005, 0.9);

function trainModel() {
  console.log(`Обучение нейросети: словарь ${INPUT_SIZE} слов, ${TRAINING_EXAMPLES.length} примеров...`);

  const data = TRAINING_EXAMPLES.map(ex => ({
    input: textToVector(ex.text, VOCABULARY),
    output: intentToOneHot(ex.intent, INTENTS),
  }));

  nn.train(data, 4000);
  console.log('Нейросеть обучена успешно.');
}

// Запустить обучение синхронно при загрузке модуля
trainModel();

// =====================================================================
// Генерация ответов на основе намерения
// =====================================================================

async function buildResponse(intent, userMessage) {
  switch (intent) {
    case 'greeting':
      return 'Привет! 👋 Я помощник фотостудии AMIRXWMI. Могу рассказать о ценах на фотосессии, показать свободные даты для записи или рассказать о студии. Что вас интересует?';

    case 'price': {
      try {
        const certs = await Certificate.findAll({ order: [['sort', 'ASC']] });
        if (!certs.length) return 'Информация о ценах временно недоступна.';
        const lines = certs.map(c => {
          const perks = JSON.parse(c.perks || '[]');
          return `📸 **${c.title}** — ${c.price.toLocaleString('ru-RU')} ₽\n   ${perks.join(', ')}`;
        });
        return `💰 Актуальные цены на фотосессии:\n\n${lines.join('\n\n')}\n\nЕсть вопросы по условиям? Готов ответить!`;
      } catch {
        return 'Не удалось загрузить прайс. Пожалуйста, свяжитесь с нами напрямую.';
      }
    }

    case 'availability': {
      try {
        const slots = await BookingSlot.findAll({
          where: { isAvailable: true },
          order: [['date', 'ASC'], ['time', 'ASC']],
          limit: 8,
        });
        if (!slots.length) {
          return 'К сожалению, на ближайшее время все слоты заняты. 😔 Напишите нам — обсудим подходящее время!';
        }
        const lines = slots.map(s =>
          `📅 ${formatDate(s.date)} в ${s.time} (${s.duration} ч)`
        );
        return `✅ Ближайшие свободные окошки:\n\n${lines.join('\n')}\n\nЧтобы забронировать — перейдите в раздел Контакты или напишите напрямую!`;
      } catch {
        return 'Не удалось загрузить расписание. Пожалуйста, свяжитесь с нами.';
      }
    }

    case 'info':
      return `ℹ️ **AMIRXWMI Photography** — студия профессиональной фотографии в Оренбурге.\n\n` +
        `👤 Фотограф: Амира\n` +
        `📍 Оренбург и Оренбургская область (выезд по России)\n` +
        `🕐 Работаем ежедневно: 9:00 – 21:00\n` +
        `📷 Оборудование: Canon EOS R5, DJI Mavic 3 (аэросъемка)\n` +
        `🏆 Опыт: более 5 лет, 500+ клиентов\n\n` +
        `Снимаем: Love Story, портреты, семейные и свадебные фотосессии, события.`;

    case 'booking':
      return `📋 **Как записаться на фотосессию:**\n\n` +
        `1️⃣ Перейдите в раздел **Контакты** на сайте\n` +
        `2️⃣ Оставьте заявку через форму обратной связи\n` +
        `3️⃣ Или напишите напрямую:\n` +
        `   • Telegram: @amirxwmi\n` +
        `   • Instagram: @amirxwmi\n` +
        `   • Email: hello@amirxwmi.ru\n` +
        `   • Телефон: +7 999 123-45-67\n\n` +
        `Также можно приобрести **Подарочный сертификат** — отличный подарок!`;

    default:
      return 'Я не совсем понял ваш вопрос. Я могу рассказать о **ценах**, **свободных датах** для записи, или помочь **связаться** с фотографом. Спросите, пожалуйста, подробнее!';
  }
}

// =====================================================================
// Основная функция обработки сообщения
// =====================================================================

/**
 * Обработать сообщение пользователя
 * @param {string} userMessage
 * @returns {Promise<string>} ответ чатбота
 */
async function getChatResponse(userMessage) {
  if (!userMessage || userMessage.trim().length === 0) {
    return 'Пожалуйста, введите ваш вопрос.';
  }

  const inputVector = textToVector(userMessage, VOCABULARY);

  // Если нет ни одного известного слова — вектор нулевой, нейросеть не поможет
  const hasKnownWords = inputVector.some(v => v > 0);
  if (!hasKnownWords) {
    return 'Я не совсем понял ваш вопрос. Попробуйте спросить о ценах, свободных датах или записи на фотосессию.';
  }

  const result = nn.predict(inputVector, INTENTS);

  console.log(`[Чатбот] Вопрос: "${userMessage}" → интент: ${result.label} (уверенность: ${(result.confidence * 100).toFixed(1)}%)`);

  // Если нейросеть не уверена (< 40%) — попросить уточнить
  if (result.confidence < 0.40) {
    return 'Я не совсем понял ваш вопрос. Попробуйте спросить о ценах, свободных датах или записи на фотосессию.';
  }

  return buildResponse(result.label, userMessage);
}

// =====================================================================
// Утилиты
// =====================================================================

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' });
}

module.exports = { getChatResponse };
