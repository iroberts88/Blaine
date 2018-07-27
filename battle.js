//----------------------------------------------------------------
// battle.js
//----------------------------------------------------------------

var Player = require('./player.js').Player,
    Character = require('./character.js').Character,
    Trainer = require('./trainer.js').Trainer,
    Actions = require('./actions.js').Actions,
    Attacks = require('./attacks.js').Attacks,
    AWS = require("aws-sdk");

var Battle = function(ge) {
    this.gameEngine = ge;
    this.id = ge.getId();
    this.endAfterTurn = false;
    this.end = false; //end the battle on next tick
    //ALL BATTLE TYPES
    // 1v1      -   2 players   1-6 pokemon each, 1 active at a time, 1 from each player 
    // 2v2      -   2 players   1-6 pokemon each, 2 active at a time, 2 from each player 
    // 3v3      -   2 players   1-6 pokemon each, 3 active at a time, 3 from each player 
    // 4v4      -   2 players   1-6 pokemon each, 4 active at a time, 4 from each player

    // team2v2  -   4 players   1-6 pokemon each, 2 active at a time, 1 from each player
    // team3v3  -   6 players   1-6 pokemon each, 3 active at a time, 1 from each player
    // team4v4  -   8 players   1-6 pokemon each, 4 active at a time, 1 from each player

    // duoteam4v4   4 players   1-6 pokemon each, 4 active at a time, 2 from each player


    this.ActivePkmn = {
        '1v1': 1,
        '2v2': 2,
        'team2v2': 1,
        '3v3': 3,
        'team3v3': 1,
        '4v4': 4,
        'team4v4': 1
    };

    this.TeamLengths = {
        '1v1': 1,
        '2v2': 1,
        'team2v2': 2,
        '3v3': 1,
        'team3v3': 3,
        '4v4': 1,
        'team4v4': 4
    };


    //Battle Types
    this.type = null;

    this.team1 = [];
    this.team2 = [];
    this.team1Pokemon = [];
    this.team2Pokemon = [];
    this.activePokemon = {};
    this.players = {}; //keep track of players that receive the data of each round
    this.spectators = {};
    //valid turn data added here...
    this.turnData = {};

    this.round = 1;
    this.roundTime = 30.0; //round time in seconds
    this.roundActive = false;
    this.roundTicker = 0;
    this.readyForNextRound = {};
    this.wild = null;
}

Battle.prototype.init = function (data) {
    //initialize based on battle type

    //type defaults to 1v1
    this.type = (typeof data.type == 'undefined') ? '1v1' : data.type;

    this.wild = (typeof data.wild == 'undefined') ? true : data.wild;
    //team 1 and 2 must be the same length AND of the player.character or trainer type
    if (!(data.team1.length == this.TeamLengths[data.type] && data.team2.length == this.TeamLengths[data.type])){
        console.log('Battle type "' + this.type + '" must have a team length of ' + this.TeamLengths[data.type] + '.');
        return false;
    }
    for (var i = 0; i < data.team1.length;i++){
        if (data.team1[i] instanceof Character || data.team1[i] instanceof Trainer){
            data.team1[i].initBattle(this,this.TeamLengths[data.type],1);
            this.team1.push(data.team1[i]);
            if (data.team1[i] instanceof Character){
                this.players[data.team1[i].owner.id] = data.team1[i].owner;
                this.readyForNextRound[data.team1[i].owner.id] = false;
            }
        }else{
            console.log("Teams must consist of Characters or Trainers");
            return false;
        }
    }
    for (var i = 0; i < data.team2.length;i++){
        if (data.team2[i] instanceof Character || data.team2[i] instanceof Trainer){
            data.team2[i].initBattle(this,this.TeamLengths[data.type],2);
            this.team2.push(data.team2[i]);
            if (data.team2[i] instanceof Character){
                this.players[data.team2[i].owner.id] = data.team2[i].owner;
                this.readyForNextRound[data.team2[i].owner.id] = false;
            }
        }else{
            console.log("Teams must consist of Characters or Trainers");
            return false;
        }
    }
    //Battle successfully initialized
    //send down battle info to each player
    var t1 = [];
    var t2 = [];
    for (var i = 0; i < this.team1.length;i++){
        for (var j = 0; j < this.team1[i].activePokemon.length;j++){
            t1.push(this.team1[i].activePokemon[j].getLessClientData());
        }
    }
    for (var i = 0; i < this.team2.length;i++){
        for (var j = 0; j < this.team2[i].activePokemon.length;j++){
            t2.push(this.team2[i].activePokemon[j].getLessClientData());
        }
    }
    for (var i in this.players){
        this.gameEngine.queuePlayer(this.players[i],"startBattle", {wild: this.wild,type: this.type,team1: t1,team2: t2});
    }
    return true;
};

Battle.prototype.tick = function(deltaTime){
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
            this.gameEngine.queuePlayer(this.players[i],"roundReady", {round: this.round,time: this.roundTime});
        }
        this.roundActive = true;
    }
};

Battle.prototype.cleanUp = function(){
    //remove players etc?
    for (var i in this.players){
        this.players[i].battle = null;
    }
};

Battle.prototype.addSpectator = function(p){

};

Battle.prototype.removeSpectator = function(p){

};

