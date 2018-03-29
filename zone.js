//----------------------------------------------------------------
//zone.js
//----------------------------------------------------------------

var Player = require('./player.js').Player,
    AWS = require("aws-sdk");

var Zone = function(ge) {

    this.gameEngine = ge;

    //map info
    this.mapid = null;
    this.map = {};
    this.sectorArray = null;

    this.players = {}; //players in this zone
    this.playerCount = 0;
}

Zone.prototype.init = function (data) {
    //basically just initialize the map here
    this.mapid = data.mapid;
    this.mapData = data.mapData;
    this.sectorArray = data.sectorArray;
    for (var i = 0; i < this.sectorArray.length;i++){
        this.map[this.sectorArray[i]] = new Sector(this.sectorArray[i],data.mapData[this.sectorArray[i]]);
    }
};

Zone.prototype.tick = function(deltaTime) {
}

// ----------------------------------------------------------
// Player Functions
// ----------------------------------------------------------
Zone.prototype.addPlayer = function(p){
    this.players[p.id] = p;
    //TODO add player to all players in the zone within 1 sector

    this.map[p.character.currentSector].addPlayer(p);
    this.playerCount += 1;
    return this.playerCount;
}

Zone.prototype.removePlayer = function(p){
    this.map[p.character.currentSector].removePlayer(p);
    //TODO remove player from all players in the zone within 1 sector
    delete this.players[p.id];
    this.playerCount -= 1;
    return this.playerCount;
}

// ----------------------------------------------------------
// Sector Functions
// ----------------------------------------------------------

exports.Zone = Zone;


//Sector
var Sector = function(id,data) {
    this.players = {}; //players in this zone
    this.playerCount = 0; //players in this sector
    this.id = id;
    var x = '';
    var y = '';
    var toX = true;
    for (var i = 0; i < id.length;i++){
        if (id.charAt(i) == 'x'){
            toX = false;
        }else if (toX){
            x += id.charAt(i);
        }else{
            y += id.charAt(i);
        }
    }
    this.sectorX = parseInt(x);
    this.sectorY = parseInt(y);
    this.tiles = data.tiles;
};

Sector.prototype.addPlayer = function(p){
    this.players[p.id] = p;
    this.playerCount += 1;
};

Sector.prototype.removePlayer = function(p){
    delete this.players[p.id];
    this.playerCount -= 1;
};

exports.Sector = Sector;