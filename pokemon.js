var Attribute = require('./attribute.js').Attribute;

var Pokemon = function(){
    this.id = null;
    this.owner = null;
    this.nickname = null;
    this.attributeIndex = {};

    this.hp = null;
    this.attack = null;
    this.spattack = null;
    this.defense = null;
    this.spdefense = null;
    this.speed = null;

    this.hpIV = null;
    this.attackIV = null;
    this.spattackIV = null;
    this.defenseIV = null;
    this.spdefenseIV = null;
    this.speedIV = null;

    this.hpEV = null;
    this.attackEV = null;
    this.spattackEV = null;
    this.defenseEV = null;
    this.spdefenseEV = null;
    this.speedEV = null;

    this.totalEVs = null;

    this.affection = null;

    this.critChance = null;

}

Pokemon.prototype.reset = function(){
    //things that reset with each new battle

}

Pokemon.prototype.init = function(data) {
    //Set up all stats and attributes
    this.nickname = data.nickname;
    this.owner = data.owner;
    this.id = data.id;
    this.number = data.number;
    this.name = data.name;
    this.moves = data.moves; //attack list
    this.type = data.type; //list of types

    this.affection = (typeof data.affection == 'undefined') ? 0 : data.affection;
    this.critChance = (typeof data.critChance == 'undefined') ? 0 : data.critChance;
    this.level = (typeof data.level == 'undefined') ? 1 : data.level;
    this.exp = (typeof data.exp == 'undefined') ? 0 : data.exp;

    this.totalEVs = (typeof data.totalEVs == 'undefined') ? 0 : data.totalEVs;
    this.hpIV = (typeof data.hpIV == 'undefined') ? 0 : data.hpIV;
    this.attackIV = (typeof data.attackIV == 'undefined') ? 0 : data.attackIV;
    this.spattackIV = (typeof data.spattackIV == 'undefined') ? 0 : data.spattackIV;
    this.defenseIV = (typeof data.defenseIV == 'undefined') ? 0 : data.defenseIV;
    this.spdefenseIV = (typeof data.spdefenseIV == 'undefined') ? 0 : data.spdefenseIV;
    this.speedIV = (typeof data.speedIV == 'undefined') ? 0 : data.speedIV;


    this.hpEV = (typeof data.hpEV == 'undefined') ? 0 : data.hpEV;
    this.attackEV = (typeof data.attackEV == 'undefined') ? 0 : data.attackEV;
    this.spattackEV = (typeof data.spattackEV == 'undefined') ? 0 : data.spattackEV;
    this.defenseEV = (typeof data.defenseEV == 'undefined') ? 0 : data.defenseEV;
    this.spdefenseEV = (typeof data.spdefenseEV == 'undefined') ? 0 : data.spdefenseEV;
    this.speedEV = (typeof data.speedEV == 'undefined') ? 0 : data.speedEV;


    this.hp = new Attribute();
    this.hp.init({
        'id': 'hp',
        'owner': this,
        'value': 100, // Get pokemon base value here!
        'min': 0,
        'max': 9999,
        formula: function(){
            var val = (((((this.base + this.hpIV) * 2) + Math.sqrt(this.hpEV)/4)*this.level)/100) + this.level + 10;
            return Math.ceil((val*this.pMod)+this.nMod);
        }
    });

    this.speed = new Attribute();
    this.speed.init({
        'id': 'spd',
        'owner': this,
        'value': 100, // Get pokemon base value here!
        'min': 0,
        'max': 9999,
        formula: function(){
            var val = (((((this.base + this.speedIV) * 2) + Math.sqrt(this.speedEV)/4)*this.level)/100) + 5;
            return Math.ceil((val*this.pMod)+this.nMod);
        }
    });

    this.attack = new Attribute();
    this.attack.init({
        'id': 'atk',
        'owner': this,
        'value': 100, // Get pokemon base value here!
        'min': 0,
        'max': 9999,
        formula: function(){
            var val = (((((this.base + this.attackIV) * 2) + Math.sqrt(this.attackEV)/4)*this.level)/100) + 5;
            return Math.ceil((val*this.pMod)+this.nMod);
        }
    });

    this.spattack = new Attribute();
    this.spattack.init({
        'id': 'spatk',
        'owner': this,
        'value': 100, // Get pokemon base value here!
        'min': 0,
        'max': 9999,
        formula: function(){
            var val = (((((this.base + this.spattackIV) * 2) + Math.sqrt(this.spattackEV)/4)*this.level)/100) + 5;
            return Math.ceil((val*this.pMod)+this.nMod);
        }
    });

    this.defense = new Attribute();
    this.defense.init({
        'id': 'def',
        'owner': this,
        'value': 100, // Get pokemon base value here!
        'min': 0,
        'max': 9999,
        formula: function(){
            var val = (((((this.base + this.defenseIV) * 2) + Math.sqrt(this.defenseEV)/4)*this.level)/100) + 5;
            return Math.ceil((val*this.pMod)+this.nMod);
        }
    });

    this.spdefense = new Attribute();
    this.spdefense.init({
        'id': 'spdef',
        'owner': this,
        'value': 100, // Get pokemon base value here!
        'min': 0,
        'max': 9999,
        formula: function(){
            var val = (((((this.base + this.spdefenseIV) * 2) + Math.sqrt(this.spdefenseEV)/4)*this.level)/100) + 5;
            return Math.ceil((val*this.pMod)+this.nMod);
        }
    });

   var data = {}
    for (var a in this){
        if (this[a] instanceof Attribute){
            //fill in the attribute index
            this.attributeIndex[this[a].id] = this[a];
        }
    }
    return data;

    this.reset();
};


Pokemon.prototype.getDBObj = function(){
    var dbObj = {};
    dbObj.nickname = this.nickname;
    return dbObj;
}

Pokemon.prototype.getClientData = function(){
    //create object to send to the client
    var data = {}
    for (var a in this){
        if (this[a] instanceof Attribute){
            data[a] = this[a].value;
        }else{
            if (a != 'owner'){
                data[a] = this[a];
            }
        }
    }
    return data;
}

Pokemon.prototype.getLessClientData = function(){
    var data = {}

    return data;

}


Pokemon.prototype.setStat = function(id,amt){
    try{
        this.getStat(id).base = amt;
        this.getStat(id).set(true);
    }catch(e){
        console.log("unable to set stat " + id);
        console.log(e);
    }
};


Pokemon.prototype.getStat = function(id){
    try{
        return this.attributeIndex[id];
    }catch(e){
        console.log("unable to get stat " + id);
        console.log(e);
    }
};

Pokemon.prototype.modStat = function(id,amt){
    try{
        this.getStat(id).nMod += amt;
        this.getStat(id).set(true);
    }catch(e){
        console.log("unable to mod stat " + id);
        console.log(e);
    }
};

Pokemon.prototype.addExp = function(amt){

}


exports.Pokemon = Pokemon;