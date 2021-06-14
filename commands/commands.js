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

commands.getHp = async function(msg) {
	const group_id = msg.chat.id;
	const userid = msg.from.id;

	try{
		const group = await Group.findOne({group_id});
		const person = group.people.find((el) => {
			return el.userid === userid;
		});
		
		return person.hp;

	} catch(e) {
		console.log(e);
	}
}

commands.hpInfo = function (msg, hp){
	if(hp > 10) hp = 10;
	const msg1 = `${msg.from.first_name} tem ${hp} HP.\n`;
	let msg2 = '\n\n';
	for(let i = 0; i < hp; i++){
		msg2 += emoji.heart;
	}
	return msg1 + msg2;
}

commands.init = function(){

	const bot = this.bot;

	if(!bot){
		console.log("Error, no bot initialized");
		return;
	}

	bot.onText(/\/hp/, async (msg) => {
		try{
			const hp = await this.getHp(msg);
			bot.sendMessage(msg.chat.id, this.hpInfo(msg, hp));
		} catch(e) {
			console.log(e);
			bot.sendMessage(msg.chat.id, "Não achei seu hp :/");
		}
	});

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
