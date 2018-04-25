//----------------------------------------------------------------
// battle.js
//----------------------------------------------------------------

var Player = require('./player.js').Player,
    Character = require('./character.js').Character,
    Trainer = require('./trainer.js').Trainer,
    AWS = require("aws-sdk");

var Battle = function(ge) {
    this.gameEngine = ge;
    this.id = ge.getId();
    this.ActivePkmn = {
        '1v1': 1,
        '2v2': 2,
        'team2v2': 1,
        '3v3': 3,
        'team3v3': 1,
        '4v4': 4,
        'team4v4': 1
    };
    this.TeamLengths = { //numbers of active pokemon per player
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

    this.turn = 1;
    this.team1 = [];
    this.team2 = [];
    this.players = {}; //keep track of players the receive the data of each round

    this.roundTime = 30.0; //round time in seconds
    this.roundActive = false;
    this.roundTicker = 0;

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
        if ((data.team1[i] instanceof Character || data.team1[i] instanceof Trainer) && (data.team2[i] instanceof Character || data.team2[i] instanceof Trainer)){
            data.team1[i].initBattle(this.TeamLengths[data.type]);
            data.team2[i].initBattle(this.TeamLengths[data.type]);
            this.team1.push(data.team1[i]);
            this.team2.push(data.team2[i]);
            if (data.team1[i] instanceof Character){
                this.players[data.team1[i].owner.id] = data.team1[i].owner;
            }
            if (data.team2[i] instanceof Character){
                this.players[data.team2[i].owner.id] = data.team2[i].owner;
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
    }
};

Battle.prototype.addSpectator = function(p){

};

Battle.prototype.removeSpectator = function(p){

};

exports.Battle = Battle;
