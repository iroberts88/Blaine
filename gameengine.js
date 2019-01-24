//----------------------------------------------------------------
//gameengine.js
//----------------------------------------------------------------

var Player = require('./player.js').Player,
    Zone = require('./zone.js').Zone,
    Attack = require('./attack.js').Attack,
    CENUMS = require('./enums.js').Enums, //init client enums
    utils = require('./utils.js').Utils,
    Utils = new utils(),
    fs = require('fs'),
    AWS = require("aws-sdk");

CENUMS.init();

var self = null;

var GameEngine = function() {
    this.users = {};
    this.gameTickInterval = 20;
    this.lastTime = Date.now();

    this.players = {};
    this.playerCount = 0;

    this.items = {};
    this.moveEffectiveness = {
        1: { //normal
            13: 0.5,
            14: 0,
            17: 0.5
        },
        2: { //fire
            2: 0.5,
            3: 0.5,
            5: 2,
            6: 2,
            12:2,
            13:0.5,
            15:0.5
        },
        3: { //water
            2:2,
            3:0.5,
            5:0.5,
            9:2,
            13:2,
            15:0.5
        },
        4: { //electric
            3:2,
            4:0.5,
            5:0.5,
            9:0,
            10:2,
            15:0.5
        },
        5: { //grass
            2:0.5,
            3:2,
            5:0.5,
            8:0.5,
            9:2,
            10:0.5,
            12:0.5,
            13:2,
            15:0.5,
            17:0.5
        },
        6: { //ice
            2:0.5,
            3:0.5,
            5:2,
            6:0.5,
            9:2,
            10:2,
            15:2,
            17:0.5
        },
        7: { //fighting
            1:2,
            6:2,
            8:0.5,
            10:0.5,
            11:0.5,
            12:0.5,
            13:2,
            14:0,
            16:2,
            17:2,
            18:0.5
        },
        8: { //poison
            5:2,
            8:0.5,
            9:0.5,
            13:0.5,
            14:0.5,
            17:0,
            18:2
        },
        9: { //ground
            2:2,
            4:2,
            5:0.5,
            8:2,
            9:0.5,
            10:0,
            12:0.5,
            13:2,
            17:0.5
        },
        10: { //flying
            4:0.5,
            5:2,
            7:2,
            12:2,
            13:0.5,
            17:2,
        },
        11: { //psychic
            7:2,
            8:2,
            11:0.5,
            16:0,
            17:0.5
        },
        12: { //bug
            2:0.5,
            5:2,
            7:0.5,
            8:0.5,
            10:0.5,
            11:2,
            14:0.5,
            16:2,
            17:0.5,
            18:0.5
        },
        13: { //rock
            2:2,
            6:2,
            7:0.5,
            9:0.5,
            10:2,
            12:2,
            17:0.5
        },
        14: { //ghost
            1:0,
            11:2,
            14:2,
            16:0.5
        },
        15: { //dragon
            15:2,
            15:0.5,
            18:0
        },
        16: { //dark
            7:0.5,
            11:2,
            14:2,
            16:0.5,
            18:0.5
        },
        17: { //steel
            2:0.5,
            3:0.5,
            4:0.5,
            6:2,
            13:2,
            17:0.5,
            18:2
        },
        18: { //fairy
            2:0.5,
            7:2,
            8:0.5,
            15:2,
            16:2,
            17:0.5
        },
    }
    //database objects
    this.mapids = [];
    this.mapCount = 0; //for checking if all maps have loaded before ready
    this.pokemon = {};
    this.attacks = {};

    this.zones = {};
    this.zoneUpdateList = {}; //a list of zones with active players

    this.activeBattles = {}; //active battles

    //variables for ID's
    this.idIterator = 0;
    this.possibleIDChars = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwyz";

    this.debugList = {}; //used avoid multiple debug chains in tick()
    this.ready = false;

    fs.truncate('debug.txt', 0, function(){console.log('debug.txt cleared')})
    this.debugWriteStream = fs.createWriteStream('debug.txt', {AutoClose: true});
    fs.truncate('log.txt', 0, function(){console.log('log.txt cleared')})
    this.logWriteStream = fs.createWriteStream('log.txt', {AutoClose: true});
}

GameEngine.prototype.init = function () {
    this.start();
};

GameEngine.prototype.start = function () {
    console.log('Starting Game Engine.');
    console.log('Ready. Waiting for players to connect...');
    self = this;
    setInterval(this.tick, this.gameTickInterval);
}



GameEngine.prototype.tick = function() {
    var now = Date.now();
    var deltaTime = (now-self.lastTime) / 1000.0;
    
    //update all zones with players
    for (var z in self.zoneUpdateList){
        var zone = self.zones[z];
        zone.tick(deltaTime);
    }
    //update all active battles
    for (var b in self.activeBattles){
        self.activeBattles[b].tick(deltaTime);
        if (self.activeBattles[b].end){
            //battle has ended
            self.activeBattles[b].cleanUp();
            delete self.activeBattles[b];
        }
    }
    //update debug list
    for (var k in self.debugList){
        self.debugList[k].t -= deltaTime;
        if (self.debugList[k].t <= -5.0){
            //debug hasnt been updated in 5 seconds
            //remove from debug list
            self.log('deleting debug with id ' + self.debugList[k].id);
            delete self.debugList[k];
        }
    }
    self.emit();
    self.clearQueue();
    self.lastTime = now;
}

