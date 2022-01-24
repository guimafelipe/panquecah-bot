const	Group		= require('../models/group'),
		hp_phrases	= require('./hp_words.json'),
		utils		= require('../utils/utils');

const standart_message = 'Oi, __name__ panquecah! Estou com saudades!';
const MAX_HP = 10;
const DEAD_LOVE_STICKER = 'CAACAgQAAx0CVxgUxQACAQ5ec9vZEq4-Zvs9MOw0440wk7jamgACiwADS2nuEDLWeAeRE5xUGAQ';

const handlers = module.exports = {};


handlers.set_bot = function (bot) {
	this.bot = bot;
	this.init();
};


// This method checks if the group of this message is already in the database
async function checkIfIncluded(msg){
	const group_id = msg.chat.id;

	try{
		// Getting the group in database
		let group = await Group.findOne({group_id});

		// If not in database, create it
		if(!group){
			group = await Group.create({group_id});
		}

		const username = msg.from.username;
		const name = msg.from.first_name;
		const userid = msg.from.id;

		// Getting if the person is in the group in database
		const person = group.people.find(el => el.userid === userid);

		if(person){
			// If in the group, updates the time of its last
			// message on the group, and other informations
			person.last_message_date = Date.now();
			person.name = name;
			person.reminded = false;
			await group.save();
		} else {
			// If not in the group, we create it
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
	} catch(err){
		console.log("Erro no checkIfIncluded");
		console.log(err);
	}

}


// This method gets the stickers of the group in database,
// which are the stickers created by its members for the given command.
// returns an array
handlers.get_group_stickers = async function(group_id, pattern){
	try{
		const group = await Group.findOne({group_id});
		let commands = group.commands;
		let command = commands.find(el => el.name === pattern);
		return command.stickers;
	} catch(e) {
		console.log("Erro ao pegar stickers do grupo");
		console.log(e);
		// We return a empty array if something goes wrong
		let arr = [];
		return arr;
	}
}


// This method gets the gifs of the group in database,
// which are the gifs created by its members for the given command.
// returns an array
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


// This method try to send a sticker for a given commnad.
// It also respect some probability
handlers.send_sticker = async function(group_id, phrase){
	try{
		// Getting a random number to decide if the sticker
		// will be sent or not.
		let p = Math.random();

		// Defining the theshold to send the sticker.
		// 99% of chance when testing.
		let threshold = ('IS_DEV' in process.env) ? 0.99 : 0.25;

		// If it is a sticker that is set to be always sent.
		if(phrase.special) p = 0.0;

		// If the number is greater than the threshhold, we
		// don't send the sticker
		if(p > threshold) return;

		const bot = this.bot;

		let n = 0;
		// getting the stickers defined in the json
		if(phrase.stickers){
			n = phrase.stickers.length;
		}
		let m = 0;
		// getting the gifs defined in the json
		if(phrase.gifs){
			m = phrase.gifs.length;
		}

		// Getting the stickers defined by the members
		let group_stickers =
			await this.get_group_stickers(group_id, phrase.pattern);
		group_stickers = group_stickers.map(el => el.code);

		// cuidado com undefined
		let o = group_stickers.length | 0;

		// Getting the gifs defined by the members
		let group_gifs = 
			await this.get_group_gifs(group_id, phrase.pattern);
		group_gifs = group_gifs.map(el => el.code);
			
		let q = group_gifs.length | 0;

		console.log("Processing response for command " + phrase.pattern + ".");
		console.log("Group stickers for this command:")
		console.log(group_stickers);
		console.log("Group gifs for this command:")
		console.log(group_gifs);

		console.log("Number of standart stickers for this command: " + n);
		console.log("Number of standart gifs for this command: " + m);
		console.log("Number of group stickers for this command: " + o);
		console.log("Number of group stickers for this command: " + q);
		console.log("Total number of options: " + (n+m+o+q));

		// Picking a random sticker/gif in the sample
		// i is a index, and this value will be used to
		// select the sticker/gif
		let i = Math.floor(Math.random()*(n+m+o+q));

		console.log("Choosen one: " + i);

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


handlers.att_command = async function(phrase, group_id){
	// Here, we insert this command in the group in database, to
	// further the members be able to insert stickers/gifs and
	// also to count the number of usages
	const group = await Group.findOne({group_id});
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
		await group.save();
	} catch(e){
		console.log("Erro no comando");
		console.log(e);
	}
	// fim att comandos
}


handlers.execute_simple = async function(msg, i){
	const bot = this.bot;
	// Getting the command information in the json
	const phrase = hp_phrases.regular[i];

	const group_id = msg.chat.id;
	try{

		// Atualizando comando no database do grupo
		this.att_command(phrase, group_id);

		const group = await Group.findOne({group_id});

		// Try to send sticker/gif
		await this.send_sticker(group_id, phrase);

		// Save the state of the group in database
		await group.save();

	} catch(e){
		console.log("Erro na execução do hp response simple");
		console.log(e);
	}
}


// This method executes a response for a command
handlers.execute_hp_response = async function(msg, i){
	const bot = this.bot;
	// Getting the command information in the json
	const phrase = hp_phrases.regular[i];

	// Target is the owner of the "reply_to" message
	const target_name = msg.reply_to_message.from.first_name,
			target_id = msg.reply_to_message.from.id;
	
	// From is the person who sent the command
	const from_name = msg.from.first_name;
	const from_id = msg.from.id;

	// If this command have a response text, we insert
	// the names of the people involved in the text
	const response_text = phrase.phrase ? phrase.phrase
		.replace(/__nome1__/gi, target_name)
		.replace(/__nome2__/gi, from_name) : null;

	const group_id = msg.chat.id;

	try{
		// Atualizando comando no database do grupo
		this.att_command(phrase, group_id);

		const group = await Group.findOne({group_id});

		// já foi incluso na chamada do check if included
		const user = group.people.find(el => el.userid === target_id);
		const curr_hp = user.hp;
		const damage = phrase.damage;

		// Doing the damage
		let new_hp = curr_hp - damage;

		let died = false;

		// Check if the person died, and counting it
		if(new_hp <= 0){
			died = true;
			new_hp = MAX_HP;
			user.deaths++;
		}

		user.hp = new_hp;

		// If there is a response text, we always send it
		if(response_text){
			await bot.sendMessage(group_id, response_text);
		}

		// Try to send sticker/gif
		await this.send_sticker(group_id, phrase);

		// If the person died, send the message indicating it
		if(died){
			const finalMsg = hp_phrases.finalMsg
							.replace(/__nome1__/i, target_name);	

			const assassin = group.people
							.find(el => el.userid === from_id);

			// Counting kills to the author in the database
			assassin.killcount++;

			await bot.sendMessage(group_id, finalMsg);
			bot.sendSticker(group_id, DEAD_LOVE_STICKER, {});
		}

		// Save the state of the group in database
		await group.save();

	} catch(e){
		console.log("Erro na execução do hp response");
		console.log(e);
	}
}


handlers.responding_hp = function(msg){

	const phrases = hp_phrases.regular;
	const {text} = msg;

	const ind = phrases.findIndex(({pattern}) => 
		utils.checkEquality(msg, pattern));

	if(ind == -1) return;

	// Test if message is a reply. If not, we execute if special
	if(!msg.hasOwnProperty('reply_to_message') && phrases[ind].special){
		this.execute_simple(msg, ind);
		return;
	}

	// Não responder bot
	if(msg.reply_to_message.from.is_bot){
		return;
	}

	this.execute_hp_response(msg, ind);

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
