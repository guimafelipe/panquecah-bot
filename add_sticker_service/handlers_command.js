
const 	Group 		= require('../models/group'),
		utils		= require('../utils/utils'),
		emoji		= require('node-emoji');

const naotem_msg = emoji.emojify("Não consegui achar esse comando :pensive:");
const jatem_msg = emoji.emojify("Esse comando já existe.. :thinking_face:");
const success_msg = emoji.emojify("Adicionado :blush:");
const r_success_msg = emoji.emojify("Removido :blush:");
const text_msg = "Diga o texto desse comando: ";

const handlers = module.exports = {};

handlers.set_bot = function (bot) {
	this.bot = bot;
	this.init();
};

handlers.handle_remove = async function(msg){
	const command = msg.text.substr(15); // Tamanho da string "remove_comando "
	const group_id = msg.chat.id;

	try{
        console.log("\n\nAção de remover o comando: " + command);
		const group = await Group.findOne({group_id});
		let cmd = group.commands.find(el => el.name === command);

        console.log("Comandos do grupo:");
        console.log(group.commands);

		// Procura o comando no grupo. Se ele não existir, cancela a operação
		if(cmd){
            console.log("Comando encontrado!");

            let ind = group.commands.indexOf(cmd);
            group.commands.splice(ind, 1);
            await group.save();
			await this.bot.sendMessage(group_id, r_success_msg,
				{reply_to_message_id: msg.message_id});
		} else {
            console.log("Comando não encontrado!");
			await this.bot.sendMessage(group_id, naotem_msg,
				{reply_to_message_id: msg.message_id});
		}
	} catch(e){
		console.log("Erro ao remover comando!");
		console.log(e);
	}

}

handlers.handle_add = async function(msg){
	const command = msg.text.substr(12); // tamanho da string "add_comando "
	const group_id = msg.chat.id;

	try{
        console.log("\n\nAção de adicionar o comando: " + command);
		const group = await Group.findOne({group_id});
		let cmd = group.commands.find(el => el.name === command);

        console.log("Comandos do grupo:");
        console.log(group.commands);

        // Procura o comando no grupo. Se já existir, cancela a operação.
		if(cmd){
            console.log("Comando encontrado! Cancelar operação.");
            await this.bot.sendMessage(group_id, jatem_msg,
                {reply_to_message_id: msg.message_id});
		} else {
            console.log("Comando não encontrado! Continuar operação.");

            this.author_id = msg.from.id;

            console.log("O autor desse comando tem id: " +
                this.author_id + " (nome: " + msg.from.first_name + ").");

            await this.bot.sendMessage(group_id, text_msg,
                {reply_to_message_id: msg.message_id});
            this.next_commmand = command;
		}
	} catch(e){
		console.log("Erro ao adicionar comando");
		console.log(e);
	}
}

handlers.finish_add = async function(msg){
    const command = this.next_commmand;
    const group_id = msg.chat.id;
    const phrase = msg.text;

    try {
        const group = await Group.findOne({group_id});

        let cmd = {name: command, phrase};
        group.commands.push(cmd);

        await group.save();

        await this.bot.sendMessage(group_id, success_msg,
            {reply_to_message_id: msg.message_id});
    } catch(e){
        console.log("Erro ao adicionar a descrição");
        console.log(e);
    }

    this.author_id = -1;
    this.next_commmand = null;
}

handlers.handle_msg = function(msg){
	if(!msg.hasOwnProperty('text')){
		return;
    }

    if(this.author_id != -1){
        if(msg.from.id == this.author_id){
            this.finish_add(msg);
        }
        return;
    }
    
	if(utils.startsWith(msg, 'add_comando ')){
		this.handle_add(msg);
	} else if(utils.startsWith(msg, 'remove_comando ')){
		this.handle_remove(msg);
	}
}


handlers.init = function(){
	const bot = this.bot;

	if(!bot){
		console.log("Error, no bot initialized");
		return;
	}

    this.author_id = -1;
    this.next_commmand = null;

	bot.on('message', async (msg) => {
		this.handle_msg(msg);
	})
}
