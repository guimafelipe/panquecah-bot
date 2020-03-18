const 	Group		= require('../models/group'),
		mongoose	= require('mongoose');

const standart_message = 'Oi, __name__ panquecah! Estou com saudades!';

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
			const name = msg.from.first_name;
			const userid = msg.from.id;
			const user = group.people.filter(function(person){
				return person.userid === userid;	
			});

			// If user already exists in group, just return
			if(user.length != 0){
				let person = user[0];
				person.last_message_date = Date.now();
				person.name = name;
				group.save();
				console.log("atualizando data");
				return;
			}

			group.people.push({username,
					userid,
					name,
					hp: 20,
					hello_phrase: standart_message,
					last_message_date: Date.now(),
					reminder_cd: Date.now() + 1000*60*60*24 //1 Dia
				});

			group.save();

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
