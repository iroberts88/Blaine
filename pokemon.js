var Attribute = require('./attribute.js').Attribute;
var Actions = require('./actions.js').Actions;
var CENUMS = require('./enums.js').Enums; //init client enums

var expEnums = {
    SLOW: 'slow', //1
    MSLOW: 'mslow', //2
    MFAST: 'mfast', //3
    FAST: 'fast', //4
    FLUC: 'fluctuating', //5
    ERRATIC: 'erratic' //6
};

var expTypeEnums = {
    'slow': 1,
    'mslow': 2,
    'mfast': 3,
    'fast': 4,
    'fluctuating': 5,
    'erratic': 6
}

var Pokemon = function(){
    this.MAX_ATTACKS = 4;
    this.MAX_EV_VALUE = 30000;
    this.MAX_IV_VALUE = 32;

    this.id = null;
    this.pokemonid = null;
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

    this.currentTurnData = null;

    this.castingAttack = null;
    this.castingAttackTicker = 0;

    this.status = [];

    this.charge = 0;
}

Pokemon.prototype.reset = function(){
    this.charge = 0;
    this.castingAttack = null
    this.currentTurnData = null;
    this.castingAttackTicker = 0;
}
Pokemon.prototype.battleReset = function(){
    this.charge = 0;
    this.currentTurnData = null;

    this.hp.reset(false);
    this.speed.reset(false);
    this.spattack.reset(false);
    this.spdefense.reset(false);
    this.defense.reset(false);
    this.attack.reset(false);

    //clear some status effects?
}

Pokemon.prototype.turnInvalid = function(){
    this.castingAttack = null
    this.currentTurnData = null;
    this.castingAttackTicker = 0;
    if (this.character.owner){
        var cData = {};
        cData[CENUMS.POKEMON] = this.id;
        this.character.owner.engine.queuePlayer(this.character.owner,CENUMS.TURNINVALID,cData);
    }
}

Pokemon.prototype.update = function(deltaTime){
    if (this.castingAttack){
        //update the current attack cast...
        this.castingAttackTicker += deltaTime;
        if (this.castingAttack.animationTime+1.0 <= this.castingAttackTicker){
            Actions.doAttack(this,this.castingAttack,this.currentTurnData);
            this.reset();
            var cData = {};
            cData[CENUMS.POKEMON] = this.id;
            cData[CENUMS.WAITING] = this.character.battle.waitingForNextPokemon;
            this.character.battle.queueData(CENUMS.ATTACKDONE,cData);
            if (!this.character.battle.waitingForNextPokemon){
                this.character.battle.paused = false;
            }
            this.character.battle.currentAction = null; 

            this.character.checkBattleEnd();
        }
    }
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

    this.nickname = (data.nickname == '') ? base['name'] : data.nickname; //REQUIRED IN <data>
    this.character = data.character; //REQUIRED IN <data>
    this.engine = data.engine;
    this.id = data.id; //REQUIRED IN <data>
    this.pokemonid = base['id'];
    this.baseExp = base['baseExp'];
    this.number = base['number'];
    this.name = base['name'];
    this.types = []; //list of types
    for (var i = 0; i < base['types'].length;i++){
        this.types.push(CENUMS.typeEnums[base['types'][i]]);
    }

    this.captureRate = (typeof base['captureRate'] == 'undefined') ? 1 : base['captureRate'];

    this.affection = (typeof data.affection == 'undefined') ? 0 : data.affection;
    this.critChance = (typeof data.critChance == 'undefined') ? 0 : data.critChance;
    this.critMod = 2;
    this.level = (typeof data.level == 'undefined') ? 5 : data.level;
    this.expType = expEnums.FAST;
    this.exp = (typeof data.exp == 'undefined') ? this.getExpValue(this.level) : data.exp;
    this.expToNextLevel = this.getExpValue(this.level+1);
    this.expAtCurrentLevel = this.getExpValue(this.level);


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
        value: base['baseStats'].hp,
        min: 1,
        name: 'Maximum HP',
        max: 9999,
        formula: function(){
            var val = (((this.base * 2 + this.pokemon.hpIV + Math.sqrt(this.pokemon.hpEV)/4))*this.pokemon.level)/100 + this.pokemon.level + 10;
            return Math.ceil((val*this.pMod)+this.nMod);
        },
        next: function(updateClient){
            this.pokemon.hpPercent.set(updateClient);
        }
    });

    this.speed = new Attribute();
    this.speed.init({
        id: CENUMS.SPEED,
        pokemon: this,
        value: base['baseStats']['speed'], 
        min: 1,
        name: 'Speed',
        max: 9999,
        formula: function(){
            var val = (((this.base * 2 + this.pokemon.speedIV + Math.sqrt(this.pokemon.speedEV)/4))*this.pokemon.level)/100 + 5;
            return Math.ceil((val*this.pMod)+this.nMod);
        },
        next: function(){
            var battle = this.pokemon.owner.battle;
            if (battle){
                battle.setChargeCounter();
            }
        }
    });

    this.attack = new Attribute();
    this.attack.init({
        id: CENUMS.ATTACK,
        pokemon: this,
        name: 'Attack',
        value: base['baseStats']['attack'],
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
        value: base['baseStats']['spattack'],
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
        value: base['baseStats']['defense'],
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
        value: base['baseStats']['spdefense'],
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
        max: 90,
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
            this.pokemon.hpPercent.set(updateClient);
            //check faint!!
            if (this.value == 0){
                this.pokemon.character.battle.pokemonFainted(this.pokemon);
            }
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
            return (this.pokemon.currentHP.value/this.pokemon.hp.value)*100;
        }
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
    data[CENUMS.EXPTYPE] = expTypeEnums[this.expType];
    data[CENUMS.CURRENTHP] = this.currentHP.value;
    data[CENUMS.CURRENTPP] = this.currentPP;
    data[CENUMS.SLOT] = this.slot;
    data[CENUMS.HP] = this.hp.value;
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
    data[CENUMS.SPEED] = this.speed.value;
    data[CENUMS.HPPERCENT] = this.hpPercent.value;
    data[CENUMS.OWNER] = this.character ? this.character.id : null;
    return data;
}


