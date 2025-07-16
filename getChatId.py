import telebot
bot = telebot.TeleBot('8160508697:AAFJDed_MsKSYqDUgxQUDmiOJ_e-4oSc6Hw')

@bot.message_handler(commands=['id'])
def main(message):
    bot.send_message(message.chat.id, ' 😂Вот' + str(message))
    
@bot.channel_post_handler()
def channel_post(message):
    bot.send_message(message.chat.id, f'Канал ID: {message.chat.id}\n{message}')
    
bot.polling(none_stop=True)