
var CENUMS = require('./enums.js').Enums, //init client enums
    utils = require('./utils.js').Utils;
var Utils = new utils();

var Actions = function() {};

var ActionEnums = {
    TestAction: 'testAction',
    Catch: 'catch',
    Damage: 'damage',
    AlterStatStage: 'alterStatStage'
}


///////////////////////////////////
////       Item Actions        ////
///////////////////////////////////


Actions.prototype.testAction = function(data){
    var battle = data.pokemon.character.battle;
    battle.pausedTicker += battle.baseActionSpeed;
    data.ctd.push(Utils.createClientData(CENUMS.ACTION,2,CENUMS.TEXT,'It didn\'t do anything.... NOT IMPLEMENTED ZZZZZZ',CENUMS.T,battle.baseActionSpeed));
    return data.ctd;
}
Actions.prototype.doAttack = function(pokemon,attack,data){
    //data.target - the target pkmn
    data.ctd = [];
    data.pokemon = pokemon;
    data.attack = attack;
    data.battle = pokemon.character.battle;
    var battle = pokemon.character.battle;
    var txt = data.pokemon.nickname + ' used ' + attack.name;
    var targets = [];
    var ctargets = [];
    switch(attack.targetType){
        case CENUMS.SINGLE:
            targets.push(data.target);
            txt += ' on ' + data.target.nickname;
            break;
        case CENUMS.ALL:
            for (var i in battle.activePokemon){
                targets.push(battle.activePokemon[i])
            }
            break;
        case CENUMS.SELF:
            targets.push(pokemon);
            break;
        case CENUMS.ENEMY:
            targets.push(data.target);
            txt += ' on ' + data.target.nickname;
            break;
        case CENUMS.ENEMYTEAM:
            var team = battle.getEnemyTeamPokemon(pokemon.character);
            for (var i = 0; i < team.length;i++){
                if (team[i] && typeof team[i] != 'undefined'){
                    targets.push(team[i]);
                }
            }
            break;
        case CENUMS.ALLY:
            var team = battle.getTeamPokemon(pokemon.character);
            for (var i = 0; i < team.length;i++){
                if (team[i] && typeof team[i] != 'undefined'){
                    targets.push(team[i]);
                }
            }
    }
    battle.pausedTicker += battle.baseActionSpeed;
    data.ctd.push(Utils.createClientData(CENUMS.ACTION,2,CENUMS.TEXT,txt,CENUMS.T,battle.baseActionSpeed));
    //targets acquired.. do attack damage and move effects
    battle.pausedTicker += data.attack.animationTime;
    data.ctd.push(Utils.createClientData(CENUMS.ACTION,1,CENUMS.CLIENTID,data.attack.clientid,CENUMS.T,data.attack.animationSpeed,CENUMS.NAME,data.attack.name,CENUMS.POKEMON,pokemon.id,CENUMS.TARGET,data.target?data.target.id:null));
    console.log('TARGETS:' +  targets.length);
    for (var tar = 0; tar < targets.length;tar++){
        //check to see if attack hits
        var target = targets[tar];
        for (var i = 0; i < attack.effects.length;i++){
            var A = this.getAction(attack.effects[i]['effectName']);
            data.target = target;
            data.effect = attack.effects[i];
            A(data);
        }
    }
}
Actions.prototype.damage = function(data){
    var battle = data.pokemon.character.battle
    if (Math.random()*100 > data.attack.acc || (Math.random()*100 < (data.target.evasion - data.pokemon.accuracy))){
        //hit misses, add to ctd
        //TODO - any on-miss effects go here
        
        battle.pausedTicker += battle.baseActionSpeed;
        data.ctd.push(Utils.createClientData(CENUMS.ACTION,2,CENUMS.TEXT,data.target.nickname + ' evaded the attack!',CENUMS.T,battle.baseActionSpeed));
        return;
    }
    var damage = 0;
    if (data.attack.power != 0){
        //this attack does damage, calculate it
        var a,d = 0;
        if (data.attack.physical){
            a = data.pokemon.attack.value;
            d = data.target.defense.value;
        }else{
            a = data.pokemon.spattack.value;
            d = data.target.spdefense.value;
        }
        var critMod = 1;
        var crit = false;
        if (Math.random()*100 < data.pokemon.critChance){
            //attack is a critical hit
            critMod = data.pokemon.critMod;
            crit = true;
            if (data.attack.physical && data.target.defense.base < data.target.defense.value){
                d = data.target.defense.base;
            }else if (data.target.spdefense.base < data.target.spdefense.value){
                d = data.target.spdefense.base;
            }
        }
        var mod = data.pokemon.damageMod * data.target.damageMod;
        for (var i = 0; i < data.pokemon.types.length;i++){ //add STAB bonus
            if (data.pokemon.types[i] == data.attack.type){
                mod *= data.pokemon.stabBonus;
            }
        }
        var effectiveness = 1;
        for (var i = 0; i < data.target.types.length;i++){ //add effectiveness bonus
            if (typeof battle.engine.moveEffectiveness[data.attack.type][data.target.types[i]] != 'undefined'){ 
                effectiveness *= battle.engine.moveEffectiveness[data.attack.type][data.target.types[i]];
            }
        }
        mod *= effectiveness;
        mod *= (0.15*Math.random()+0.85);
        console.log(mod);
        console.log(critMod)

        //TODO add additional bonuses (burn,statuses weather etc.)
        damage = Math.ceil((((2*(data.pokemon.level*critMod)/5)*data.attack.power*(a/d)/50)+2)*mod);
        console.log(data.pokemon.nickname + ' attacks ' + data.target.nickname + ' with ' + data.attack.name + ". Damage: " + damage);
    }
    data.target.currentHP.value -= damage;
    data.target.currentHP.set(false);


    battle.pausedTicker += battle.baseActionSpeed;
    data.ctd.push(Utils.createClientData(CENUMS.ACTION,3,CENUMS.POKEMON,data.target.id,CENUMS.VALUE,data.target.hpPercent.value,CENUMS.T,battle.baseActionSpeed));

    if (effectiveness == 0){
        battle.pausedTicker += battle.baseActionSpeed;
        data.ctd.push(Utils.createClientData(CENUMS.ACTION,2,CENUMS.TEXT,'No effect!',CENUMS.T,battle.baseActionSpeed));
        return;
    }else if (effectiveness < 1){
        battle.pausedTicker += battle.baseActionSpeed;
        data.ctd.push(Utils.createClientData(CENUMS.ACTION,2,CENUMS.TEXT,'Not very effective...',CENUMS.T,battle.baseActionSpeed));
    }else if (effectiveness > 1){
        battle.pausedTicker += battle.baseActionSpeed;
        data.ctd.push(Utils.createClientData(CENUMS.ACTION,2,CENUMS.TEXT,'Super effective!!!',CENUMS.T,battle.baseActionSpeed));
    }
}
Actions.prototype.catch = function(data){
    //TODO ATTEMPT TO CATCH THE POKEMON
    if (!data.battle.wild){
        data.failed = true;
        return;
    }
    var pokemon = null
    for (var i = 0; i < data.battle.activePokemon.length;i++){
        if (data.battle.activePokemon[i].character.pkmnCatchable){
            pokemon = data.battle.activePokemon[i];
        }
    }
    if (!pokemon){
        //no target - get a catchable pokemon
        data.failed = true;
        return;
    }
    var catchRate = ((3*pokemon.hp.value - 2*pokemon.currentHP) * pokemon.captureRate * data.actionData.power)/(3*pokemon.hp.value);
    //status bonuses?
    for (var i = 0; i < pokemon.status.length;i++){
        //TODO sleep poison etc.
    }
    console.log("A: " + catchRate);
    var b = 1048560 / Math.sqrt(Math.sqrt(16711680/catchRate))
    console.log('B: ' + b);
    var shakes = 0;
    for (var i = 1; i < 5;i++){
        var rand = Math.random()*65635;
        if (rand > b){
            console.log(rand + ' - FAIL');
            break;
        }else{
            console.log(rand + ' - Shake!!');
            shakes += 1
        }
    }
    var info = {
        partySlot: null,
        addedToPokedex: null,
        pcBox: null
    }
    data.removeItem = true;

    data.battle.pausedTicker += data.battle.baseActionSpeed;
    data.ctd.push(Utils.createClientData(CENUMS.ACTION,2,CENUMS.TEXT,'Used ' + data.item.name + '!',CENUMS.T,data.battle.baseActionSpeed));

    //time is based on shakes #??
    data.battle.pausedTicker += 1.5+(1.3*shakes);
    data.ctd.push(Utils.createClientData(CENUMS.ACTION,7,CENUMS.POKEMON,pokemon.id,CENUMS.VALUE,shakes,CENUMS.T,1.5+(1.3*shakes)));

    if (shakes == 4){
        info = data.character.addPokemon(pokemon);

        if (info.partySlot != null){
            data.battle.pausedTicker += data.battle.baseActionSpeed;
            data.ctd.push(Utils.createClientData(CENUMS.ACTION,2,CENUMS.TEXT,pokemon.nickname + ' added to party!',CENUMS.T,data.battle.baseActionSpeed));
        }
        if (info.pcBox != null){
            data.battle.pausedTicker += data.battle.baseActionSpeed;
            data.ctd.push(Utils.createClientData(CENUMS.ACTION,2,CENUMS.TEXT,pokemon.nickname + ' added to PC box #' + info.pcBox + '!',CENUMS.T,data.battle.baseActionSpeed));
        }
        if (info.addedToPokedex != null){
            data.battle.pausedTicker += data.battle.baseActionSpeed;
            data.ctd.push(Utils.createClientData(CENUMS.ACTION,2,CENUMS.TEXT,pokemon.name + ' info added to pokedex!',CENUMS.T,data.battle.baseActionSpeed));
        }
        pokemon.caught = true;
    }
    return data.ctd;
}


