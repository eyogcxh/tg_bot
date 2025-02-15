const TelegramApi = require('node-telegram-bot-api')
const { options, again } = require('./options')

const token = '7690931384:AAGifnBInN4x4FoP6BK8npPAGoaZA80RZ2E'

const bot = new TelegramApi(token, { polling: true });

const chats = {};

const startGame = async (chatId) => {
  await bot.sendMessage(chatId, 'Угадай цифру от 1 до 3');
  const randomNumber = Math.floor(Math.random() * 3) + 1;
  chats[chatId] = `${randomNumber}`;
  await bot.sendMessage(chatId, 'game test', options);
};

const start = () => {
  bot.setMyCommands([
    { command: '/start', description: 'Приветствие' },
    { command: '/info', description: 'Информация о боте' },
    { command: '/start_test', description: 'Игровой режим' }
  ]);

  bot.on('message', async msg => {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === '/start') {
      return bot.sendMessage(chatId, `Hello ${msg.from.first_name}`);
    }
    if (text === '/info') {
      return bot.sendMessage(chatId, 'info text');
    }
    if (text === '/start_test') {
      return startGame(chatId);
    }

    return bot.sendMessage(chatId, 'Я тебя не понимаю');
  });

  bot.on('callback_query', async query => {
    const data = query.data;
    const chatId = query.message.chat.id;

    await bot.answerCallbackQuery(query.id);

    if (data === 'again') {
      return startGame(chatId);
    }

    if (data === chats[chatId]) {
      return bot.sendMessage(chatId, `Молодец, ты отгадал цифру ${chats[chatId]}! 🎉`, again);
    } else {
      return bot.sendMessage(chatId, `Ты не угадал 😔 Загадана цифра ${chats[chatId]}.`, again);
    }
  });
};

start();
