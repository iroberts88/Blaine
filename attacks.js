
var Effects = require('./effects.js').Effects;

var Attacks = function() {};

//ATTACK ACTIONS

var AttackEnums = {
    TestAttack: 'testAttack',
    Scratch: 'scratch'
}


///////////////////////////////////
////            Attacks        ////
///////////////////////////////////


Attacks.prototype.testAttack = function(battle,attackData,data){
    console.log('Battle ID: ' + battle.id);
    console.log(attackData);
    console.log(data);
}

Attacks.prototype.doAttack = function(attack,battle,data){
    var pkmnDoingAttack = battle.activePokemon[data.pkmnDoingAttack];
    if (pkmnDoingAttack.currentHP <= 0){
        return;
    }
    var targets = [];
    switch(attack.targetType){
        case 'single':
            targets.push(data.target);
            break;
        case 'all':
            //get all targets...
            break;
        case 'self':
            break;
        case 'enemy':
            break;
        case 'enemyTeam':
            break;
        case 'ally':
            break;
    }
    //targets acquired.. do attack damage and move effects
    for (var i = 0; i < targets.length;i++){
        //check to see if attack hits
        var target = targets[i];
        if (Math.random()*100 > attack.acc || (Math.random()*100 < (target.evasion.value - pkmnDoingAttack.accuracy.value))){
            //hit misses, add to ctd
            //TODO - any on-miss effects go here
            data.ctd.push({
                action: 'evade',
                pokemon1: pkmnDoingAttack.id,
                pokemon2: target.id
            });
            continue;
        }
        var damage = 0;
        if (attack.power != 0){
            //this attack does damage, calculate it
            var a,d = 0;
            if (attack.physical){
                a = pkmnDoingAttack.attack.value;
                d = target.defense.value;
            }else{
                a = pkmnDoingAttack.spattack.value;
                d = target.spdefense.value;
            }
            var critMod = 1;
            if (Math.random()*100 < pkmnDoingAttack.critChance){
                //attack is a critical hit
                data.ctd.push({
                    action: 'text',
                    text: "Critical Hit!"
                });
                critMod = pkmnDoingAttack.critMod;
                if (attack.physical && target.defense.base < target.defense.value){
                    d = target.defense.base;
                }else if (targetsp.defense.base < target.spdefense.value){
                    d = target.spdefense.base;
                }
            }
            var mod = pkmnDoingAttack.damageMod * target.damageMod;
            for (var i = 0; i < pkmnDoingAttack.types.length;i++){ //add STAB bonus
                if (pkmnDoingAttack.types[i] == attack.type){
                    mod *= pkmnDoingAttack.stabBonus;
                }
            }
            var effectiveness = 1;
            for (var i = 0; i < target.types.length;i++){ //add effectiveness bonus
                if (typeof battle.engine.moveEffectiveness[attack.type][target.types[i]] != 'undefined'){ 
                    effectiveness *= battle.engine.moveEffectiveness[attack.type][target.types[i]];
                }
            }
            if (effectiveness == 0){
                data.ctd.push({
                    action: 'text',
                    text: "It didn't effect " + target.nickname + '!'
                });
            }else if (effectiveness < 1){
                data.ctd.push({
                    action: 'text',
                    text: "It's not very effective..."
                });
            }else if (effectiveness > 1){
                data.ctd.push({
                    action: 'text',
                    text: "It's SUPER effective!!!"
                });
            }
            mod *= effectiveness;
            mod *= (0.15*Math.random()+0.85);
            console.log(mod);
            console.log(critMod)

            //TODO add additional bonuses (burn,statuses weather etc.)
            damage = Math.ceil((((2*(pkmnDoingAttack.level*critMod)/5)*attack.power*(a/d)/50)+2)*mod);
            console.log("A: " + a);
            console.log("D: " + d);
            console.log(pkmnDoingAttack.nickname + ' attacks ' + target.nickname + ' with ' + attack.name + ". Damage: " + damage);
        }
        //do the attack effects
        for (var eff = 0; eff < attack.effects.length;eff++){
            console.log(attack.effects[eff])
            var effect = attack.effects[eff];
            var E = Effects.getEffect(effect.effectName);
            if (!E){
                console.log('No effect named "' + effect.effectName + '"')
                continue;
            }
            E({
                attack:attack,
                battle:battle,
                turnData:data,
                effect: effect,
                ctd: data.ctd,
                pkmnDoingAttack: pkmnDoingAttack,
                target: target
            });
        }
        target.currentHP -= damage;
        if (target.currentHP > 0){
            data.ctd.push({
                action: 'sethp',
                pkmn: target.id,
                percent: target.currentHP/target.hp.value,
                value: target.currentHP
            });
        }else{
            target.currentHP = 0;
            //target faints!! ..deal with that shit
            data.ctd.push({
                action: 'faint',
                pkmn: target.id,
            });
            //all pokemon fainted?
            battle.cleanUp();
            battle.end = true;
        }
    }

}
Attacks.prototype.getAttackEffect = function(attackStr){
    //return a behaviour based on passed id
    var Attacks = require('./attacks.js').Attacks;
    switch(attackStr) {
        case AttackEnums.TestAttack:
            return Attacks.testAttack;
            break;
        case AttackEnums.Scratch:
            return Attacks.scratch;
            break;
        default:
            console.log('Unable to find attack: ' + attackStr);
            return Attacks.testAttack;
            break;
    }
}

exports.Attacks = new Attacks();