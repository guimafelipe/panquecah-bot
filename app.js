const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

dotenv.config();

const TOKEN = process.env.TOKEN;
const bot = new TelegramBot(TOKEN, {polling: true});

const handlers = require('./message_handlers/handlers');

handlers.set_bot(bot);
