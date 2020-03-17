const mongoose = require('mongoose'),
      Person = require('./person');

let personSchema = new mongoose.Schema({
	username: String,
	hp: Number,
	hello_phrase: String
});

let groupSchema = new mongoose.Schema({
	group_id: String,
	people: [personSchema]
});

let Group = mongoose.model("Group", groupSchema);

module.exports = Group;
