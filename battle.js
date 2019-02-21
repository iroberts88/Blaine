//----------------------------------------------------------------
// battle.js
//----------------------------------------------------------------

var Player = require('./player.js').Player,
    Character = require('./character.js').Character,
    Trainer = require('./trainer.js').Trainer,
    Actions = require('./actions.js').Actions,
    Attacks = require('./attacks.js').Attacks,
    AWS = require("aws-sdk");

var CENUMS = require('./enums.js').Enums; //init client enums
CENUMS.init();

var Battle = function(ge) {
    this.engine = ge;
    this.id = ge.getId();
    this.endAfterTurn = false;
    this.end = false; //end the battle on next tick
    //ALL BATTLE TYPES

    // 1v1      -   2 players   1-6 pokemon each, 1 active at a time, 1 from each player 
    // 2v2      -   2 players   1-6 pokemon each, 2 active at a time, 2 from each player 
    // 3v3      -   2 players   1-6 pokemon each, 3 active at a time, 3 from each player

    // team2v2  -   4 players   1-6 pokemon each, 2 active at a time, 1 from each player
    // team3v3  -   6 players   1-6 pokemon each, 3 active at a time, 1 from each player
    // team4v4  -   8 players   1-6 pokemon each, 4 active at a time, 1 from each player

    // duoteam4v4   4 players   1-6 pokemon each, 4 active at a time, 2 from each player

    //Battle Types
    this.type = null;

    this.team1 = []; //list of each team's players
    this.team2 = [];
    this.team1Pokemon = [];//list of each team's pokemon
    this.team2Pokemon = [];
    this.activePokemon = {};
    this.players = {}; //keep track of players that receive the data of each round
    this.spectators = {};
    //valid turn data added here...
    this.turnData = {};

    this.chargeCounter = 1;

    this.baseChargeTime = 12; //the lowest pokemon will take n secinds to charge

    this.wild = null;

    this.ready = false;

    this.paused = false;
    this.waitingForNextPokemon = false;
    this.waitingTicker = 0;
    this.waitingTime = 10.0;
    this.currentAction = null;

    this.swapTime = 3.0;
    this.swapTicker = 0;
}

Battle.prototype.init = function (data) {
    //initialize based on battle type

    //type defaults to 1v1
    this.type = data.type;
    this.wild = data.type == 'wild';

    for (var i = 0; i < data.team1.length;i++){
        if (data.team1[i].isCharacter){
            data.team1[i]._initBattle(this,this.wild,1);
            this.team1.push(data.team1[i]);
            this.players[data.team1[i].owner.id] = data.team1[i].owner;
        }else{
            data.team1[i].initBattle(this,this.wild,1);
            this.team1.push(data.team1[i]);
        }
    }
    for (var i = 0; i < data.team2.length;i++){
        if (data.team2[i].isCharacter){
            data.team2[i]._initBattle(this,this.wild,2);
            this.team2.push(data.team2[i]);
            this.players[data.team2[i].owner.id] = data.team2[i].owner;
        }else{
            data.team2[i].initBattle(this,this.wild,2);
            this.team2.push(data.team2[i]);
        }
    }
    //Battle successfully initialized
    //send down battle info to each player
    var t1 = [];
    var t2 = [];
    var t1p = [];
    var t2p = [];
    for (var i = 0; i < this.team1Pokemon.length;i++){
        t1p.push(this.team1Pokemon[i].getLessClientData());
    }
    for (var i = 0; i < this.team2Pokemon.length;i++){
        t2p.push(this.team2Pokemon[i].getLessClientData());
    }
    for (var i = 0; i < this.team1.length;i++){
        t1.push(this.team1[i].getLessClientData());
    }
    for (var i = 0; i < this.team2.length;i++){
        t2.push(this.team2[i].getLessClientData());
    }
    var highest = 1;
    if (t1p.length > highest){highest = t1p.length}
    if (t2p.length > highest){highest = t2p.length}
    //Base charge time varies between battle size!!
    this.baseChargeTime = 7.5 + (highest-1)*2.5;

    console.log("The base charge time is " + this.baseChargeTime)

    this.getChargeCounter(false);

    var cData = {}
    cData[CENUMS.WILD] = this.wild;
    cData[CENUMS.TEAM1] = t1;
    cData[CENUMS.TEAM2] = t2;
    cData[CENUMS.TEAM1POKEMON] = t1p;
    cData[CENUMS.TEAM2POKEMON] = t2p;
    cData[CENUMS.CHARGECOUNTER] = this.chargeCounter;
    for (var i in this.players){
        this.engine.queuePlayer(this.players[i],CENUMS.STARTBATTLE, cData);
    }
    return true;
};

