
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

Utils.prototype.uniqueCopy = function(obj){
    //make a unique copy of an object
    //note - might error out if the object is not an array but has the "length" property
    var newObj = null;
    if (typeof obj != 'object'){
        return obj;
    }
    if (typeof obj.length != 'undefined'){
        //object is an array
        newObj = [];
        for (var i = 0; i < obj.length;i++){
            if (typeof obj[i] == 'object'){
                newObj[i] = this.uniqueCopy(obj[i]);
            }else{
                newObj[i] = obj[i];
            }
        }
    }else{
        newObj = {};
    	for (var key in obj){
            if (typeof obj[key] == 'object'){
                newObj[key] = this.uniqueCopy(obj[key]);
            }else{
    		    newObj[key] = obj[key];
            }
    	}
    }
	return newObj;
}

Utils.prototype.createClientData = function(){
    //Iterates through arguments given and returns a client data object
    //arg1 = object key
    //arg2 = data from arg1
    //e.g. createClientData(arg1,arg2,arg1,arg2...)
    var data = {};
    for (var i = 0; i < arguments.length;i+=2){
        data[arguments[i]] = arguments[i+1];
    }
    return data;
}

exports.Utils = Utils;
