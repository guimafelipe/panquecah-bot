const utils = require('../utils/utils');

const handlers = module.exports = {};

handlers.set_bot = function (bot) {
	this.bot = bot;
	this.init();
};

handlers.init = function(){

	const bot = this.bot;
	let awoCount = 0;
	let awoLimit = 3;

	if(!bot){
		console.log("Error, no bot initialized");
		return;
	}

	bot.on('message', (msg) => {

		if(!msg.hasOwnProperty('text')){
			return;
		}

		for(let key in msg){
			if(msg.hasOwnProperty(key)){
				console.log("--- " + key + ": " );
				console.log(msg[key]);
			}
		}

		const boanoite = "boa noite";
		if(utils.checkIfContains(msg, boanoite)){
			bot.sendMessage(msg.chat.id,
			"Boa noite, " + msg.from.first_name + " panquecah!!",
			{reply_to_message_id: msg.message_id});
		}

		const bomdia = "bom dia";
		if(utils.checkIfContains(msg, bomdia)){
			bot.sendMessage(msg.chat.id,
			"Bom dia, " + msg.from.first_name + " vadiah!!",
			{reply_to_message_id: msg.message_id});
		}
		
		const amado = "amado?", amada = "amada?";
		if(utils.checkIfContains(msg, amada)){
			bot.sendMessage(msg.chat.id, "amada?",
			{reply_to_message_id: msg.message_id});
		} else if(utils.checkIfContains(msg, amado)){
			bot.sendMessage(msg.chat.id, "amado?",
			{reply_to_message_id: msg.message_id});
		}

		const awo = "awo";
		if(utils.checkIfContains(msg, awo)){
			awoCount++;
			let msg_text;
			if(awoCount == awoLimit){
				msg_text = "Chega de uivar '-'";
				awoCount = 0;
				awoLimit = Math.floor(Math.random()*7);
			} else {
				msg_text = "AWOOOO!!!!!!!";
			}
			bot.sendMessage(msg.chat.id, msg_text,
			{reply_to_message_id: msg.message_id});
		}

		const yaoi = "yaoi", gay = "gay";
		/*const musiquinha = ` gosta de assistir Ya-Ya-oi
								Ela passa o dia assistindo Ya-Ya-oi
								É nosebleed pra cá
								É nosebleed pra lá
								É nosebleed pra todo lado, Ya-Ya-oi`;*/

		if(utils.checkMultiple(msg, [yaoi, gay])){
			bot.sendMessage(msg.chat.id, "#Yaoi? (talves owo)",
			{reply_to_message_id: msg.message_id});
		}


		const perdi = "perdi";
		const chance = 0.35;
		if(utils.checkIfContains(msg, perdi)){
			const poss = Math.random();
			if(poss < chance){
				bot.sendMessage(msg.chat.id, "O JOGO",
				{reply_to_message_id: msg.message_id});
			}
		}
		
		const galvao = "galvão";
		if(utils.startsWith(msg, galvao)){
			bot.sendMessage(msg.chat.id, "Diga lá, Tino!",
			{reply_to_message_id: msg.message_id});
		}

		const sentiu = "sentiu";
		if(utils.startsWith(msg, sentiu)){
			bot.sendMessage(msg.chat.id, ">.<",
			{reply_to_message_id: msg.message_id});
		}

	});
	
};