Battle.prototype.tick = function(deltaTime){
    if (this.swapping){
        this.swapTicker += deltaTime;
        if (this.swapTicker >= this.swapTime){
            //swap done
            console.log("SWAPPED!")
            this.paused = false;
            this.currentAction = null; 
            this.swapTicker = 0;
            this.swapping = false;
        }
        return;
    }
    for (var i = 0; i < this.team1.length;i++){
        if (this.team1[i] instanceof Trainer){
            this.team1[i].update(deltaTime);
        }
    }
    for (var i = 0; i < this.team2.length;i++){
        if (this.team2[i] instanceof Trainer){
            this.team2[i].update(deltaTime);
        }
    }
    if (this.waitingForNextPokemon){
        this.waitingTicker += deltaTime;
        if (this.waitingTicker >= this.waitingTime){
            this.waitingTicker = 0;
            this.paused = false;
            this.waitingForNextPokemon = false;
            this.queueData(CENUMS.RESUME,{});
            console.log('yey!!!')
        }
        return;
    }
    for (var i in this.activePokemon){
        var p = this.activePokemon[i];
        p.update(deltaTime);
        if (!this.paused){
            p.charge += deltaTime*p.speed.value;
        }
        if (p.charge >= this.chargeCounter){
            p.charge = this.chargeCounter;
            //if pokemon has a battle command ready - initiate it
            if (p.currentTurnData && !this.currentAction){

                //EXECUTE TURN...
                switch (p.currentTurnData.command){
                    case 'attack':
                        //begin attack animation
                        if (p.castingAttack){
                            break;
                        }

                        if (!this.activePokemon[p.currentTurnData.target.id]){
                            console.log('target pokemon is not active');
                            p.turnInvalid();
                            return;
                        }
                        p.character.participated[p.id] = true;
                        p.castingAttack = p.currentTurnData.move;
                        p.castingAttackTicker = 0;
                        //send to client!!
                        var cData = {};
                        cData[CENUMS.POKEMON] = p.id;
                        cData[CENUMS.TARGET] = p.currentTurnData.target.id;
                        cData[CENUMS.ID] = p.currentTurnData.id;
                        cData[CENUMS.CLIENTID] = p.currentTurnData.move.clientID;
                        cData[CENUMS.NAME] = p.currentTurnData.move.name;
                        this.queueData(CENUMS.ATTACK,cData);
                        this.paused = true;
                        this.currentAction = p.currentTurnData;
                        break;
                    case 'item':
                        break;
                    case 'switch':
                        //begin switch
                        //CHECK TO MAKE SURE STILL VALID

                        var p1 = p.currentTurnData.pkmn;
                        var p2 = p.currentTurnData.target;
                        if (this.activePokemon[p2.id]){
                            console.log('target pokemon is already active');
                            p1.turnInvalid();
                            return;
                        }
                        if (p2.currentHP.value == 0){
                            console.log('target pokemon is fainted');
                            p1.turnInvalid();
                            return;
                        }
                        this.swapTicker = 0;
                        this.paused = true;
                        this.swapping = true;
                        var team = this.getTeamPkmn(p1.character);
                        for (var j = 0; j < team.length;j++){
                            if (p1.id == team[j].id){
                                team[j] = p2;
                            }
                        }
                        delete p1.character.activePokemon[p1.id];
                        delete this.activePokemon[p1.id];

                        p1.character.activePokemon[p2.id] = p2;
                        this.activePokemon[p2.id] = p2;
                        //send to client!!
                        var cData = {};
                        p2.charge = 0;
                        cData[CENUMS.POKEMON1] = p1.id;
                        cData[CENUMS.POKEMON2] = p2.getLessClientData();
                        cData[CENUMS.ID] = p.currentTurnData.id;
                        cData[CENUMS.VALUE] = this.swapTime;
                        cData[CENUMS.CLIENTID] = 6;
                        this.queueData(CENUMS.BATTLESWAP,cData);
                        this.currentAction = p.currentTurnData;
                        this.getChargeCounter();
                        break;
                }

            }
        }
    }
    /*
    if (this.roundActive){
        this.roundTicker += deltaTime;
        //TODO time limits for pvp battles
    }else{
        for (var p in this.players){
            if (!this.readyForNextRound[this.players[p].id]){
                //TODO need a timeout here for if a player disconnects?
                return;
            }
        }
        //all players are ready!!!
        console.log("players ready!");
        for (var i in this.players){
            this.engine.queuePlayer(this.players[i],CENUMS.ROUNDREADY, {round: this.round,time: this.roundTime});
        }
        this.roundActive = true;
    }*/
};

