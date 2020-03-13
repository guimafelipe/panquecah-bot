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
		for(let key in msg){
			if(msg.hasOwnProperty(key)){
				console.log("--- " + key + ": " );
				console.log(msg[key]);
			}
		}
		if(checkIfContains(msg, boanoite)){
			bot.sendMessage(msg.chat.id,
			"Boa noite, " + msg.from.first_name + " panquecah!!",
			{reply_to_message_id: msg.message_id});
		}
		
		const amado = "amado?", amada = "amada?";
		if(checkIfContains(msg, amada)){
			bot.sendMessage(msg.chat.id, "Mamada?",
			{reply_to_message_id: msg.message_id});
		} else if(checkIfContains(msg, amado)){
			bot.sendMessage(msg.chat.id, "Mamado?",
			{reply_to_message_id: msg.message_id});
		}

		const awo = "awo";
		if(checkIfContains(msg, awo)){
			awoCount++;
			let msg_text;
			if(awoCount == awoLimit){
				msg_text = "Chega de uivar '-'";
				awoCount = 0;
			} else {
				msg_text = "AWOOOO!!!!!!!";
			}
			bot.sendMessage(msg.chat.id, msg_text,
			{reply_to_message_id: msg.message_id});
		}

		const yaoi = "yaoi", gay = "gay";
		/*const musiquinha = ` gosta de assistir Ya-Ya-oi
								Ela passa o dia assistindo Ya-Ya-oi
								É nosebleed pra cá
								É nosebleed pra lá
								É nosebleed pra todo lado, Ya-Ya-oi`;*/

		if(checkMultiple(msg, [yaoi, gay])){
			bot.sendMessage(msg.chat.id, "#Yaoi? (talves owo)",
			{reply_to_message_id: msg.message_id});
		}
	});
	
};
