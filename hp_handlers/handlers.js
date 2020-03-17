const 	Group		= require('../models/group'),
		mongoose	= require('mongoose');

const standart_message = 'Oi, __name__ panquecah!';

const handlers = module.exports = {};

handlers.set_bot = function (bot) {
	this.bot = bot;
	this.init();
};

function checkIfContains(msg, pat) {
	return msg.text.toString().toLowerCase().includes(pat);
};

function checkMultiple(msg, arr_pat){
	for(let pat in arr_pat){
		if(checkIfContains(msg, arr_pat[pat])){
			return true;
		}
	}
	return false;
}

async function checkIfIncluded(msg){
	const group_id = msg.chat.id;
	Group.findOne({group_id}, async function(err, group) {
		if(err){
			console.log(err);
			return;
		}
		
		try{
			if(!group){
				group = await Group.create({group_id});
			}
			
			console.log(group);
			
			const username = msg.from.username;
			const user = group.people.filter(function(person){
				return person.username === username;	
			});

			// If user already exists in group, just return
			if(user.length != 0){
				return;
			}

			group.people.push({username,
					hp: 20,
					hello_phrase: standart_message});

			await group.save();

		} catch(e) {
			console.log(e);
		}
	});
}

handlers.init = function(){

	const bot = this.bot;

	if(!bot){
		console.log("Error, no bot initialized");
		return;
	}


	bot.on('message', (msg) => {

		checkIfIncluded(msg);

		if(!msg.hasOwnProperty('text')){
			return;
		}

	});
}
