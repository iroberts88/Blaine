//----------------------------------------------------------------
//gameengine.js
//----------------------------------------------------------------

var Player = require('./player.js').Player,
    Zone = require('./zone.js').Zone,
    fs = require('fs'),
    AWS = require("aws-sdk");

var self = null;

var GameEngine = function() {
    this.users = {};
    this.gameTickInterval = 20;
    this.lastTime = Date.now();

    this.players = {};
    this.playerCount = 0;

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
    //update debug list
    for (var k in self.debugList){
        self.debugList[k].t -= deltaTime;
        if (self.debugList[k].t <= -5.0){
            //debug hasnt been updated in 5 seconds
            //remove from debug list
            console.log('deleting debug with id ' + self.debugList[k].id);
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
        console.log(arr[i]);
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
    console.log('loaded ' + arr.length + ' Maps from db');
}

GameEngine.prototype.loadPokemon = function(arr) {
    for (var i = 0; i < arr.length;i++){
        self.pokemon[arr[i].number] = arr[i];
    }
    console.log('loaded ' + arr.length + ' Pokemon from db');
}

GameEngine.prototype.loadAttacks = function(arr) {
    for (var i = 0; i < arr.length;i++){
        self.attacks[arr[i].attackid] = arr[i];
    }
    console.log('loaded ' + arr.length + ' Attacks from db');
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
        self.queuePlayer(p,'connInfo', {id:p.id});
        self.addPlayer(p);
    }
}

GameEngine.prototype.emit = function() {
    try{
        for(var i in this.players) {
            if (this.players[i].netQueue.length > 0){
                this.players[i].socket.emit('serverUpdate', this.players[i].netQueue);
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

//Queue DEBUG data to a specific player
GameEngine.prototype.debug = function(player, d) {
    var data = { call: 'debug', data: d};
    if (typeof this.debugList[d.id] == 'undefined'){
        //new debug error
        //add to debug list and send to client
        this.debugList[d.id] = {
            id: d.id,
            n: 1,
            t: 1.0
        }
        data.data.n = 1;
        player.netQueue.push(data);
    }else{
        this.debugList[d.id].n += 1;
        data.data.n = this.debugList[d.id].n
        if (this.debugList[d.id].t <= 0){
            player.netQueue.push(data);
            this.debugList[d.id].t = 1.0;
        }
    }
}

exports.GameEngine = GameEngine;