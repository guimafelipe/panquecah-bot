const	Group		= require('../models/group'),
		hp_phrases	= require('./hp_words.json'),
		utils		= require('../utils/utils'),
		mongoose	= require('mongoose');

const standart_message = 'Oi, __name__ panquecah! Estou com saudades!';
const MAX_HP = 10;
const DEAD_LOVE_STICKER = 'CAACAgQAAx0CVxgUxQACAQ5ec9vZEq4-Zvs9MOw0440wk7jamgACiwADS2nuEDLWeAeRE5xUGAQ';

const handlers = module.exports = {};

handlers.set_bot = function (bot) {
	this.bot = bot;
	this.init();
};

async function checkIfIncluded(msg){
	const group_id = msg.chat.id;

	try{
		let group = await Group.findOne({group_id});

		if(!group){
			group = await Group.create({group_id});
		}

		console.log(group);
		
		const username = msg.from.username;
		const name = msg.from.first_name;
		const userid = msg.from.id;

		const person = group.people.find(el => el.userid === userid);

		if(person){
			person.last_message_date = Date.now();
			person.name = name;
			person.reminded = false;
			await group.save();
			console.log("atualizando data");
			return;
		} else {
			group.people.push({username,
					userid,
					name,
					hp: MAX_HP,
					hello_phrase: standart_message,
					reminded: false,
					last_message_date: Date.now(),
					reminder_cd: Date.now() + 1000*60*60*24 //1 Dia
				});

			await group.save();
		}
		
	} catch(err){
		console.log(err);
		return;
	}

}

handlers.execute_hp_response = async function(msg, i){
	const bot = this.bot;
	const phrase = hp_phrases.regular[i];

	const target_name = msg.reply_to_message.from.first_name,
			target_id = msg.reply_to_message.from.id;
	
	const from_name = msg.from.first_name;
	const response_text = phrase.phrase
		.replace(/__nome1__/gi, target_name)
		.replace(/__nome2__/gi, from_name);

	const group_id = msg.chat.id;

	try{
		const group = await Group.findOne({group_id});

		// Atualizando comandos
		try{
			const command = phrase.pattern;
			let cmd = group.commands.find(el => el.name === command);

			if(cmd){
				cmd.usages++;
			} else {
				group.commands.push({
					name: command,
					usages: 1
				});
			}
		} catch(e){
			console.log("Erro no comando");
			console.log(e);
		}
		// fim att comandos

		// já foi incluso na chamada do check if included
		const user = group.people.find(el => el.userid === target_id);
		const curr_hp = user.hp;
		const damage = phrase.damage;

		let new_hp = curr_hp - damage;

		let died = false;

		if(new_hp <= 0){
			died = true;
			new_hp = MAX_HP;
			user.deaths++;
		}

		user.hp = new_hp;

		await group.save();

		await bot.sendMessage(group_id, response_text);

		const finalMsg = hp_phrases.finalMsg.replace(/__nome1__/i, target_name);	
		if(died){
			await bot.sendMessage(group_id, finalMsg);
			bot.sendSticker(group_id, DEAD_LOVE_STICKER, {});
		}

	} catch(e){
		console.log("Erro na execução do hp response");
		console.log(e);
	}
}

handlers.get_top_death = async function(msg){
	const bot = this.bot;
	const group_id = msg.chat.id;
	try {
		const group = await Group.findOne({group_id}, 'people');
		let people = group.people;

		people.sort(utils.getCompFunc('deaths'));
		people = people.slice(0, 10);

		let res = "Ranking de mortes:\n\n";

		people.forEach((person, i) => {
			res += `${i+1}: ${person.name}`;
			res += `- ${person.deaths} mortes\n`;
		});

		await bot.sendMessage(group_id, res);

	} catch(e) {
		console.log("Erro na execução do get_top_death");
		console.log(e);
	}
}

handlers.get_top_commands = async function(msg){
	const bot = this.bot;
	const group_id = msg.chat.id;

	try{
		const group = await Group.findOne({group_id}, 'commands');
		let commands = group.commands;

		commands.sort(utils.getCompFunc('usages'));
		commands = commands.slice(0, 10);

		let res = "Comandos mais usados nesse grupo:\n\n";

		commands.forEach((command, i) => {
			res += `${i+1}: ${command.name} `;
			res += `- ${command.usages} usos\n`;
		});

		await bot.sendMessage(group_id, res);

	} catch(e) {
		console.log("Erro na execução do get_top_commands");
		console.log(e);
	}
}

handlers.get_all_commands = function(msg){
	try{
		const phrases = hp_phrases.regular;

		let response = "Comandos da panquecah:\n";

		let pats = phrases.map(({pattern}) => pattern);

		// Ordem alfabética
		pats.sort();
		
		pats.forEach(pattern => {
			response += `* ${pattern}\n`;
		});

		const group_id = msg.chat.id;
		this.bot.sendMessage(group_id, response);
	} catch(e) {
		console.log("Erro na execução do get_all_commands");
		console.log(e);
	}
}

handlers.responding_hp = function(msg){

	const phrases = hp_phrases.regular;
	const {text} = msg;

	// listar os comandos do bot
	if(utils.checkEquality(msg, "!comandos")){
		this.get_all_commands(msg);
		return;
	}

	// listar os top mortos
	if(utils.checkMultipleEquality(msg, ["!topmortos","!topmortes"])){
		this.get_top_death(msg);	
		return;
	}

	// listar os top comandos
	if(utils.checkMultipleEquality(msg, ["!topcomandos"])){
		this.get_top_commands(msg);	
		return;
	}

	// Test if message is a reply
	if(!msg.hasOwnProperty('reply_to_message')){
		return;
	}

	// Não responder bot
	if(msg.reply_to_message.from.is_bot){
		return;
	}

	const ind = phrases.findIndex(({pattern}) => 
		utils.checkEquality(msg, pattern));

	if(ind != -1) this.execute_hp_response(msg, ind);

	return;
}

handlers.init = function(){

	const bot = this.bot;

	if(!bot){
		console.log("Error, no bot initialized");
		return;
	}


	bot.on('message', async (msg) => {

		await checkIfIncluded(msg);

		if(!msg.hasOwnProperty('text')){
			return;
		}

		this.responding_hp(msg);

	});
}
