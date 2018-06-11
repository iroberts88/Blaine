var Attacks = function() {};

//ATTACK ACTIONS

var AttackEnums = {
    TestAttack: 'testAttack'
}


///////////////////////////////////
////            Attacks        ////
///////////////////////////////////


Attacks.prototype.testAttack = function(battle,attackData,data){
    console.log('Battle ID: ' + battle.id);
    console.log(attackData);
    console.log(data);
}

Attacks.prototype.getAttack = function(attackStr){
    //return a behaviour based on passed id
    var Attacks = require('./attacks.js').Attacks;
    switch(attackStr) {
        case AttackEnums.TestAttack:
            return Attacks.testAttack;
            break;
        default:
            console.log('Unable to find attack: ' + attackStr);
            return Attacks.testAttack;
            break;
    }
}

exports.Attacks = new Attacks();