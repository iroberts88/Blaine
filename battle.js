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
    this.spectators = {} //players watching this battle??
}

Battle.prototype.init = function (data) {
    //initialize based on battle type

    //type defaults to 1v1
    this.type = (typeof data.type == 'undefined') ? '1v1' : data.type;
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
        }else{
            console.log("Teams must consist of Characters or Trainers");
            return false;
        }
    }
    //Battle successfully initialized
    return true;
};

Battle.prototype.addSpectator = function(p){

};

exports.Battle = Battle;
