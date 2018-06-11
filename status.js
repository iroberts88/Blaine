
    

var Status = function(){}

//TAGS

//beneficial
//detrimental
//poison
//burn
//confuse
//sleep
//leech
//heal
//attribute

Status.prototype.init = function(data){
	this.id = data.id;
    this.pokemon = data.pokemon //the pokemon with the attached status effect
    this.tags = {}; //any tags associated with this status
    for (var i = 0; i < data.tags.length;i++){
        this.tags[data.tags[i]] = true;
    }
    
    this.preEffect = null; //effect to be checked before turn
    this.postEffect = null; //effect to be checked after turn

    this.onInit = null;
    this.onEnd = null;
}

exports.Status = Status;
