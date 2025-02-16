const TelegramApi = require('node-telegram-bot-api');
const { options, again } = require('./options');
const sequelize = require('./db');
const UserModel = require('./models');

const token = '7690931384:AAGifnBInN4x4FoP6BK8npPAGoaZA80RZ2E';
const bot = new TelegramApi(token, { polling: true });
const chats = {};

const BOT_COMMANDS = [
    { command: '/start', description: 'Приветствие' },
    { command: '/info', description: 'Информация о боте' },
    { command: '/start_test', description: 'Игровой режим' }
];

const startGame = async (chatId) => {
    try {
        if (chats[chatId]?.message_id) {
            await bot.deleteMessage(chatId, chats[chatId].message_id);
        }

        const message = await bot.sendMessage(chatId, 'Угадай цифру от 1 до 3', options);
        const randomNumber = Math.floor(Math.random() * 3) + 1;
        
        chats[chatId] = {
            number: randomNumber.toString(),
            message_id: message.message_id
        };
    } catch (error) {
        console.error('Ошибка в startGame:', error);
        await bot.sendMessage(chatId, 'Произошла ошибка при запуске игры');
    }
};

const handleCommand = async (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;

  try {
      switch (text) {
          case '/start':
              console.log('Начало обработки команды /start');
              console.log('chatId:', chatId);
              console.log('msg.from:', msg.from);
              
              const [user, created] = await UserModel.findOrCreate({ 
                  where: { chatId: chatId.toString() },
                  defaults: { 
                      username: msg.from.first_name, 
                      rightAnswers: 0, 
                      worngAnswers: 0 
                  }
              });
              
              console.log('Результат findOrCreate:', { user, created });
              
              const message = await bot.sendMessage(chatId, `Привет, ${msg.from.first_name}! 👋`);
              console.log('Сообщение отправлено:', message);
              return message;

          case '/info':
              const existingUser = await UserModel.findOne({ 
                  where: { chatId: chatId.toString() } 
              });
              if (!existingUser) {
                  return bot.sendMessage(chatId, 'Пользователь не найден. Используйте /start для регистрации');
              }
              return bot.sendMessage(
                  chatId, 
                  `Статистика:\n✅ Правильных ответов: ${existingUser.rightAnswers}\n❌ Неправильных ответов: ${existingUser.worngAnswers}\nИмя: ${existingUser.username}`
              );

          case '/start_test':
              return startGame(chatId);

          default:
              return bot.sendMessage(chatId, 'Я не понимаю эту команду 🤔');
      }
  } catch (error) {
      console.error('Подробности ошибки:', error.message);
      return bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте позже');
  }
};

const handleGameResponse = async (query) => {
  try {
      const data = query.data;
      const chatId = query.message.chat.id;
      const messageId = query.message.message_id;
      
      const user = await UserModel.findOne({ 
          where: { chatId: chatId.toString() }
      });

      if (!user) {
          await bot.sendMessage(chatId, 'Пользователь не найден. Используйте /start для регистрации');
          return;
      }

      await bot.answerCallbackQuery(query.id);

      if (data === 'again') {
          return startGame(chatId);
      }

      const correctNumber = chats[chatId]?.number;
      let responseText;

      if (data === correctNumber) {
          user.rightAnswers += 1;
          await user.save();
          responseText = `Молодец, ты отгадал цифру ${correctNumber}! 🎉`;
      } else {
          user.worngAnswers += 1;
          await user.save();
          responseText = `Ты не угадал 😔 Загадана цифра ${correctNumber}.`;
      }

      await bot.editMessageText(responseText, {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: again.reply_markup
      });

      delete chats[chatId];

  } catch (error) {
      console.error('Ошибка в callback_query:', error);
      await bot.sendMessage(query.message.chat.id, 'Произошла ошибка при обработке ответа');
  }
};

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: true }); 
        console.log('Успешное подключение к базе данных');

        await bot.setMyCommands(BOT_COMMANDS);

        bot.on('message', handleCommand);
        bot.on('callback_query', handleGameResponse);

    } catch (error) {
        console.error('Ошибка запуска бота:', error);
    }
};

start();