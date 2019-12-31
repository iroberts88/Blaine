//----------------------------------------------------------------
//zone.js
//----------------------------------------------------------------

var Player = require('./player.js').Player,
    CENUMS = require('./enums.js').Enums, //init client enums
    AWS = require("aws-sdk");

var Zone = function(ge) {

    this.engine = ge;

    //map info
    this.mapid = null;
    this.map = {};
    this.sectorArray = null;

    this.players = {}; //players in this zone
    this.playerCount = 0;

    this.zoneData = null;
}

Zone.prototype.init = function (data) {
    //basically just initialize the map here
    this.mapid = data['mapid'];
    this.mapData = data['mapData'];
    this.sectorArray = data['sectorArray'];
    for (var i = 0; i < this.sectorArray.length;i++){
        this.map[this.sectorArray[i]] = new Sector(this.sectorArray[i],data.mapData[this.sectorArray[i]]);
    }
    this.getZoneData(data);
};

Zone.prototype.tick = function(deltaTime) {
}

Zone.prototype.getZoneData = function(data){
    //set the zone data object to hand to clients
    this.zoneData = {};
    this.zoneData[CENUMS.MAPID] = data['mapid'];
    this.zoneData[CENUMS.MAPNAME] = data['mapname'];
    this.zoneData[CENUMS.MAPDATA] = {};

    for (var i in this.map){
        this.zoneData[CENUMS.MAPDATA][this.map[i].id] = this.map[i].getClientData();
    }
}

Zone.prototype.getSectorXY = function(string){
    var x = '';
    var y = '';
    var coords = {};
    var onX = true;
    for (var i = 0; i < string.length;i++){
        if (string.charAt(i) == 'x'){
            onX = false;
            continue;
        }
        if (onX){
            x = x + string.charAt(i);
        }else{
            y = y + string.charAt(i);
        }
    }
    coords.x = parseInt(x);
    coords.y = parseInt(y);
    return coords;
};

// ----------------------------------------------------------
// Player Functions
// ----------------------------------------------------------

Zone.prototype.changeSector = function(p,arr,id,tile){
    //p = the player to change sector
    //arr = the coordinates of the sector change
    //id the id of the new sector
    if (arr[0] == 0 && arr[1] == 0){
        return;
    }
    var current = this.getSector(p.character.currentSector);
    if (current){
        current.removePlayer(p);
    }
    var newSector = this.getSector(id);
    if (newSector){
        newSector.addPlayer(p);
    }
    var newCoords = this.getSectorXY(id);
    var removeList = [];
    var addList = [];
    if (arr[0] == -1){
        for (var i = -1;i < 2;i++){
            addList.push(this.getSector((newCoords.x-1) + 'x' + (newCoords.y+i)));
            removeList.push(this.getSector((newCoords.x+2) + 'x' + (newCoords.y+i)));
        }
    }else if (arr[1] == -1){
        for (var i = -1;i < 2;i++){
            addList.push(this.getSector((newCoords.x+i) + 'x' + (newCoords.y-1)));
            removeList.push(this.getSector((newCoords.x+i) + 'x' + (newCoords.y+2)));
        }
    }else if (arr[0] == 1){
        for (var i = -1;i < 2;i++){
            addList.push(this.getSector((newCoords.x+1) + 'x' + (newCoords.y+i)));
            removeList.push(this.getSector((newCoords.x-2) + 'x' + (newCoords.y+i)));
        }
    }else if (arr[1] == 1){
        for (var i = -1;i < 2;i++){
            addList.push(this.getSector((newCoords.x+i) + 'x' + (newCoords.y+1)));
            removeList.push(this.getSector((newCoords.x+i) + 'x' + (newCoords.y-2)));
        }
    }
    for (var i = 0; i < addList.length;i++){
        try{
            if (addList[i] == null){continue;}
            for (var pl in addList[i].players){
                var player = addList[i].players[pl];
                this.engine.queuePlayer(player,CENUMS.ADDPC,p.character.getClientData(less));
                this.engine.queuePlayer(p,CENUMS.ADDPC,player.character.getClientData(less));
            }
        }catch(e){
            console.log(e);
        }
    }
    for (var i = 0; i < removeList.length;i++){
        try{
            if (removeList[i] == null){continue;}
            for (var pl in removeList[i].players){
                var player = removeList[i].players[pl];
                var cData = {}
                cData[CENUMS.ID] = p.character.id;
                this.engine.queuePlayer(player,CENUMS.REMOVEPC,cData);
                var cData = {}
                cData[CENUMS.ID] = player.character.id;
                this.engine.queuePlayer(p,CENUMS.REMOVEPC,cData);
            }
        }catch(e){
            console.log(e);
        }
    }
}

