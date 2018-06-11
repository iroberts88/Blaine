var Actions = function() {};

var ActionEnums = {
    TestAction: 'testAction',
    Catch: 'catch'
}


///////////////////////////////////
////       Item Actions        ////
///////////////////////////////////

//data.battle
//data.item
//data.ctd - return clientTurnData
//data.actionData - the current item actions being executed with relevant data
//data.turnData - the current turn being executed in a battle

Actions.prototype.testAction = function(data){
    console.log(data);
    data.ctd.push({
        text: 'Used ' + data.item.name + '!'
    });
    data.ctd.push({
        text: 'It didn\'t do anything....'
    });
    return data.ctd;
}

Actions.prototype.catch = function(data){
    console.log(data);
    //TODO ATTEMPT TO CATCH THE POKEMON
    var pokemon = data.battle.activePokemon[data.turnData.pID];
    console.log(pokemon.nickname)
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
        }
    }

    data.ctd.push({
        text: 'Used ' + data.item.name + '!'
    });
    data.ctd.push({
        action: 'catchAttempt',
        shakes: shakes
    });
    return data.ctd;
}

///////////////////////////////////
////       status actions      ////
///////////////////////////////////


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