GameEngine.prototype.getId = function() {
    var id = this.idIterator + 'x';
    for(var i=0; i<3; i++){
        id += this.possibleIDChars.charAt(Math.floor(Math.random() * this.possibleIDChars.length));
    }
    this.idIterator += 1;
    return id;
}

// ----------------------------------------------------------
// Database loading functions
// ----------------------------------------------------------

GameEngine.prototype.loadMaps = function(arr) {
    for (var i = 0; i < arr.length;i++){
        var d;
        fs.readFile('./mapTool/maps/' + arr[i], "utf8",function read(err, data) {
            if (err) {
                throw err;
            }
            var obj = JSON.parse(data);
            self.mapids.push(obj.mapid);

            var newZone = new Zone(self);
            newZone.init(obj);
            self.zones[newZone.mapid] = newZone;

            if (self.mapids.length == self.mapCount){
                self.ready = true;
            }
        });
    }
    console.log('loaded ' + arr.length + ' Maps from file');
}

GameEngine.prototype.loadItems = function(arr){
    for (var i = 0; i < arr.length;i++){
        self.items[arr[i].itemid] = arr[i];
    }
    console.log('loaded ' + arr.length + ' Items from file');
}

GameEngine.prototype.loadPokemon = function(arr) {
    for (var i = 0; i < arr.length;i++){
        self.pokemon[arr[i].number] = arr[i];
    }
    console.log('loaded ' + arr.length + ' Pokemon from file');
}

GameEngine.prototype.loadAttacks = function(arr) {
    for (var i = 0; i < arr.length;i++){
        var atk = new Attack();
        atk.init(arr[i])
        self.attacks[arr[i].attackid] = atk;
    }
    console.log('loaded ' + arr.length + ' Attacks from file');
}

//Player functions
GameEngine.prototype.addPlayer = function(p){
    this.players[p.id] = p;
    this.playerCount += 1;
}

GameEngine.prototype.removePlayer = function(p){
    this.playerLogout(p);
    this.removePlayerFromZone(p,p.character.currentMap);
    delete this.users[p.user.userData.username];
    delete this.players[p.id];
    this.playerCount -= 1;
}

GameEngine.prototype.addPlayerToZone = function(p,z){
    var count = this.zones[z].addPlayer(p);

    if (count == 1){
        //zone is no longer empty, ready to update
        this.zoneUpdateList[z] = true;
    }
}

GameEngine.prototype.removePlayerFromZone = function(p,z){
    var count = this.zones[z].removePlayer(p);

    if (count == 0){
        //zone is empty, no longer update
        delete this.zoneUpdateList[z]; 
    }
}

GameEngine.prototype.playerLogout = function(p){
    try{
        delete this.users[p.user.userData.username];
    }catch(e){
        console.log("error on player logout");
    }
    p.user.unlock();
    p.user.updateDB();
    p.user = null;
}

// ----------------------------------------------------------
// Socket Functions
// ----------------------------------------------------------

GameEngine.prototype.newConnection = function(socket) {
    if (self.ready){
        console.log('New Player Connected');
        console.log('Socket ID: ' + socket.id);
        //Initialize new player
        var p = new Player();
        p.setGameEngine(self);
        console.log('Player ID: ' + p.id);
        p.init({socket:socket});
        var cData = {};
        cData[CENUMS.ID] = p.id;
        self.queuePlayer(p,CENUMS.CONNINFO,cData);
        self.addPlayer(p);
    }
}

GameEngine.prototype.emit = function() {
    try{
        for(var i in this.players) {
            if (this.players[i].netQueue.length > 0){
                this.players[i].socket.emit(CENUMS.SERVERUPDATE, this.players[i].netQueue);
            }
        }
    }catch(e){
        try{
            console.log(this.players[i].netQueue);
        }catch(e){}
        console.log(e);
        console.log(i);
    }
}
GameEngine.prototype.clearQueue = function() {
    for(var i in this.players) {
        this.players[i].netQueue = [];
    }
}

//Queue data to all players
GameEngine.prototype.queueData = function(c, d) {
    var data = { call: c, data: d};
    for(var i in this.players) {
        this.players[i].netQueue.push(data);
    }
}
//Queue data to a specific player
GameEngine.prototype.queuePlayer = function(player, c, d) {
    var data = { call: c, data: d};
    player.netQueue.push(data);
}

//write to debug
GameEngine.prototype.debug = function(id,e,d) {
    if (Utils._udCheck(this.debugList[id])){
        //new debug error
        //add to debug list and send to client
        this.debugList[id] = {
            id: id,
            n: 1,
            t: 5.0
        }
        d.n = 1;
        console.log('debug.txt updated - ' + id);
        this.debugWriteStream.write(new Date().toJSON() + ' - ' + id + ' \n ' + e.stack + ' \n ' + JSON.stringify(d) + '\n\n');
    }else{
        this.debugList[id].n += 1;
        d.n = this.debugList[id].n
        if (this.debugList[id].t <= 0){
            console.log('debug.txt updated (duplicate error) - ' + id);
            this.debugWriteStream.write(new Date().toJSON() + ' - ' + id + ' \n ' + e.stack + ' \n ' + JSON.stringify(d) + '\n\n');
            this.debugList[id].t = 5.0;
        }
    }
}

//write to log
GameEngine.prototype.log = function(string) {
    if (typeof string == 'string'){
        this.logWriteStream.write(string + '\n');
    }else{
        try{
            this.logWriteStream.write(JSON.stringify(string));
        }catch(e){
            console.log('error writing log');
            console.log(e);
        }
    }
}

exports.GameEngine = GameEngine;