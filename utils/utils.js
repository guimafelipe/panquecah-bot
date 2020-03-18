const utils = module.exports = {};

utils.checkIfContains = function (msg, pat) {
	return msg.text.toString().toLowerCase().includes(pat);
}

utils.checkMultiple = function(msg, arr_pat){
	for(let pat in arr_pat){
		if(this.checkIfContains(msg, arr_pat[pat])){
			return true;
		}
	}
	return false;
}

