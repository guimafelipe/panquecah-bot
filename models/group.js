const mongoose = require('mongoose');

let personSchema = new mongoose.Schema({
	username: String,
	name: String,
	userid: Number,
	hp: {
		type: Number,
		default: 10
	},
	deaths: {
		type: Number,
		default: 0
	},
	killcount: {
		type: Number,
		default: 0
	},
	hello_phrase: String,
	last_message_date: Number, // Data da ultima mensagem enviada
	reminder_cd: Number, // Cooldown para marcar a pessoa no grupo
	reminded: { type: Boolean, default: false}
});

let stickerSchema = new mongoose.Schema({
	code: String,
	unique: String
});

let gifSchema = new mongoose.Schema({
	code: String,
	unique: String
});

let commandSchema = new mongoose.Schema({
	name: String,
	usages: {
		type: Number,
		default: 0
	},
	stickers: [stickerSchema],
	gifs: [gifSchema]
});

let groupSchema = new mongoose.Schema({
	group_id: Number,
	people: [personSchema],
	commands: [commandSchema]
});

let Group = mongoose.model("Group", groupSchema);

module.exports = Group;
