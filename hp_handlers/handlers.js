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
	
	// TODO: Refactor code below to async/await
	Group.findOne({group_id}, async function(err, group) {
		if(err){
			console.log(err);
			return;
		}
		
		try{
			if(!group){
				group = await Group.create({group_id});
			}
			
			console.log(group);
			
			const username = msg.from.username;
			const name = msg.from.first_name;
			const userid = msg.from.id;
			const user = group.people.filter(function(person){
				return person.userid === userid;	
			});

			// If user already exists in group, just return
			if(user.length != 0){
				let person = user[0];
				person.last_message_date = Date.now();
				person.name = name;
				person.reminded = false;
				group.save();
				console.log("atualizando data");
				return;
			}

			group.people.push({username,
					userid,
					name,
					hp: MAX_HP,
					hello_phrase: standart_message,
					reminded: false,
					last_message_date: Date.now(),
					reminder_cd: Date.now() + 1000*60*60*24 //1 Dia
				});

			group.save();

		} catch(e) {
			console.log(e);
		}
	});
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
		const group = await Group.findOne({group_id}).exec();

		const try_user = group.people.filter(function(person){
			return person.userid === target_id;	
		});

		// Atualizando comandos
		try{
			const command = phrase.pattern;
			const try_command = group.commands.filter(function(cmd){
					return cmd.name === command;
				});

			if(try_command.length != 0){
				let cmd = try_command[0];
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

		const user = try_user[0];
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
		const group = await Group.findOne({group_id}).exec();
		const people = group.people;

		console.log(people);

		const comp = function(a, b){
			if(a.deaths > b.deaths){
				return -1;
			} else if(a.deaths < b.deaths){
				return 1;
			} else return 0;
		}

		people.sort(comp);

		let res = "Ranking de mortes:\n\n";

		for(let i = 0; i < Math.min(10, people.length); i++){
			res += `${i+1}: ${people[i].name} - ${people[i].deaths} mortes\n`;
		}

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
		const group = await Group.findOne({group_id}).exec();
		const commands = group.commands;

		const comp = function(a, b){
			if(a.usages > b.usages){
				return -1;
			} else if(a.usages < b.usages){
				return 1;
			} else return 0;
		}

		commands.sort(comp);

		let res = "Comandos mais usados nesse grupo:\n\n";

		for(let i = 0; i < Math.min(10, commands.length); i++){
			res += `${i+1}: ${commands[i].name} - ${commands[i].usages} usos\n`;
		}

		await bot.sendMessage(group_id, res);

	} catch(e) {
		console.log("Erro na execução do get_top_commands");
		console.log(e);
	}
}

handlers.get_all_commands = function(msg){
	const phrases = hp_phrases.regular;

	let response = "Comandos da panquecah:\n";
	let pats = [];

	for(let i = 0; i < phrases.length; i++){
		const {pattern} = phrases[i];
		pats.push(pattern);
	}

	// Ordem alfabética
	pats.sort();
	
	pats.forEach(pattern => {
		response += `* ${pattern}\n`;
	});

	const group_id = msg.chat.id;
	this.bot.sendMessage(group_id, response);
	return;
}

handlers.responding_hp = function(msg){

	const phrases = hp_phrases.regular;
	const {text} = msg;

	if(utils.checkEquality(msg, "!comandos")){
		this.get_all_commands(msg);
		return;
	}

	if(utils.checkMultipleEquality(msg, ["!topmortos","!topmortes"])){
		this.get_top_death(msg);	
		return;
	}

	if(utils.checkMultipleEquality(msg, ["!topcomandos"])){
		this.get_top_commands(msg);	
		return;
	}

	// Test if message is a reply
	if(!msg.hasOwnProperty('reply_to_message')){
		return;
	}

	if(msg.reply_to_message.from.is_bot){
		return;
	}

	// TODO: refactor code below to use .findOne() 
	for(let i = 0; i < phrases.length; i++){
		const {pattern} = phrases[i];
		if(utils.checkEquality(msg, pattern)){
			this.execute_hp_response(msg, i);
			return;
		}
	}
	
}

handlers.init = function(){

	const bot = this.bot;

	if(!bot){
		console.log("Error, no bot initialized");
		return;
	}


	bot.on('message', (msg) => {

		checkIfIncluded(msg);

		if(!msg.hasOwnProperty('text')){
			return;
		}

		this.responding_hp(msg);

	});
}
