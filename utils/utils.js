const utils = module.exports = {};

utils.checkIfContains = function (msg, pat) {
	return msg.text.toString().toLowerCase().includes(pat);
}

utils.checkEquality = function (msg, pat) {
	return msg.text.toLowerCase() === pat;
}

utils.checkMultiple = function(msg, arr_pat){
	for(let pat in arr_pat){
		if(this.checkIfContains(msg, arr_pat[pat])){
			return true;
		}
	}
	return false;
}

utils.startsWith = function(msg, pat) {
	let j = pat.length;
	return msg.text.substring(0, j) === pat;
}

