module.exports = {
  options: {
    reply_markup: {
      inline_keyboard: [
        [{ text: '1', callback_data: '1' }, { text: '2', callback_data: '2' }, { text: '3', callback_data: '3' }]
      ]
    }
  },
  
  again: {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Начать заново', callback_data: 'again' }]
      ]
    }
  }
}