Battle.prototype.addTurnData = function(pkmnID,data){
    //Received turn data from a player
    //check to see if all data has been received
    //if it has, add AI turn data, parse all data and proceed with the turn

    this.turnData[pkmnID] = data;
    //check all pkmn data
    var allTurnDataAcquired = true;
    for (var i = 0; i < this.team1.length;i++){
        if (this.team1[i] instanceof Character){
            //see if all players have turnData for their pokemon
            for (var j = 0; j < this.team1[i].activePokemon.length;j++){
                if (typeof this.turnData[this.team1[i].activePokemon[j].id] == 'undefined'){
                    allTurnDataAcquired = false;
                }
            }
        }
    }
    for (var i = 0; i < this.team2.length;i++){
        if (this.team2[i] instanceof Character){
            //see if all players have turnData for their pokemon
            for (var j = 0; j < this.team2[i].activePokemon.length;j++){
                if (typeof this.turnData[this.team2[i].activePokemon[j].id] == 'undefined'){
                    allTurnDataAcquired = false;
                }
            }
        }
    }

    if (allTurnDataAcquired){
        //Do the turn!!
        for (var i in this.activePokemon){
            if (this.activePokemon[i].character instanceof Character){
                continue;
            }
            //get AI turn data
            var mIndex,pID;
            mIndex = Math.floor(Math.random()*this.activePokemon[i].moves.length);
            var enemyTeam = this.team1Pokemon;
            if (this.activePokemon[i].character.currentTeam == 1){
                enemyTeam = this.team2Pokemon;
            }
            var index = Math.floor(Math.random()*enemyTeam.length);
            this.turnData[this.activePokemon[i].id] = {
                'command': 'fight',
                'moveIndex': mIndex,
                'pID': enemyTeam[index].id,
                'pIndex': index
            }
            console.log(this.turnData);
        }

        //execute turn and create the turn data for client
        var clientTurnData = [];

        //get fight order...
        var fightOrder = [];
        for (var i in this.activePokemon){
            var tData = this.turnData[this.activePokemon[i].id];
            if (tData.command == 'fight'){
                fightOrder.push({id: this.activePokemon[i].id,speed: this.activePokemon[i].speed.value});
            }
        }

        //Use items first
        for (var i in this.activePokemon){
            var tData = this.turnData[this.activePokemon[i].id]
            if (tData.command == 'item'){
                //do item stuff
                var item = this.activePokemon[i].character.inventory.getItemByOrder(tData.type,tData.oIndex);
                //get item info
                for (var j = 0;j<item.use.effects.length;j++){
                    var A = Actions.getAction(item.use.effects[j].effectid);
                    var data = {
                        battle: this,
                        item: item,
                        ctd: clientTurnData,
                        actionData: item.use.effects[j],
                        turnData: tData,
                        character: this.activePokemon[i].character
                    }
                    clientTurnData = A(data);
                }
                //TODO remove item
            }
        }
        //then swap pokemon
        var pkmnToAdd = [];
        for (var i in this.activePokemon){
            var tData = this.turnData[this.activePokemon[i].id]
            if (tData.command == 'swap'){
                var pkmnToSwapWith = this.activePokemon[i].character.party[tData.index-1];
                pkmnToAdd.push(pkmnToSwapWith);
                //update active pokemon of the character
                for (var j = 0;j < this.activePokemon[i].character.activePokemon.length;j++){
                    this.activePokemon[i].character.activePokemon[j] = pkmnToSwapWith;
                }
                //update team pokemon
                for (var j = 0; j < this.team1Pokemon.length;j++){
                    if (this.team1Pokemon[j].id == i){
                        this.team1Pokemon[j] = pkmnToSwapWith;
                    }
                }
                for (var j = 0; j < this.team2Pokemon.length;j++){
                    if (this.team2Pokemon[j].id == i){
                        this.team2Pokemon[j] = pkmnToSwapWith;
                    }
                }
                //add client data
                clientTurnData.push({
                    action: 'swap',
                    idToSwap: i,
                    newPokemon: pkmnToSwapWith.getLessClientData()
                });
                delete this.activePokemon[i];
            }
        }
        //update battle active pokemon
        for (var i = 0; i < pkmnToAdd.length;i++){
            this.activePokemon[pkmnToAdd[i].id] = pkmnToAdd[i];
        }

        //then use moves!!
        //this.turnData[this.activePokemon[i].id] = {
        //        'command': 'fight',
        //        'moveIndex': mIndex,
        //        'pID': enemyTeam[index].id,
        //        'pIndex': index
        //    }
        //get each fight command
        //the order them correctly...
        this.mergeSort(fightOrder);
        console.log(fightOrder);
        //then execute the move action
        for (var i = 0; i < fightOrder.length;i++){
            var aAction = Attacks.getAttack(this.activePokemon[fightOrder[i].id].moves[this.turnData[fightOrder[i].id].moveIndex].attackid);
            aAction(this,this.activePokemon[fightOrder[i].id].moves[this.turnData[fightOrder[i].id].moveIndex],this.turnData[fightOrder[i].id]);
        }

        console.log("Client Turn Data:");
        console.log(clientTurnData);

        for (var i in this.players){
            this.gameEngine.queuePlayer(this.players[i],"executeTurn", {turnData: clientTurnData});
            this.readyForNextRound[this.players[i].id] = false;
        }
        this.roundActive = false;
        this.round += 1;
        this.roundTicker = 0;

        if (this.endAfterTurn){
            this.end = true;
        }
        this.turnData = {};
    }
}

Battle.prototype.sendChat = function(text){
    for (var i in this.players){
        this.gameEngine.queuePlayer(this.players[i],"battleChat", {text: text});
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
