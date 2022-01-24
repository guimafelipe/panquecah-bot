const	Group		= require('../models/group'),
		hp_phrases	= require('./hp_words.json'),
		utils		= require('../utils/utils');


const info_handler = module.exports = {};

info_handler.set_bot = function (bot) {
    this.bot = bot;
    this.init();
}


// This method returns a list with the ranking of the top 10
// killers in the group
info_handler.get_top_kill = async function(msg){
	const bot = this.bot;
	const group_id = msg.chat.id;
	try {
		const group = await Group.findOne({group_id}, 'people');
		let people = group.people;

		// Sorting and getting the top 10
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

// This method returns a list with the ranking of the top 10
// people with most deaths in the group
info_handler.get_top_death = async function(msg){
	const bot = this.bot;
	const group_id = msg.chat.id;
	try {
		const group = await Group.findOne({group_id}, 'people');
		let people = group.people;

		// Sorting and getting the top 10
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

// This method gets the 10 most used commands in the group
info_handler.get_top_commands = async function(msg){
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

info_handler.get_with_stickers = async function(msg){
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

// Gets all the available commands
info_handler.get_all_commands = function(msg){
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

info_handler.init = function(){

	const bot = this.bot;

	if(!bot){
		console.log("Error, no bot initialized");
		return;
	}


	bot.on('message', async (msg) => {
		if(!msg.hasOwnProperty('text')){
			return;
        }

        // listar os comandos do bot
        if (utils.checkEquality(msg, "!comandos")) {
            this.get_all_commands(msg);
            return;
        }

        // listar os comandos com stickers
        if (utils.checkMultipleEquality(msg, ["!sticker", "!stickers"])) {
            this.get_with_stickers(msg);
            return;
        }

        // listar os top mortos
        if (utils.checkMultipleEquality(msg, ["!topmortos", "!topmortes"])) {
            this.get_top_death(msg);
            return;
        }

        // listar os top assassinos
        const possibilities = ["!topkillers", "!topkill", "!topkills"];
        if (utils.checkMultipleEquality(msg, possibilities)) {
            this.get_top_kill(msg);
            return;
        }

        // listar os top comandos
        if (utils.checkMultipleEquality(msg, ["!topcomandos"])) {
            this.get_top_commands(msg);
            return;
        }

	});
}
