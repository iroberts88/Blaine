
var Utils = function() {};

Utils.prototype.udCheck = function(val,tVal,fVal) {
	var result = typeof val == 'undefined' ? tVal : fVal;
    return result;
}

Utils.prototype._udCheck = function(val) {
	return (typeof val == 'undefined');
}

Utils.prototype.uniqueCopy = function(obj){
	var newObj = {}
	for (var key in obj){
		newObj[key] = obj[key];
	}
	return newObj;
}

exports.Utils = Utils;
