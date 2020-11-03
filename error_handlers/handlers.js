const handlers = module.exports = {};

handlers.set_bot = function (bot) {
	this.bot = bot;
	this.init();
};

handlers.init = function(){
	const bot = this.bot;

	if(!bot){
		console.log("Error, no bot initialized");
		return;
	}

	bot.on('error', (e) => {
		for(let property in e){
			console.log(e[property]);
		}	
	});
};
