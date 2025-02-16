const TelegramApi = require('node-telegram-bot-api')
const { options, again } = require('./options')
const sequelize = require('./db')
const UserModel = require('./models')

const token = '7690931384:AAGifnBInN4x4FoP6BK8npPAGoaZA80RZ2E'

const bot = new TelegramApi(token, { polling: true });

const chats = {};

const startGame = async (chatId) => {
  await bot.sendMessage(chatId, 'Угадай цифру от 1 до 3');
  const randomNumber = Math.floor(Math.random() * 3) + 1;
  chats[chatId] = `${randomNumber}`;
  await bot.sendMessage(chatId, 'game test', options);
};

const start = async () => {

  try {
    await sequelize.authenticate()
    await sequelize.sync()
  } catch (err) {
      console.error('Conection error', err)
  }

  bot.setMyCommands([
    { command: '/start', description: 'Приветствие' },
    { command: '/info', description: 'Информация о боте' },
    { command: '/start_test', description: 'Игровой режим' }
  ]);

  bot.on('message', async msg => {
    const text = msg.text;
    const chatId = msg.chat.id;

    try {
      if (text === '/start') {
        await UserModel.create({ chatId })
        return bot.sendMessage(chatId, `Hello ${msg.from.first_name}`);
      }
      if (text === '/info') {
        const user = await UserModel.findOne({ chatId })
        return bot.sendMessage(chatId, `Кол-во правильных овтветов ${user.rightAnswers}, кол-во неправильных ответов ${user.worngAnswers}`);
      }
      if (text === '/start_test') {
        return startGame(chatId);
      }
  
      return bot.sendMessage(chatId, 'Я тебя не понимаю');
    } catch (err) {
      return bot.sendMessage(chatId, 'Ошибка на сервевре. Уже идут ремонтные работы')
    }
  });

  bot.on('callback_query', async query => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const user = await UserModel.findOne({ chatId })
    await bot.answerCallbackQuery(query.id);

    if (data === 'again') {
      return startGame(chatId);
    }

    if (data === chats[chatId]) {
      user.rightAnswers += 1
      await bot.sendMessage(chatId, `Молодец, ты отгадал цифру ${chats[chatId]}! 🎉`, again);
    } else {
      user.worngAnswers += 1
      await bot.sendMessage(chatId, `Ты не угадал 😔 Загадана цифра ${chats[chatId]}.`, again);
    }
  });
};

start();
