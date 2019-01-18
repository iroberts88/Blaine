var Attribute = require('./attribute.js').Attribute;
var CENUMS = require('./enums.js').Enums; //init client enums
CENUMS.init();

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
        if (typeof this.engine.pokemon[this.number].moveList[i] != 'undefined'){
            //this level has available moves....
            //add them
            for (var j = 0; j < this.engine.pokemon[this.number].moveList[i].length;j++){
                if (this.moves.length < this.MAX_ATTACKS){
                    var attackid = this.engine.pokemon[this.number].moveList[i][j].attackid;
                    if (typeof this.engine.attacks[attackid] == 'undefined'){
                        //MOVE DOESNT EXIST
                        this.character.engine.log('Move with id "'+ attackid + '" doesn\'t exist');
                        this.character.engine.log('Defaulting to Tackle');
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
                    this.moves.push(this.engine.attacks[attackid]);
                    this.currentPP[this.moves.length-1] = this.engine.attacks[attackid].pp
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
    this.engine = data.character.engine
    this.id = data.id; //REQUIRED IN <data>

    this.number = base.number;
    this.name = base.name;
    this.types = base.types; //list of types

    this.captureRate = (typeof base.captureRate == 'undefined') ? 1 : base.captureRate;

    this.affection = (typeof data.affection == 'undefined') ? 0 : data.affection;
    this.critChance = (typeof data.critChance == 'undefined') ? 0 : data.critChance;
    this.critMod = 2;
    this.level = (typeof data.level == 'undefined') ? 5 : data.level;
    this.exp = (typeof data.exp == 'undefined') ? 0 : data.exp;

    if (typeof data.moves == 'undefined'){
        this.getMoves();
    }else{
        for (var j = 0; j < data.moves.length;j++){
            this.moves.push(this.engine.attacks[data.moves[j]]);
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

    this.damageMod = 1;
    this.defenseMod = 1;
    this.stabBonus = 1.5;

    this.hp = new Attribute();
    this.hp.init({
        id: CENUMS.HP,
        pokemon: this,
        value: base.baseStats.hp,
        min: 1,
        name: 'Maximum HP',
        max: 9999,
        formula: function(){
            var val = (((this.base * 2 + this.pokemon.hpIV + Math.sqrt(this.pokemon.hpEV)/4))*this.pokemon.level)/100 + this.pokemon.level + 10;
            return Math.ceil((val*this.pMod)+this.nMod);
        },
        next: function(updateClient){
            this.owner.hpPercent.set(updateClient);
        }
    });

    this.speed = new Attribute();
    this.speed.init({
        id: CENUMS.SPEED,
        pokemon: this,
        value: base.baseStats.speed, 
        min: 1,
        name: 'Speed',
        max: 9999,
        formula: function(){
            var val = (((this.base * 2 + this.pokemon.speedIV + Math.sqrt(this.pokemon.speedEV)/4))*this.pokemon.level)/100 + 5;
            return Math.ceil((val*this.pMod)+this.nMod);
        }
    });

    this.attack = new Attribute();
    this.attack.init({
        id: CENUMS.ATTACK,
        pokemon: this,
        name: 'Attack',
        value: base.baseStats.attack,
        min: 1,
        max: 9999,
        formula: function(){
            var val = (((this.base * 2 + this.pokemon.attackIV + Math.sqrt(this.pokemon.attackEV)/4))*this.pokemon.level)/100 + 5;
            return Math.ceil((val*this.pMod)+this.nMod);
        }
    });

    this.spattack = new Attribute();
    this.spattack.init({
        id: CENUMS.SPECIALATTACK,
        pokemon: this,
        value: base.baseStats.spattack,
        min: 1,
        max: 9999,
        name: 'Special Attack',
        formula: function(){
            var val = (((this.base * 2 + this.pokemon.spattackIV + Math.sqrt(this.pokemon.spattackEV)/4))*this.pokemon.level)/100 + 5;
            return Math.ceil((val*this.pMod)+this.nMod);
        }
    });

    this.defense = new Attribute();
    this.defense.init({
        id: CENUMS.DEFENSE,
        pokemon: this,
        value: base.baseStats.defense,
        min: 1,
        max: 9999,
        name: 'Defense',
        formula: function(){
            var val = (((this.base * 2 + this.pokemon.defenseIV + Math.sqrt(this.pokemon.defenseEV)/4))*this.pokemon.level)/100 + 5;
            return Math.ceil((val*this.pMod)+this.nMod);
        }
    });

    this.spdefense = new Attribute();
    this.spdefense.init({
        id: CENUMS.SPECIALDEFENSE,
        pokemon: this,
        value: base.baseStats.spdefense,
        min: 1,
        max: 9999,
        name: 'Special Defense',
        formula: function(){
            var val = (((this.base * 2 + this.pokemon.spdefenseIV + Math.sqrt(this.pokemon.spdefenseEV)/4))*this.pokemon.level)/100 + 5;
            return Math.ceil((val*this.pMod)+this.nMod);
        }
    });

    this.evasion = new Attribute();
    this.evasion.init({
        id: CENUMS.EVASION,
        pokemon: this,
        value: 0,
        min: 0,
        max: 100,
        name: 'Evasion'
    });
    this.accuracy = new Attribute();
    this.accuracy.init({
        id: CENUMS.ACCURACY,
        pokemon: this,
        value: 100,
        min: 0,
        max: 600,
        name: 'Accuracy'
    });


    var data = {}
    for (var a in this){
        if (this[a] instanceof Attribute){
            //fill in the attribute index
            this.attributeIndex[this[a].id] = this[a];
            this[a].set();
        }
    }

    this.currentHP = new Attribute();
    this.currentHP.init({
        id: CENUMS.CURRENTHP,
        pokemon: this,
        value: this.hp.value,
        min: 0,
        max: 999,
        name: 'Current HP',
        formula: function(updateClient){
            return this.value;
        },
        next: function(updateClient){
            this.owner.hpPercent.set(updateClient);
        }
    });
    this.attributeIndex[CENUMS.CURRENTHP] = this.currentHP;
    this.hpPercent = new Attribute();
    this.hpPercent.init({
        id: CENUMS.HPPERCENT,
        pokemon: this,
        value: 100,
        min: 0,
        max: 100,
        name: 'Current HP Percent',
        formula: function(updateClient){
            return this.value;
        },
    });
    this.attributeIndex[CENUMS.HPPERCENT] = this.hpPercent;
    this.currentHP.set();


    this.reset();
};


Pokemon.prototype.getDBObj = function(){
    var dbObj = {};
    dbObj.nickname = this.nickname;
    return dbObj;
}

Pokemon.prototype.getClientData = function(less = false){
    //create object to send to the client
    var data = this.getLessClientData()
    if (less){
        return data;
    }

    data[CENUMS.NAME] = this.name;
    data[CENUMS.TYPES] = this.types;
    data[CENUMS.MOVES] = [];
    for (var i = 0; i < this.moves.length;i++){
        data[CENUMS.MOVES].push(this.moves[i].getClientData());
    }
    data[CENUMS.EXP] = this.exp;
    data[CENUMS.CURRENTHP] = this.currentHP.value;
    data[CENUMS.CURRENTPP] = this.currentPP;
    data[CENUMS.SLOT] = this.slot;
    data[CENUMS.HP] = this.hp.value;
    data[CENUMS.SPEED] = this.speed.value;
    data[CENUMS.ATTACK] = this.attack.value;
    data[CENUMS.DEFENSE] = this.defense.value;
    data[CENUMS.SPECIALATTACK] = this.spattack.value;
    data[CENUMS.SPECIALDEFENSE] = this.spdefense.value;
    return data;
}

Pokemon.prototype.getLessClientData = function(){
    var data = {}
    data[CENUMS.NICKNAME] = this.nickname;
    data[CENUMS.NUMBER] = this.number;
    data[CENUMS.LEVEL] = this.level;
    data[CENUMS.ID] = this.id;
    data[CENUMS.HPPERCENT] = this.hpPercent.value;
    return data;
}


Pokemon.prototype.setStat = function(id,amt){
    try{
        this.getStat(id).base = amt;
        this.getStat(id).set(true);
    }catch(e){
        this.character.engine.log("unable to set stat " + id);
        this.character.engine.log(e);
    }
};


Pokemon.prototype.getStat = function(id){
    try{
        return this.attributeIndex[id];
    }catch(e){
        this.character.engine.log("unable to get stat " + id);
        this.character.engine.log(e);
    }
};

Pokemon.prototype.modStat = function(id,amt){
    try{
        this.getStat(id).nMod += amt;
        this.getStat(id).set(true);
    }catch(e){
        this.character.engine.log("unable to mod stat " + id);
        this.character.engine.log(e);
    }
};

Pokemon.prototype.addExp = function(amt){

}


exports.Pokemon = Pokemon;