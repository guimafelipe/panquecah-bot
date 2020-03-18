const utils = require('../utils/utils');

const 	TURURU_STICKER = 'CAACAgEAAx0CVxgUxQAD0F5xi8Do-HSvuifLtZvEh1YWb8ODAAIIAAMyNGYr8ugkbSOLEBcYBA',
		SHIMONETA_STICKER = 'CAACAgIAAx0CVxgUxQAD015xjdSCgyJKWTldD50HP5qfkMEYAAJ7AQACEBptIhGjSCn6lIQGGAQ';

const handlers = module.exports = {};

handlers.set_bot = function (bot) {
	this.bot = bot;
	this.init();
};

handlers.init = function(){

	const bot = this.bot;

	if(!bot){
		console.log("Error, no bot initialized");
		return;
	}

	bot.on('message', (msg) => {

		if(!msg.hasOwnProperty('text')){
			console.log("STICKER");
			console.log(msg);
			return;
		}

		const tururu = "tururu";
		if(utils.checkIfContains(msg, tururu)){
			bot.sendSticker(msg.chat.id,
			TURURU_STICKER,
			{reply_to_message_id: msg.message_id});
		}

		// A parte de baixo não é de autoria minha.
		// Apenas atendo requisições dos meus pertubados amigos.
		const nsfw_arr =	['sexo', 'nsfw', 'transa', 'tesão',
							'buceta', 'pau', 'pinto'];

		if(utils.checkMultiple(msg, nsfw_arr)){
			bot.sendSticker(msg.chat.id,
			SHIMONETA_STICKER,
			{reply_to_message_id: msg.message_id});
		}

	});
	
};
