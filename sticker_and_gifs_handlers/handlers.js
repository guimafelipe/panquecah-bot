const utils = require('../utils/utils');

const 	TURURU_STICKER = 'CAACAgEAAx0CVxgUxQAD0F5xi8Do-HSvuifLtZvEh1YWb8ODAAIIAAMyNGYr8ugkbSOLEBcYBA',
		SHIMONETA_STICKER = 'CAACAgIAAx0CVxgUxQAD015xjdSCgyJKWTldD50HP5qfkMEYAAJ7AQACEBptIhGjSCn6lIQGGAQ',
		BONK_GIFS = [
		'CgACAgQAAx0CVxgUxQACA-1fpeV49k3nR3D23o226uK14bJc0wACLQIAAuB7zFKPRiippbFIGR4E',
		'CgACAgQAAx0CVxgUxQACB95gvCUIpC9Sla5gLOQ0LqaHcktmtAACtgIAAvpYZFIdsSg9FhGHjR8E'
		],
		BONK_IMGS = [
		'AgACAgEAAx0CVxgUxQACA8pfpd2f0Z_8cGo2wRQufXYmQqomjwACf6kxG2pnMUX3bL7f28nOaIAIc0oXAAMBAAMCAANtAAOlUQACHgQ'
		];


const handlers = module.exports = {};

handlers.set_bot = function (bot) {
	this.bot = bot;
	this.init();
	this.nsfw_counter = 0;
	this.nsft_limit = 3;
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

		const bonk = "bonk";
		if(utils.checkIfContains(msg, bonk)){
			const n = BONK_GIFS.length, m = BONK_IMGS.length;
			let i = Math.floor(Math.random() * (n+m));
			let target_msg_id = msg.message_id;
			if(msg.reply_to_message){
				target_msg_id = msg.reply_to_message.message_id;
			}
			// changing to ever send the gif
			// TODO: Remove image bug
			if(true){
				bot.sendDocument(msg.chat.id,
					BONK_GIFS[i],
					{reply_to_message_id: target_msg_id});
			} else {
				i-=n;
				bot.sendPhoto(msg.chat.id,
					BONK_IMGS[i],
					{reply_to_message_id: target_msg_id});
			}
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
			this.nsfw_counter++;
			if(this.nsft_limit > this.nsfw_counter) return;
			bot.sendSticker(msg.chat.id, SHIMONETA_STICKER,
				{reply_to_message_id: msg.message_id});
			this.nsfw_counter = 0;
			this.nsft_limit	= Math.floor(Math.random()*4) + 3;
		}

	});
	
};
