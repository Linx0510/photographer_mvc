/**
 * Датасет для обучения нейросети чатбота фотографа.
 * Каждый пример: { text: string, intent: string }
 *
 * Классы (намерения):
 *  - 'price'        — вопросы о ценах
 *  - 'availability' — вопросы о свободных датах/слотах
 *  - 'greeting'     — приветствия
 *  - 'info'         — информация о студии, услугах, оборудовании
 *  - 'booking'      — как записаться/забронировать
 */
const INTENTS = ['price', 'availability', 'greeting', 'info', 'booking'];

const TRAINING_EXAMPLES = [
  // ======== ЦЕНЫ ========
  { text: 'сколько стоит фотосессия',       intent: 'price' },
  { text: 'какая цена за съемку',           intent: 'price' },
  { text: 'стоимость фотосессии',           intent: 'price' },
  { text: 'сколько стоит час съемки',       intent: 'price' },
  { text: 'сколько берете за работу',       intent: 'price' },
  { text: 'цена фотографа',                 intent: 'price' },
  { text: 'прайс на услуги',                intent: 'price' },
  { text: 'расценки на фотосессию',         intent: 'price' },
  { text: 'во сколько обойдется съемка',    intent: 'price' },
  { text: 'какой тариф',                    intent: 'price' },
  { text: 'сколько денег нужно за фото',    intent: 'price' },
  { text: 'бюджет на фотосессию',           intent: 'price' },
  { text: 'платная съемка',                 intent: 'price' },
  { text: 'ваши цены',                      intent: 'price' },
  { text: 'прейскурант',                    intent: 'price' },
  { text: 'минимальная цена',               intent: 'price' },
  { text: 'сертификат стоимость',           intent: 'price' },
  { text: 'сколько за два часа',            intent: 'price' },
  { text: 'цены на сертификаты',            intent: 'price' },
  { text: 'самый дешевый вариант',          intent: 'price' },

  // ======== СВОБОДНЫЕ ДАТЫ / СЛОТЫ ========
  { text: 'какие свободные даты',           intent: 'availability' },
  { text: 'есть ли свободное время',        intent: 'availability' },
  { text: 'когда можно записаться',         intent: 'availability' },
  { text: 'свободные окошки',               intent: 'availability' },
  { text: 'ближайшая свободная дата',       intent: 'availability' },
  { text: 'когда вы свободны',              intent: 'availability' },
  { text: 'доступные слоты',                intent: 'availability' },
  { text: 'расписание фотографа',           intent: 'availability' },
  { text: 'запись на съемку',               intent: 'availability' },
  { text: 'свободное время для съемки',     intent: 'availability' },
  { text: 'когда есть место',               intent: 'availability' },
  { text: 'на какую дату можно',            intent: 'availability' },
  { text: 'есть ли место на выходные',      intent: 'availability' },
  { text: 'ближайшее время для записи',     intent: 'availability' },
  { text: 'когда следующая свободная дата', intent: 'availability' },
  { text: 'занята ли суббота',              intent: 'availability' },
  { text: 'хочу знать расписание',          intent: 'availability' },
  { text: 'доступные даты для фотосессии',  intent: 'availability' },
  { text: 'какие числа свободны',           intent: 'availability' },
  { text: 'незанятые дни',                  intent: 'availability' },

  // ======== ПРИВЕТСТВИЕ ========
  { text: 'привет',                         intent: 'greeting' },
  { text: 'здравствуйте',                   intent: 'greeting' },
  { text: 'добрый день',                    intent: 'greeting' },
  { text: 'добрый вечер',                   intent: 'greeting' },
  { text: 'доброе утро',                    intent: 'greeting' },
  { text: 'приветствую',                    intent: 'greeting' },
  { text: 'хай',                            intent: 'greeting' },
  { text: 'хелло',                          intent: 'greeting' },
  { text: 'здравствуй',                     intent: 'greeting' },
  { text: 'добрый',                         intent: 'greeting' },
  { text: 'приветик',                       intent: 'greeting' },
  { text: 'ало',                            intent: 'greeting' },
  { text: 'здарова',                        intent: 'greeting' },

  // ======== ИНФОРМАЦИЯ О СТУДИИ ========
  { text: 'что вы фотографируете',          intent: 'info' },
  { text: 'расскажите о себе',              intent: 'info' },
  { text: 'какие услуги оказываете',        intent: 'info' },
  { text: 'что входит в фотосессию',        intent: 'info' },
  { text: 'какое оборудование используете', intent: 'info' },
  { text: 'фотоаппарат камера',             intent: 'info' },
  { text: 'опыт работы фотографа',          intent: 'info' },
  { text: 'сколько лет работаете',          intent: 'info' },
  { text: 'где находитесь',                 intent: 'info' },
  { text: 'в каком городе',                 intent: 'info' },
  { text: 'оренбург',                       intent: 'info' },
  { text: 'как вас зовут',                  intent: 'info' },
  { text: 'имя фотографа',                  intent: 'info' },
  { text: 'любовная история фото',          intent: 'info' },
  { text: 'семейная съемка',                intent: 'info' },
  { text: 'свадебная съемка',               intent: 'info' },
  { text: 'портретная съемка',              intent: 'info' },
  { text: 'дрон аэросъемка',               intent: 'info' },
  { text: 'режим работы',                   intent: 'info' },
  { text: 'время работы',                   intent: 'info' },
  { text: 'часы работы',                    intent: 'info' },

  // ======== КАК ЗАПИСАТЬСЯ / СВЯЗАТЬСЯ ========
  { text: 'как записаться на фотосессию',   intent: 'booking' },
  { text: 'хочу записаться',                intent: 'booking' },
  { text: 'оставить заявку',                intent: 'booking' },
  { text: 'забронировать время',            intent: 'booking' },
  { text: 'как заказать фотосессию',        intent: 'booking' },
  { text: 'хочу фотосессию',                intent: 'booking' },
  { text: 'как связаться с вами',           intent: 'booking' },
  { text: 'телефон фотографа',              intent: 'booking' },
  { text: 'контакты для связи',             intent: 'booking' },
  { text: 'написать фотографу',             intent: 'booking' },
  { text: 'заявка на съемку',               intent: 'booking' },
  { text: 'позвонить фотографу',            intent: 'booking' },
  { text: 'telegram фотограф',              intent: 'booking' },
  { text: 'инстаграм',                      intent: 'booking' },
  { text: 'как связаться',                  intent: 'booking' },
];

module.exports = { INTENTS, TRAINING_EXAMPLES };
