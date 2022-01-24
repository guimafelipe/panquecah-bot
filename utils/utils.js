const utils = module.exports = {};

utils.checkIfContains = function (msg, pat) {
	return msg.text.toString().toLowerCase().includes(pat);
}

utils.checkEquality = function (msg, pat) {
	console.log("Comparacao do utils");
	console.log(msg.text.toLowerCase());
	console.log(pat);
	return msg.text.toLowerCase() === pat;
}

utils.checkMultipleEquality = function (msg, arr_pat){
	for(let pat in arr_pat){
		if(this.checkEquality(msg, arr_pat[pat])) {
			return true;
		}
	}
	return false;
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
	return msg.text.substring(0, j).toLowerCase() === pat;
}

utils.getCompFunc = function(attribute) {
	return function(a , b){
		return b[attribute] - a[attribute];
	}
}