Zone.prototype.getSector = function(id){
    if (typeof this.map[id] != 'undefined'){
        return this.map[id];
    }else{
        return null;
    }
}
Zone.prototype.getPlayers = function(sector){
    var players = [];
    for (var i = -1;i < 2;i++){
        for (var j = -1;j < 2;j++){
            if (typeof this.map[(sector.sectorX+i) + 'x' + (sector.sectorY+j)] == 'undefined'){
                continue;
            }
            for (var pl in this.map[(sector.sectorX+i) + 'x' + (sector.sectorY+j)].players){
                var player = this.map[(sector.sectorX+i) + 'x' + (sector.sectorY+j)].players[pl];
                players.push(player.character.getClientData(true))
            }
        }
    }
    return players;
}
Zone.prototype.addPlayer = function(p){
    this.players[p.id] = p;
    //TODO add player to all players in the zone within 1 sector
    this.map[p.character.currentSector].addPlayer(p);
    this.playerCount += 1;
    var coords = this.getSectorXY(p.character.currentSector);
    for (var i = -1;i < 2;i++){
        for (var j = -1;j < 2;j++){
            if (typeof this.map[(coords.x+i) + 'x' + (coords.y+j)] == 'undefined'){
                continue;
            }
            for (var pl in this.map[(coords.x+i) + 'x' + (coords.y+j)].players){
                var player = this.map[(coords.x+i) + 'x' + (coords.y+j)].players[pl];
                if (player == p){continue;}
                this.engine.queuePlayer(player,CENUMS.ADDPC,p.character.getClientData(true));
            }
        }
    }
    return this.playerCount;
}

Zone.prototype.removePlayer = function(p){
    this.map[p.character.currentSector].removePlayer(p);
    //TODO remove player from all players in the zone within 1 sector
    for (var i = -1;i < 2;i++){
        for (var j = -1;j < 2;j++){
            var coords = this.getSectorXY(p.character.currentSector);
            if (typeof this.map[(coords.x+i) + 'x' + (coords.y+j)] == 'undefined'){
                continue;
            }
            for (var pl in this.map[(coords.x+i) + 'x' + (coords.y+j)].players){
                var player = this.map[(coords.x+i) + 'x' + (coords.y+j)].players[pl];
                var cData = {}
                cData[CENUMS.ID] = p.character.id;
                this.engine.queuePlayer(player,CENUMS.REMOVEPC,cData)
            }
        }
    }
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
    this.tiles = [];
    for (var i = 0; i < data['tiles'].length;i++){
        this.tiles[i] = [];
        for (var j = 0; j < data['tiles'][i].length;j++){
            var tile = new Tile(data['tiles'][i][j]);//this.tiles[i][j];
            this.tiles[i][j] = tile;
        }
    }
};

Sector.prototype.addPlayer = function(p){
    this.players[p.id] = p;
    this.playerCount += 1;
};

Sector.prototype.removePlayer = function(p){
    delete this.players[p.id];
    this.playerCount -= 1;
};

Sector.prototype.getClientData = function(){
    var data = {};
    data[CENUMS.X] = this.sectorX;
    data[CENUMS.Y] = this.sectorY;
    data[CENUMS.TILES] = [];

    for (var i = 0; i < this.tiles.length;i++){
        data[CENUMS.TILES][i] = [];
        for (var j = 0; j < this.tiles[i].length;j++){
            data[CENUMS.TILES][i].push(this.tiles[i][j].getClientData());
        }
    }
    return data;
}

//Sector
var Tile = function(data) {
    if (typeof data['triggers'] == 'undefined'){
        this.triggers = [];
    }else{
        this.triggers = data['triggers'];
    }
    if (typeof data['open'] == 'undefined'){
        this.open = false;
    }else{
        this.open = data['open'];
    }
    if (typeof data['resource'] == 'undefined'){
        this.resource = '0x0';
    }else{
        this.resource = data['resource'];
    }
    if (typeof data['overlayResource'] == 'undefined'){
        this.overlayResource = null;
    }else{
        this.overlayResource = data['overlayResource'];
    }
};

Tile.prototype.getClientData = function(){
    var data = {};
    data[CENUMS.RESOURCE] = this.resource;
    data[CENUMS.OVERLAYRESOURCE] = this.overlayResource;
    data[CENUMS.OPEN] = this.open;
    data[CENUMS.TRIGGERS] = this.triggers;
    return data;
}

exports.Tile = Tile;