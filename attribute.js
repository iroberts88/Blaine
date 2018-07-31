
    

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
        8: 3/6,
        9: 4/6,
        10: 5/6,
        11: 6/6,
        12: 7/6,
        13: 8/6,
    }
	this.min = data.min; //minimum value
	this.max = data.max; //maximum value

	this.setBool = false; //the attribute is forced to change to this value if true
	this.setValue = 0;
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
    try{this.next()}catch(e){}
    try{
        if (updateClient){
            this.pokemon.character.owner.gameEngine.queuePlayer(this.pokemon.character.owner,'setUnitStat',{
                'id': this.pokemon.id,
                'stat': this.id,
                'amt': this.value
            });
        }
    }catch(e){}
}

exports.Attribute = Attribute;