Battle.prototype.checkReady = function(){
    for (var i in this.players){
        if (!this.players[i].ready){
            this.ready = false;
            return;
        }
    }
    this.ready = true;
    this.engine.battleReady(this);
    var cData = {}
    for (var i in this.players){
        this.engine.queuePlayer(this.players[i],CENUMS.READY,cData);
    }
};
Battle.prototype.checkEnd = function(team){
    // check to see if the given team is out of pokemon 
    // (or has no active pokemon for more than 10 seconds)
    var end = false;
    for (var i = 0; i < team.length;i++){
        if (!this.hasActivePokemon()){
            if (this.battle.waitingTicker >= this.battle.waitingTime){
                end = true;
            }
            if (!this.hasWaitingPokemon()){
                end = true;
            }
        }
    }
    for (var i in this.players){
        if (!this.players[i].ready){
            this.ready = false;
            return;
        }
    }
    this.ready = true;
    this.engine.battleReady(this);
    var cData = {}
    for (var i in this.players){
        this.engine.queuePlayer(this.players[i],CENUMS.READY,cData);
    }
};
Battle.prototype.getChargeCounter = function(updateClient = true){
    //set the charge counter
    //slowest pokemon is found, counter is set to speed*10
    // this should be called every time a pokemon switch is made OR a pokemon's speed is changed!
    var currentC = this.chargeCounter;
    var slowest = null;
    var n = Infinity;
    for (var i in this.activePokemon){
        if (this.activePokemon[i].speed.value < n){
            slowest = i;
            n = this.activePokemon[i].speed.value
        }
    }
    this.chargeCounter = n*this.baseChargeTime;
    for (var i in this.activePokemon){
        this.activePokemon[i].charge = this.chargeCounter*(this.activePokemon[i].charge/currentC);
    }

    if (updateClient){
        var cData = {};
        cData[CENUMS.VALUE] = this.chargeCounter;
        for (var i in this.players){
            this.engine.queuePlayer(this.players[i],CENUMS.CHARGECOUNTER, cData);
        }
    }

    console.log('the counter is ' + this.chargeCounter);

}
Battle.prototype.cleanUp = function(){
    //remove players etc?
    for (var i in this.players){
        this.players[i].battle = null;
        this.players[i].ready = false;
    }
};

Battle.prototype.addSpectator = function(p){

};

Battle.prototype.removeSpectator = function(p){

};