Pokemon.prototype.setStat = function(id,amt){
    try{
        this.getStat(id).base = amt;
        this.getStat(id).set(true);
    }catch(e){
        this.engine.log("unable to set stat " + id);
        this.engine.log(e);
    }
};


Pokemon.prototype.getStat = function(id){
    try{
        return this.attributeIndex[id];
    }catch(e){
        this.engine.log("unable to get stat " + id);
        this.engine.log(e);
    }
};

Pokemon.prototype.modStat = function(id,amt){
    try{
        this.getStat(id).nMod += amt;
        this.getStat(id).set(true);
    }catch(e){
        this.engine.log("unable to mod stat " + id);
        this.engine.log(e);
    }
};

Pokemon.prototype.getMove = function(id){
    for (var i = 0; i < this.moves.length;i++){
        if (this.moves[i].attackid == id){
            return this.moves[i];
        }
    }
    return false;
}

Pokemon.prototype.getExpValue = function(level){
    if (level == 0){return 0;}
    switch (this.expType){
        case expEnums.SLOW:
            return Math.round((5*Math.pow(level,3))/4);
            break;
        case expEnums.MSLOW:
            return Math.max(level*20,Math.round((6/5)*Math.pow(level,3)-(15*Math.pow(level,2))+100*level-140));
            break;
        case expEnums.MFAST:
            return Math.pow(level,3);
            break;
        case expEnums.FAST:
            return Math.round((4*Math.pow(level,3))/5);
            break;
        case expEnums.ERRATIC:
            if (level <= 50){
                return Math.round((Math.pow(level,3)*(100-level))/50);
            }else if (level <= 68){
                return Math.round((Math.pow(level,3)*(150-level))/100);
            }else if (level <= 98){
                return Math.round((Math.pow(level,3)*((1911-10*level)/3))/500);
            }else {
                return Math.round((Math.pow(level,3)*(160-level))/100);
            }
            break;
        case expEnums.FLUC:
            if (level <= 15){
                return Math.round(Math.pow(level,3)*((((level+1)/3)+24)/50));
            }else if (level <= 36){
                return Math.round(Math.pow(level,3)*((level+14)/50));
            }else {
                return Math.round(Math.pow(level,3)*(((level/2)+32)/50));
            }
            break;

    }
}
Pokemon.prototype.getMoveIndex = function(id){
    for (var i = 0; i < this.moves.length;i++){
        if (this.moves[i].attackid == id){
            return i;
        }
    }
    return null;
}

Pokemon.prototype.addExp = function(amt){
    this.exp += amt;
    while (this.exp >= this.expToNextLevel){
        //levelup!!
        this.level += 1;
        this.expToNextLevel = this.getExpValue(this.level+1);
        this.expAtCurrentLevel = this.getExpValue(this.level);
    }
    //change stats!!!
    var currentRatio = this.currentHP.value/this.hp.value;
    this.hp.set(true);
    var newRatio = this.currentHP.value/this.hp.value;
    if (currentRatio != newRatio){
        this.currentHP.value = Math.ceil(this.hp.value*currentRatio);
    }
    this.currentHP.set(true);
    this.defense.set(true);
    this.attack.set(true);
    this.spdefense.set(true);
    this.spattack.set(true);
    this.speed.set(true);

    if (this.character.owner){
        var sData = {};
        sData[CENUMS.STAT] = CENUMS.EXP;
        sData[CENUMS.ID] = this.id;
        sData[CENUMS.VALUE] = this.exp;
        this.engine.queuePlayer(this.character.owner,CENUMS.SETUNITSTAT,sData);
    }
}

Pokemon.prototype.levelup = function(){
    this.level += 1;
}


exports.Pokemon = Pokemon;