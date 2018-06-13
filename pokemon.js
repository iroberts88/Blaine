var Attribute = require('./attribute.js').Attribute;

var Pokemon = function(){
    this.MAX_ATTACKS = 4;
    this.MAX_EV_VALUE = 30000;
    this.MAX_IV_VALUE = 32;

    this.id = null;
    this.character = null;
    this.nickname = null;
    this.attributeIndex = {};
    this.slot = null;

    this.moves = null;

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

    this.affection = null;

    this.critChance = null;

    //this.nature = null;

    //this.ability = null;

    //this.sex = null;

    this.currentHP = null;

    this.currentPP = {
        '0': 0,
        '1': 0,
        '2': 0,
        '3': 0
    }

    this.status = [];
}

Pokemon.prototype.reset = function(){
}

Pokemon.prototype.getMoves = function(options){
    this.moves = [];
    for (var i = this.level;i > 0;i--){
        if (typeof this.gameEngine.pokemon[this.number].moveList[i] != 'undefined'){
            //this level has available moves....
            //add them
            for (var j = 0; j < this.gameEngine.pokemon[this.number].moveList[i].length;j++){
                if (this.moves.length < this.MAX_ATTACKS){
                    var attackid = this.gameEngine.pokemon[this.number].moveList[i][j].attackid;
                    if (typeof this.gameEngine.attacks[attackid] == 'undefined'){
                        //MOVE DOESNT EXIST
                        console.log('Move with id "'+ attackid + '" doesn\'t exist');
                        console.log('Defaulting to Tackle');
                        attackid = 'tackle';
                    }
                    var hasMove = false;
                    for (var k = 0; k < this.moves.length;k++){
                        if (this.moves[k].attackid == attackid){
                            hasMove = true;
                            break;
                        }
                    }
                    if (hasMove){
                        continue;
                    }
                    this.moves.push(this.gameEngine.attacks[attackid]);
                    this.currentPP[this.moves.length-1] = this.gameEngine.attacks[attackid].pp
                }else{
                    return;
                }
            }
        }
    }
}

