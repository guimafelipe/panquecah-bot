const 	Group		= require('../models/group'),
		mongoose	= require('mongoose');

const reminder = module.exports = {};

const DAY = 1000*60*60*24;
const SEC = 1000;

reminder.set_bot = function (bot) {
	this.bot = bot;
	this.init();
};

reminder.send_reminder = async function(group_id, person){
	console.log("send reminder called");
	const bot = this.bot;

	const reminder_message = person.hello_phrase.replace(/__name__/i,
		'['+person.name+'](tg://user?id='+person.userid+')');

	console.log(reminder_message);

	bot.sendMessage(group_id, 
					reminder_message, 
					{parse_mode: 'Markdown'});
}

reminder.remind_people = async function() {
	const groups = await Group.find({}).exec();

	console.log("Chamando remind people");
	console.log(groups);

	groups.forEach(async function(group) {
		const people = group.people;
		console.log("iterando grupo");
		console.log(people);

		people.forEach(async function(person) {
			const {last_message_date,
					hello_phrase, reminder_cd} = person;

			console.log("LMD: " + last_message_date);
			console.log("DN:  " + Date.now());

			if(last_message_date + DAY < Date.now()){
				await reminder.send_reminder(group.group_id, person);

				person.last_message_date = Date.now();
			} 

		});

		group.save();
	});
}

reminder.init = function(){

	const bot = this.bot;

	if(!bot){
		console.log("Error, no bot initialized");
		return;
	}

	setInterval(function(){
		// reminder.remind_people()	
	}, 1000*60*60);

}
