
var CENUMS = require('./enums.js').Enums; //init client enums
CENUMS.init();

var Actions = function() {};

var ActionEnums = {
    TestAction: 'testAction',
    Catch: 'catch'
}


///////////////////////////////////
////       Item Actions        ////
///////////////////////////////////


Actions.prototype.testAction = function(data){
    console.log(data);
    data.ctd.push({
        action: 'text',
        text: 'Used ' + data.item.name + '!'
    });
    data.ctd.push({
        action: 'text',
        text: 'It didn\'t do anything.... NOT IMPLEMENTED ZZZZZZ'
    });
    return data.ctd;
}
Actions.prototype.doAttack = function(pokemon,attack,data){
    //data.target - the target pkmn
    if (pokemon.currentHP.value <= 0){
        console.log('Pokemon fainted before doing the attack!')
        return;
    }
    var targets = [];
    switch(attack.targetType){
        case CENUMS.SINGLE:
            targets.push(data.target);
            break;
        case CENUMS.ALL:
            for (var i in pokemon.character.battle.activePokemon){
                targets.push(pokemon.character.battle.activePokemon[i])
            }
            break;
        case CENUMS.SELF:
            targets.push(pokemon);
            break;
        case CENUMS.ENEMY:
            targets.push(data.target);
            break;
        case CENUMS.ENEMYTEAM:
            var team = pokemon.character.battle.getEnemyTeamPokemon(pokemon.character);
            for (var i = 0; i < team.length;i++){
                if (team[i] && typeof team[i] != 'undefined'){
                    targets.push(team[i]);
                }
            }
            break;
        case CENUMS.ALLY:
            var team = pokemon.character.battle.getTeamPokemon(pokemon.character);
            for (var i = 0; i < team.length;i++){
                if (team[i] && typeof team[i] != 'undefined'){
                    targets.push(team[i]);
                }
            }
    }
    //targets acquired.. do attack damage and move effects
    var battle = pokemon.character.battle;
    console.log('TARGETS:' +  targets.length);
    for (var tar = 0; tar < targets.length;tar++){
        //check to see if attack hits
        var target = targets[tar];
        if (Math.random()*100 > attack.acc || (Math.random()*100 < (target.evasion - pokemon.accuracy))){
            //hit misses, add to ctd
            //TODO - any on-miss effects go here
            console.log('Attack evaded')
            continue;
        }
        var damage = 0;
        if (attack.power != 0){
            //this attack does damage, calculate it
            var a,d = 0;
            if (attack.physical){
                a = pokemon.attack.value;
                d = target.defense.value;
            }else{
                a = pokemon.spattack.value;
                d = target.spdefense.value;
            }
            var critMod = 1;
            if (Math.random()*100 < pokemon.critChance){
                //attack is a critical hit
                console.log("critical hit!")
                critMod = pokemon.critMod;
                if (attack.physical && target.defense.base < target.defense.value){
                    d = target.defense.base;
                }else if (targetsp.defense.base < target.spdefense.value){
                    d = target.spdefense.base;
                }
            }
            var mod = pokemon.damageMod * target.damageMod;
            for (var i = 0; i < pokemon.types.length;i++){ //add STAB bonus
                if (pokemon.types[i] == attack.type){
                    mod *= pokemon.stabBonus;
                }
            }
            var effectiveness = 1;
            for (var i = 0; i < target.types.length;i++){ //add effectiveness bonus
                if (typeof battle.engine.moveEffectiveness[attack.type][target.types[i]] != 'undefined'){ 
                    effectiveness *= battle.engine.moveEffectiveness[attack.type][target.types[i]];
                }
            }
            if (effectiveness == 0){
                console.log("No effect!");
            }else if (effectiveness < 1){
                console.log("Not very effective...")
            }else if (effectiveness > 1){
                console.log("super effective!!!")
            }else{

            }
            mod *= effectiveness;
            mod *= (0.15*Math.random()+0.85);
            console.log(mod);
            console.log(critMod)

            //TODO add additional bonuses (burn,statuses weather etc.)
            damage = Math.ceil((((2*(pokemon.level*critMod)/5)*attack.power*(a/d)/50)+2)*mod);
            console.log(pokemon.nickname + ' attacks ' + target.nickname + ' with ' + attack.name + ". Damage: " + damage);
        }
        //do the attack effects
        /*for (var eff = 0; eff < attack.effects.length;eff++){
            console.log(attack.effects[eff])
            var effect = attack.effects[eff];
            var E = Effects.getEffect(effect.effectName);
            if (!E){
                console.log('No effect named "' + effect.effectName + '"')
                continue;
            }
            
        }*/
        target.currentHP.value -= damage;
        target.currentHP.set(true);
    }
}
Actions.prototype.catch = function(data){
    //TODO ATTEMPT TO CATCH THE POKEMON
    var pokemon = data.battle.activePokemon[data.turnData.pID];
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
    data.ctd.push({
            action: 'text',
        text: 'Used ' + data.item.name + '!'
    });
    data.ctd.push({
        action: 'catchattempt',
        pokemon: pokemon.id,
        shakes: shakes
    });

    if (shakes == 4){
        info = data.character.addPokemon(pokemon);
        data.ctd.push({
            action: 'getnickname',
            pokemon: pokemon.id
        });

        if (info.partySlot != null){
            data.ctd.push({
                action: 'text',
                text: pokemon.nickname + ' added to party!'
            });
        }
        if (info.pcBox != null){
            data.ctd.push({
                action: 'text',
                text: pokemon.nickname + ' added to PC box #' + info.pcBox + '!'
            });
        }
        if (info.addedToPokedex != null){
            data.ctd.push({
                action: 'text',
                text: pokemon.name + ' info added to pokedex!'
            });
        }
        data.ctd.push({
            action: 'endbattle'
        });
        data.battle.endAfterTurn = true;
    }
    return data.ctd;
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
        default:
            console.log('Unable to find action: ' + actionStr);
            return Actions.testAction;
            break;
    }
}

exports.Actions = new Actions();