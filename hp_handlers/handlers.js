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

		const username = msg.from.username;
		const name = msg.from.first_name;
		const userid = msg.from.id;

		const person = group.people.find(el => el.userid === userid);

		if(person){
			person.last_message_date = Date.now();
			person.name = name;
			person.reminded = false;
			await group.save();
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

		// console.log no grupo já atualizado com a pessoa
		// tirar depois
		//console.log(group);
	} catch(err){
		console.log("Erro no checkIfIncluded");
		console.log(err);
	}

}

handlers.get_group_stickers = async function(group_id, pattern){
	try{
		const group = await Group.findOne({group_id});
		let commands = group.commands;
		let command = commands.find(el => el.name === pattern);
		return command.stickers;
	} catch(e) {
		console.log("Erro ao pegar stickers do grupo");
		console.log(e);
		let arr = [];
		return arr;
	}
}

handlers.get_group_gifs = async function(group_id, pattern){
	try{
		const group = await Group.findOne({group_id});
		let commands = group.commands;
		let command = commands.find(el => el.name === pattern);
		return command.gifs;
	} catch(e) {
		console.log("Erro ao pegar gifs do grupo");
		console.log(e);
		let arr = [];
		return arr;
	}
}

handlers.send_sticker = async function(group_id, phrase){
	try{
		let p = Math.random();
		let threshold = ('IS_DEV' in process.env) ? 0.99 : 0.25;

		if(phrase.special) p = 0.0;

		if(p > threshold) return;

		const bot = this.bot;

		let n = 0;
		if(phrase.stickers){
			n = phrase.stickers.length;
		}
		let m = 0;
		if(phrase.gifs){
			m = phrase.gifs.length;
		}

		let group_stickers =
			await this.get_group_stickers(group_id, phrase.pattern);
		group_stickers = group_stickers.map(el => el.code);

		// cuidado com undefined
		let o = group_stickers.length | 0;

		let group_gifs = 
			await this.get_group_gifs(group_id, phrase.pattern);
		group_gifs = group_gifs.map(el => el.code);
			
		let q = group_gifs.length | 0;

		console.log(group_stickers);
		console.log(group_gifs);

		console.log(n);
		console.log(m);
		console.log(o);
		console.log(q);

		// pegar um sticker aleatório
		let i = Math.floor(Math.random()*(n+m+o+q));

		console.log(i);

		if(i < n){
			await bot.sendSticker(group_id, phrase.stickers[i], {});
			return;
		}

		i -= n;
		if(i < m){
			await bot.sendDocument(group_id, phrase.gifs[i], {});
			return;
		}

		i-= m;
		if(i < o){
			await bot.sendSticker(group_id, group_stickers[i], {});
			return;
		}

		i-= o;
		if(i < q){
			await bot.sendDocument(group_id, group_gifs[i], {});
			return;
		}

	} catch(e){
		console.log("Erro enviando sticker ou gif");
		console.log(e);
	}
}

handlers.execute_hp_response = async function(msg, i){
	const bot = this.bot;
	const phrase = hp_phrases.regular[i];

	const target_name = msg.reply_to_message.from.first_name,
			target_id = msg.reply_to_message.from.id;
	
	const from_name = msg.from.first_name;
	const from_id = msg.from.id;

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

		await bot.sendMessage(group_id, response_text);

		await this.send_sticker(group_id, phrase);

		if(died){
			const finalMsg = hp_phrases.finalMsg
							.replace(/__nome1__/i, target_name);	

			const assassin = group.people
							.find(el => el.userid === from_id);

			assassin.killcount++;

			await bot.sendMessage(group_id, finalMsg);
			bot.sendSticker(group_id, DEAD_LOVE_STICKER, {});
		}

		await group.save();

	} catch(e){
		console.log("Erro na execução do hp response");
		console.log(e);
	}
}

handlers.get_top_kill = async function(msg){
	const bot = this.bot;
	const group_id = msg.chat.id;
	try {
		const group = await Group.findOne({group_id}, 'people');
		let people = group.people;

		people.sort(utils.getCompFunc('killcount'));
		people = people.slice(0, 10);

		let res = "Ranking de assassinatos:\n\n";

		people.forEach((person, i) => {
			res += `${i+1}: ${person.name}`;
			res += `- ${person.killcount} assassinatos\n`;
		});

		await bot.sendMessage(group_id, res);

	} catch(e) {
		console.log("Erro na execução do get_top_kill");
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

handlers.get_with_stickers = async function(msg){
	try{
		const phrases = hp_phrases.regular;

		let response = "Comandos da panquecah com stickers:\n";

		let pats = phrases.filter(el => el.stickers != undefined)
							.map(({pattern}) => pattern);

		// Ordem alfabética
		pats.sort();
		
		pats.forEach(pattern => {
			response += `* ${pattern}\n`;
		});

		const group_id = msg.chat.id;
		this.bot.sendMessage(group_id, response);
	} catch(e) {
		console.log("Erro na execução do get_with_stickers");
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

	// listar os comandos com stickers
	if(utils.checkMultipleEquality(msg, ["!sticker","!stickers"])){
		this.get_with_stickers(msg);
		return;
	}

	// listar os top mortos
	if(utils.checkMultipleEquality(msg, ["!topmortos","!topmortes"])){
		this.get_top_death(msg);	
		return;
	}

	// listar os top assassinos
	const possibilities = ["!topkillers","!topkill","!topkills"];
	if(utils.checkMultipleEquality(msg, possibilities)){
		this.get_top_kill(msg);	
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
