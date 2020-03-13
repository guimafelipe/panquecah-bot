const handlers = module.exports = {};

handlers.set_bot = function (bot) {
	this.bot = bot;
	this.init();
};

function checkIfContains(msg, pat) {
	return msg.text.toString().toLowerCase().includes(pat));
};

handlers.init = function(){

	const bot = this.bot;
	let awoCount = 0;
	const awoLimit = 3;

	if(!bot){
		console.log("Error, no bot initialized");
		return;
	}

	bot.on('message', (msg) => {
		const boanoite = "boa noite";
		if(msg.text.toString().toLowerCase().includes(boanoite)){
			bot.sendMessage(msg.chat.id, "Boa noite, " + msg.from.first_name + " panquecah!!");
		}
		
		const amado = "amado?", amada = "amada?";
		if(msg.text.toString().toLowerCase().includes(amada)){
			bot.sendMessage(msg.chat.id, "Mamada?");
		}
		if(msg.text.toString().toLowerCase().includes(amado)){
			bot.sendMessage(msg.chat.id, "Mamado?");
		}

		const awo = "awo";
		if(msg.text.toString().toLowerCase().includes(awo)){
			awoCount++;
			if(awoCount == awoLimit){
				bot.sendMessage(msg.chat.id, "Chega de uivar '-'");
				awoCount = 0;
			} else {
				bot.sendMessage(msg.chat.id, "AWOOOO!!!!!!!");
			}
		}
	});
	
};