Battle.prototype.pokemonFainted = function(pkmn){
    //give exp to other team's pokemon?? AT END OF BATTLE!
    if (this.wild){
        console.log("wild pokemon fainted!!! (run away!!)")
    }
    if (pkmn.character.hasWaitingPokemon()){
        this.paused = true;
        this.waitingForNextPokemon = true;
        this.waitingTicker = 0;
        this.waitingTime = 10.0;
    }
    var team = this.getTeamPkmn(pkmn.character);
    for (var j = 0; j < team.length;j++){
        if (!team[j]){continue;}
        if (pkmn.id == team[j].id){
            team[j] = null;
        }
    }
    delete pkmn.character.activePokemon[pkmn.id];
    delete this.activePokemon[pkmn.id];
    if (pkmn.character instanceof Trainer){
        pkmn.character.pokemonHasFainted = true;
        pkmn.character.pokemonHasFaintedTicker = 0;
    }
    var cData = {};
    cData[CENUMS.VALUE] = this.waitingTime;
    for (var i in this.players){
        this.engine.queuePlayer(this.players[i],CENUMS.WAITING, cData);
    }
}

Battle.prototype.getTeam = function(player){
    for (var i = 0; i < this.team1.length;i++){
        if (this.team1[i].id == player.id){
            return this.team1;
        }
    }
    for (var i = 0; i < this.team2.length;i++){
        if (this.team2[i].id == player.id){
            return this.team2;
        }
    }
    return null;
}
Battle.prototype.getTeamPkmn = function(player){
    for (var i = 0; i < this.team1.length;i++){
        if (this.team1[i].id == player.id){
            return this.team1Pokemon;
        }
    }
    for (var i = 0; i < this.team2.length;i++){
        if (this.team2[i].id == player.id){
            return this.team2Pokemon;
        }
    }
    return null;
}
Battle.prototype.getEnemyTeam = function(player){
    var isteam1 = false;
    var isteam2 = false;
    for (var i = 0; i < this.team1.length;i++){
        if (this.team1[i].id == player.id){
            isteam1 = true;
        }
    }
    for (var i = 0; i < this.team2.length;i++){
        if (this.team2[i].id == player.id){
            isteam2 = true;
        }
    }
    if (isteam1){
        return this.team2;
    }else if (isteam2){
        return this.team1;
    }else{
        return null;
    }
}
Battle.prototype.getEnemyTeamPokemon = function(player){
    var isteam1 = false;
    var isteam2 = false;
    for (var i = 0; i < this.team1.length;i++){
        if (this.team1[i].id == player.id){
            isteam1 = true;
        }
    }
    for (var i = 0; i < this.team2.length;i++){
        if (this.team2[i].id == player.id){
            isteam2 = true;
        }
    }
    if (isteam1){
        return this.team2Pokemon;
    }else if (isteam2){
        return this.team1Pokemon;
    }else{
        return null;
    }
}
Battle.prototype.queueData = function(call,data){
    for (var i in this.players){
        this.engine.queuePlayer(this.players[i],call,data);
    }
}
Battle.prototype.sendChat = function(text){
    for (var i in this.players){
        this.engine.queuePlayer(this.players[i],CENUMS.BATTLECHAT, {text: text});
    }
}

Battle.prototype.mergeSort = function(arr){
    if (arr.length <= 1){
        return arr;
    }
    var middle = parseInt(arr.length/2);
    var left = arr.slice(0,middle);
    var right = arr.slice(middle,arr.length);
    return this.merge(this.mergeSort(left),this.mergeSort(right));
}
Battle.prototype.merge = function(left,right){
    var result = [];
    while (left.length && right.length) {
        if (left[0].speed > right[0].speed) {
            result.push(left.shift());
        } else if (left[0].speed == right[0].speed) {
            //if the same, sort randomly
            if (Math.round(Math.random())){
                result.push(left.shift());
            }else{
                result.push(right.shift());
            }
        }else{
            result.push(right.shift());
        }
    }
    while (left.length)
        result.push(left.shift());
    while (right.length)
        result.push(right.shift());
    return result;
}

exports.Battle = Battle;
