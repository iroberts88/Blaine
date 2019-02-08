var CENUMS = require('./enums.js').Enums; //init client enums

var utils = require('./utils.js').Utils;
var Utils = new utils();

CENUMS.init();
    

var Attribute = function(){
    this.pokemon = null;
    this.id = null;
    this.name = null;
    this.value = null; 
    this.base = null; 
    this.nMod = null; 
    this.pMod = null;
    this.min = null; 
    this.max = null;

    this.formula = null;
    this.next = null;
}
        
Attribute.prototype.init = function(data){
	this.pokemon = data.pokemon; //the unit that owns this stat
	this.id = data.id;
    this.name = data.name;
	this.value = data.value; //this stat's actual value
	this.base = data.value; //this stat's base value before buff/item mods etc.
	this.nMod = 0; //a numeric modifier added to the base value before usage
	this.pMod = 1.0; //a percentile modifier added to the base value before usage
    this.stage = 7;
    this.statStageMods = {
        1: 2/8,
        2: 2/7,
        3: 2/6,
        4: 2/5,
        5: 2/4,
        6: 2/3,
        7: 2/2,
        8: 3/2,
        9: 4/2,
        10: 5/2,
        11: 6/2,
        12: 7/2,
        13: 8/2,
    }
	this.min = data.min; //minimum value
	this.max = data.max; //maximum value

	this.setBool = false; //the attribute is forced to change to this value if true
	this.setValue = 0;
    //this is a stat that can be updated on the client (hidden or not?)
    this.updateClient = Utils.udCheck(data.clientUpdate,true,data.clientUpdate);
    //this is a stat that is updated to all players
    this.updateAll = Utils.udCheck(data.updateAll,false,data.updateAll);
	//formula for setting the attribute
	if (typeof data.formula == 'undefined'){
		this.formula = function(){return Math.round(this.base*this.pMod+this.nMod);};
    }else{
    	this.formula = data.formula;
    }
    //function to be executed after the attribute is set
    if (typeof data.next == 'undefined'){
    	this.next = function(){};
    }else{
    	this.next = data.next;
    }
}
Attribute.prototype.modStage = function(n){
    this.stage += n;
    if (this.stage < 1){this.stage = 1}
    if (this.stage >13){this.stage = 13}
    this.set();
}
Attribute.prototype.reset = function(updateClient){
    this.nMod = 0;
    this.pMod = 1;
    this.stage = 7;
    this.set(updateClient);
}
Attribute.prototype.battleUpdate = function(battle){
    var cData = {};
    cData[CENUMS.VALUE] = this.value;
    cData[CENUMS.POKEMON] = this.pokemon.id;
    console.log(cData);
    battle.queueData(this.id,cData);
}
Attribute.prototype.set = function(updateClient){
	if (this.setBool){
		//force value change
		this.value = this.setValue;
	}else{
		//normal set value
		this.value = this.formula();
        this.value = Math.ceil(this.value*this.statStageMods[this.stage]);
		//check bounds
		if (typeof this.min != 'undefined'){
    		if (this.value < this.min){
    			this.value = this.min;
    		}
    	}
    	if (typeof this.max != 'undefined'){
    		if (this.value > this.max){
    			this.value = this.max;
    		}
    	}
	}
    try{this.next(updateClient);}catch(e){console.log(e);}
    try{
        if (updateClient){
            var cData = {};
            cData[CENUMS.ID] = this.pokemon.id;
            cData[CENUMS.STAT] = this.id;
            cData[CENUMS.VALUE] = this.value;
            this.pokemon.character.owner.engine.queuePlayer(this.pokemon.character.owner,CENUMS.SETUNITSTAT,cData);
        }
    }catch(e){}
}

exports.Attribute = Attribute;
