const 	Group		= require('../models/group'),
		utils		= require('../utils/utils'),
		emoji		= require('node-emoji').emoji;
		mongoose	= require('mongoose');

const commands = module.exports = {};

commands.set_bot = function (bot, hp_handler) {
	this.bot = bot;
	this.hp_handler = hp_handler;
	this.init();
};

commands.init = function(){

	const bot = this.bot;

	if(!bot){
		console.log("Error, no bot initialized");
		return;
	}

	bot.onText(/\/comandos/, async (msg) => {
		await this.hp_handler.get_all_commands(msg);
	});

	bot.onText(/\/sticker/, async (msg) => {
		await this.hp_handler.get_all_stickers(msg);
	});

	let topmortos = ["\/topmortos", "\/topmortes"];
	let retopmortos = new RegExp(topmortos.join("|", "i"));
	bot.onText(retopmortos, async (msg) => {
		await this.hp_handler.get_top_death(msg);
	});

	let topkill = ["\/topkillers", "\/topkill", "\/topkills"];
	let retopkill = new RegExp(topkill.join("|", "i"));
	bot.onText(retopkill, async (msg) => {
		await this.hp_handler.get_top_kill(msg);
	});

	bot.onText(/\/topcomandos/, async (msg) => {
		await this.hp_handler.get_top_commands(msg);
	});

}
