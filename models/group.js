const mongoose = require('mongoose'),
      Person = require('./person');

let personSchema = new mongoose.Schema({
	username: String,
	name: String,
	userid: Number,
	hp: Number,
	deaths: {
		type: Number,
		default: 0
	},
	hello_phrase: String,
	last_message_date: Number, // Data da ultima mensagem enviada
	reminder_cd: Number, // Cooldown para marcar a pessoa no grupo
	reminded: { type: Boolean, default: false}
});

let groupSchema = new mongoose.Schema({
	group_id: Number,
	people: [personSchema]
});

let Group = mongoose.model("Group", groupSchema);

module.exports = Group;
