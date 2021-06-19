const 	Group 		= require('../models/group'),
		utils		= require('../utils/utils'),
		emoji		= require('node-emoji');
		mongoose	= require('mongoose');

const fail_msg = emoji.emojify("Não consegui achar esse comando :pensive:");
const jatem_msg = emoji.emojify("Esse sticker já foi adicionado.. :thinking_face:");
const naotem_msg = emoji.emojify("Esse sticker não estava adicionado.. :thinking_face:");
const success_msg = emoji.emojify("Adicionado :blush:");
const r_success_msg = emoji.emojify("Removido :blush:");

const handlers = module.exports = {};

handlers.set_bot = function (bot) {
	this.bot = bot;
	this.init();
};

handlers.handle_remove = async function(msg){
	// Tamanho da string "remove "
	const command = msg.text.substr(7).toLowerCase();
	const group_id = msg.chat.id;

	const sticker_code = msg.reply_to_message.sticker.file_id;
	const unique = msg.reply_to_message.sticker.file_unique_id;

	try{
		const group = await Group.findOne({group_id});
		let cmd = group.commands.find(el => el.name === command);

		// Procura o comando no grupo. Ele precisa ter sido usado
		// antes para esse aqui funcionar
		if(cmd){
			// Procura o sticker pelo file_unique_id
			let stck = cmd.stickers.find(el => el.unique===unique);
			if(stck){
				let index = cmd.stickers.indexOf(stck);
				cmd.stickers.splice(index, 1);
				await group.save();
				await this.bot.sendMessage(group_id, r_success_msg,
					{reply_to_message_id: msg.message_id});
			} else {
				await this.bot.sendMessage(group_id, naotem_msg,
					{reply_to_message_id: msg.message_id});
			}
		} else {
			await this.bot.sendMessage(group_id, fail_msg,
				{reply_to_message_id: msg.message_id});
		}
	} catch(e){
		console.log("Erro ao remover sticker");
		console.log(e);
	}

}

handlers.handle_add = async function(msg){
	// 4 = tamanho da string "add "
	const command = msg.text.substr(4).toLowerCase();
	const group_id = msg.chat.id;

	const sticker_code = msg.reply_to_message.sticker.file_id;
	const unique = msg.reply_to_message.sticker.file_unique_id;

	try{
		const group = await Group.findOne({group_id});

		let cmd = group.commands.find(el => el.name === command);

		if(cmd){
			if(cmd.stickers.find(el => el.unique === unique)){
				await this.bot.sendMessage(group_id, jatem_msg,
					{reply_to_message_id: msg.message_id});
			} else {
				cmd.stickers.push({code:sticker_code,unique:unique});
				await group.save();
				await this.bot.sendMessage(group_id, success_msg,
					{reply_to_message_id: msg.message_id});
			}
		} else {
			await this.bot.sendMessage(group_id, fail_msg,
				{reply_to_message_id: msg.message_id});
		}
	} catch(e){
		console.log("Erro ao adicionar sticker");
		console.log(e);
	}
}

handlers.handle_msg = function(msg){
	if(!msg.hasOwnProperty('text')){
		return;
	}

	if(!msg.hasOwnProperty('reply_to_message')){
		return;
	}

	if(!msg.reply_to_message.sticker){
		return;
	}

	if(utils.startsWith(msg, 'add ')){
		this.handle_add(msg);
	} else if(utils.startsWith(msg, 'remove ')){
		this.handle_remove(msg);
	}
}

handlers.init = function(){
	const bot = this.bot;

	if(!bot){
		console.log("Error, no bot initialized");
		return;
	}

	bot.on('message', async (msg) => {
		this.handle_msg(msg);
	})
}