Pokemon.prototype.init = function(base,data) {
    //Set up all stats and attributes

    this.nickname = (data.nickname == '') ? base.name : data.nickname; //REQUIRED IN <data>
    this.character = data.character; //REQUIRED IN <data>
    this.gameEngine = data.character.gameEngine
    this.id = data.id; //REQUIRED IN <data>

    this.number = base.number;
    this.name = base.name;
    this.types = base.types; //list of types

    this.captureRate = (typeof base.captureRate == 'undefined') ? 1 : base.captureRate;

    this.affection = (typeof data.affection == 'undefined') ? 0 : data.affection;
    this.critChance = (typeof data.critChance == 'undefined') ? 0 : data.critChance;
    this.level = (typeof data.level == 'undefined') ? 5 : data.level;
    this.exp = (typeof data.exp == 'undefined') ? 0 : data.exp;

    if (typeof data.moves == 'undefined'){
        this.getMoves();
    }else{
        for (var j = 0; j < data.moves.length;j++){
            this.moves.push(this.gameEngine.attacks[data.moves[j]]);
        }
    }

    this.hpIV = (typeof data.hpIV == 'undefined') ? Math.ceil(Math.random()*this.MAX_IV_VALUE) : data.hpIV;
    this.attackIV = (typeof data.attackIV == 'undefined') ? Math.ceil(Math.random()*this.MAX_IV_VALUE) : data.attackIV;
    this.spattackIV = (typeof data.spattackIV == 'undefined') ? Math.ceil(Math.random()*this.MAX_IV_VALUE) : data.spattackIV;
    this.defenseIV = (typeof data.defenseIV == 'undefined') ? Math.ceil(Math.random()*this.MAX_IV_VALUE) : data.defenseIV;
    this.spdefenseIV = (typeof data.spdefenseIV == 'undefined') ? Math.ceil(Math.random()*this.MAX_IV_VALUE) : data.spdefenseIV;
    this.speedIV = (typeof data.speedIV == 'undefined') ? Math.ceil(Math.random()*this.MAX_IV_VALUE) : data.speedIV;


    this.hpEV = (typeof data.hpEV == 'undefined') ? 0 : data.hpEV;
    this.attackEV = (typeof data.attackEV == 'undefined') ? 0 : data.attackEV;
    this.spattackEV = (typeof data.spattackEV == 'undefined') ? 0 : data.spattackEV;
    this.defenseEV = (typeof data.defenseEV == 'undefined') ? 0 : data.defenseEV;
    this.spdefenseEV = (typeof data.spdefenseEV == 'undefined') ? 0 : data.spdefenseEV;
    this.speedEV = (typeof data.speedEV == 'undefined') ? 0 : data.speedEV;


    this.hp = new Attribute();
    this.hp.init({
        'id': 'hp',
        'pokemon': this,
        'value': base.baseStats.hp,
        'min': 0,
        'max': 9999,
        formula: function(){
            var val = (((this.base * 2 + this.pokemon.hpIV + Math.sqrt(this.pokemon.hpEV)/4))*this.pokemon.level)/100 + this.pokemon.level + 10;
            return Math.ceil((val*this.pMod)+this.nMod);
        }
    });

    this.speed = new Attribute();
    this.speed.init({
        'id': 'spd',
        'pokemon': this,
        'value': base.baseStats.speed, 
        'min': 0,
        'max': 9999,
        formula: function(){
            var val = (((this.base * 2 + this.pokemon.speedIV + Math.sqrt(this.pokemon.speedEV)/4))*this.pokemon.level)/100 + 5;
            return Math.ceil((val*this.pMod)+this.nMod);
        }
    });

    this.attack = new Attribute();
    this.attack.init({
        'id': 'atk',
        'pokemon': this,
        'value': base.baseStats.attack,
        'min': 0,
        'max': 9999,
        formula: function(){
            var val = (((this.base * 2 + this.pokemon.attackIV + Math.sqrt(this.pokemon.attackEV)/4))*this.pokemon.level)/100 + 5;
            return Math.ceil((val*this.pMod)+this.nMod);
        }
    });

    this.spattack = new Attribute();
    this.spattack.init({
        'id': 'spatk',
        'pokemon': this,
        'value': base.baseStats.spattack,
        'min': 0,
        'max': 9999,
        formula: function(){
            var val = (((this.base * 2 + this.pokemon.spattackIV + Math.sqrt(this.pokemon.spattackEV)/4))*this.pokemon.level)/100 + 5;
            return Math.ceil((val*this.pMod)+this.nMod);
        }
    });

    this.defense = new Attribute();
    this.defense.init({
        'id': 'def',
        'pokemon': this,
        'value': base.baseStats.defense,
        'min': 0,
        'max': 9999,
        formula: function(){
            var val = (((this.base * 2 + this.pokemon.defenseIV + Math.sqrt(this.pokemon.defenseEV)/4))*this.pokemon.level)/100 + 5;
            return Math.ceil((val*this.pMod)+this.nMod);
        }
    });

    this.spdefense = new Attribute();
    this.spdefense.init({
        'id': 'spdef',
        'pokemon': this,
        'value': base.baseStats.spdefense,
        'min': 0,
        'max': 9999,
        formula: function(){
            var val = (((this.base * 2 + this.pokemon.spdefenseIV + Math.sqrt(this.pokemon.spdefenseEV)/4))*this.pokemon.level)/100 + 5;
            return Math.ceil((val*this.pMod)+this.nMod);
        }
    });

    var data = {}
    for (var a in this){
        if (this[a] instanceof Attribute){
            //fill in the attribute index
            this.attributeIndex[this[a].id] = this[a];
            this[a].set();
        }
    }

    this.currentHP = this.hp.value;
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
        }
    }
    data.name = this.name;
    data.nickname = this.nickname;
    data.number = this.number;
    data.level = this.level;
    data.types = this.types;
    data.moves = [];
    for (var i = 0; i < this.moves.length;i++){
        data.moves.push(this.moves[i].getClientData());
    }
    data.id = this.id;
    data.exp = this.exp;
    data.currentHP = this.currentHP;
    data.currentPP = this.currentPP;
    data.slot = this.slot;
    data.hpIV = this.hpIV;
    data.speedIV = this.speedIV;
    data.attackIV = this.attackIV;
    data.defenseIV = this.defenseIV;
    data.spattackIV = this.spattackIV;
    data.spdefenseIV = this.spdefenseIV;
    return data;
}

Pokemon.prototype.getLessClientData = function(){
    var data = {}
    data.nickname = this.nickname;
    data.number = this.number;
    data.level = this.level;
    data.id = this.id;
    data.hpPercent = this.currentHP/this.hp.value;
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