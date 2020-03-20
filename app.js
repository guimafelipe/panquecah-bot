const TelegramBot = require('node-telegram-bot-api'),
	  dotenv = require('dotenv'),
	  mongoose = require('mongoose');

dotenv.config();

const { TOKEN, PORT, APP_URL, MONGODB_URI} = process.env;

const options = {
	webHook: {
		port: PORT || 443
	}
}

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
		hp_handlers = require('./hp_handlers/handlers');

mongoose.connect(MONGODB_URI ||
				'mongodb://localhost:27017/panquecahbot',
				 {useNewUrlParser: true}).catch(error => {
					console.log("erro ao conectar no db");
					console.log(error);
				 });

handlers.set_bot(bot);
hp_handlers.set_bot(bot);
reminder.set_bot(bot);
stickers.set_bot(bot);
commands.set_bot(bot);
error_handlers.set_bot(bot);