Actions.prototype.alterStatStage = function(data){
    console.log(data.effect)
    if (typeof data.effect.chance == 'undefined'){
        data.effect.chance = 1;
    }
    
    if (Math.random() < data.effect.chance){
        var stat = data.target.getStat(CENUMS.statEnums[data.effect.stat]);
        if (!stat){return;}
        console.log(stat.value)
        var previous = stat.stage;
        stat.modStage(data.effect.val);
        var change = stat.stage - previous;
        var text = '';
        //todo these should all be parsed on the client instead of having the text sent down...
        if (change == 0){
            if (data.effect.val < 0){
                text = data.target.nickname + '\'s ' + stat.name + ' won\'t go any lower!';
            }else{
                text = data.target.nickname + '\'s ' + stat.name + ' won\'t go any higher!';
            }
        }else if (change == 1){
                text = data.target.nickname + '\'s ' + stat.name + ' went up!';
        }else if (change == -1){
                text = data.target.nickname + '\'s ' + stat.name + ' went down!';
        }else if (change > 1){
                text = data.target.nickname + '\'s ' + stat.name + ' went way up!';
        }else if (change < 1){
                text = data.target.nickname + '\'s ' + stat.name + ' went way down!';
        }
        console.log(stat.value);
        data.battle.pausedTicker += data.battle.baseActionSpeed;
        data.ctd.push(Utils.createClientData(CENUMS.ACTION,2,CENUMS.TEXT,text,CENUMS.T,data.battle.baseActionSpeed));
    }
}

///////////////////////////////////
////        Get Actions        ////
///////////////////////////////////

Actions.prototype.getAction = function(actionStr){
    //return a behaviour based on passed id
    var Actions = require('./actions.js').Actions;
    switch(actionStr) {
        case ActionEnums.TestAction:
            return Actions.testAction;
            break;
        case ActionEnums.Catch:
            return Actions.catch;
            break;
        case ActionEnums.Damage:
            return Actions.damage;
            break;
        case ActionEnums.AlterStatStage:
            return Actions.alterStatStage;
            break;
        default:
            console.log('Unable to find action: ' + actionStr);
            return Actions.testAction;
            break;
    }
}

exports.Actions = new Actions();