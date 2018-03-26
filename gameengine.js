//----------------------------------------------------------------
//gameengine.js
//----------------------------------------------------------------

var Player = require('./player.js').Player,
    AWS = require("aws-sdk");

var self = null;

var GameEngine = function() {
    this.users = {};
    this.gameTickInterval = 20;
    this.lastTime = Date.now();

    this.players = {};
    this.playerCount = 0;

    //database objects
    this.maps = {};
    this.mapids = [];
   
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
        this.maps[arr[i].mapid] = arr[i];
        this.mapids.push(arr[i].mapid);
    }
    console.log('loaded ' + arr.length + ' Maps from db');
    this.ready = true;
}

//Player functions

GameEngine.prototype.addPlayer = function(p){
    this.players[p.id] = p;
    this.playerCount += 1;
}

GameEngine.prototype.removePlayer = function(p){
    this.playerLogout(p);
    delete this.players[p.id];
    this.playerCount -= 1;
}

GameEngine.prototype.playerLogout = function(p){
    //do logout stuff here if needed
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
        p.id = self.getId();
        p.setGameEngine(self);
        console.log('Player ID: ' + p.id);
        p.init({socket:socket});
        //send down map info fo intro screen?
        //only send down the correct amount of tiles
        var sectorXStart = -1;
        var tileXStart = 7
        var sectorX = -1;
        var sectorY = -4;
        var tileX = 7;
        var tileY = 18;
        var bgMap = [];
        for (var i = 0;i < 28;i++){
            var arr = []
            if (tileY > 20){
                tileY = 0;
                sectorY +=1;
            }
            for (var j = 0; j < 49;j++){
                if (tileX > 20){
                    tileX = 0;
                    sectorX +=1;
                }
                arr.push({
                    tex: self.maps['pallet'].mapData[sectorX + 'x' + sectorY].tiles[tileX][tileY].resource,
                    oTex: self.maps['pallet'].mapData[sectorX + 'x' + sectorY].tiles[tileX][tileY].overlayResource
                });
                tileX += 1;
            }
            bgMap.push(arr);
            tileY += 1;
            tileX = tileXStart;
            sectorX = sectorXStart;
        }
        self.queuePlayer(p,'connInfo', {bgMap: bgMap});
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

//Queue data to all players in the session
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