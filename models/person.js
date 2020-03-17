const mongoose = require('mongoose');

let personSchema = new mongoose.Schema({
	username: String,
	hp: Number,
	hello_phrase: String
});

let Person = mongoose.model("Person", personSchema);

module.exports =  Person;
