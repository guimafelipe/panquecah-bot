const	TelegramBot = require('node-telegram-bot-api'),
		dotenv = require('dotenv'),
		mongoose = require('mongoose');

dotenv.config();

const { TOKEN, PORT, APP_URL, DB_URI} = process.env;

const options = {
	webHook: {
		port: PORT || 443
	}
};

const url = APP_URL || 'https://panquecah-bot.herokuapp.com:443';

let bot;

if('IS_DEV' in process.env){
	bot = new TelegramBot(TOKEN, {polling: true});
} else {
	bot = new TelegramBot(TOKEN, options);

	bot.setWebHook(`${url}/bot${TOKEN}`);
}

const 	handlers = require('./message_handlers/handlers'),
		error_handlers = require('./error_handlers/handlers'),
		reminder = require('./hp_handlers/reminder'),
		stickers = require('./sticker_and_gifs_handlers/handlers'),
		commands = require('./commands/commands'),
		add_sticker = require('./add_sticker_service/handlers_sticker'),
		add_gif = require('./add_sticker_service/handlers_gif'),
		hp_handlers = require('./hp_handlers/handlers'),
		info_handler = require('./hp_handlers/info_handler');

mongoose.connect(DB_URI || 'mongodb://localhost:27017/panquecahbot',
				{useNewUrlParser: true}).catch(error => {
					console.log("erro ao conectar no db");
					console.log(error);
				});

handlers.set_bot(bot);
hp_handlers.set_bot(bot);
info_handler.set_bot(bot);
reminder.set_bot(bot);
stickers.set_bot(bot);
commands.set_bot(bot, info_handler);
add_sticker.set_bot(bot);
add_gif.set_bot(bot);
error_handlers.set_bot(bot);
