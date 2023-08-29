//----------------------------------------------------------------
//maptool.js
//----------------------------------------------------------------

var AWS = require("aws-sdk");
var Player = require("./player.js").Player;
var fs = require('fs');

var self = null;

var MapTool = function() {
    this.lastTime = Date.now();

    this.players = {};

    //database objects
    this.maps = {};
    this.mapids = [];

    //variables for ID's
    this.idIterator = 0;
    this.possibleIDChars = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwyz";
}

MapTool.prototype.init = function () {
    this.start();
};

MapTool.prototype.start = function () {
    console.log('Starting Game Engine.');
    console.log('Ready. Waiting for players to connect...');
    self = this;
    setInterval(this.tick, this.gameTickInterval);
}



MapTool.prototype.tick = function() {
    var now = Date.now();
    var deltaTime = (now-self.lastTime) / 1000.0;
    

    for (var i in self.players){
        self.players[i].tick(deltaTime);
    }
    
    self.emit();
    self.clearQueue();
    self.lastTime = now;
}

MapTool.prototype.getId = function() {
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

MapTool.prototype.loadMaps = function(arr) {
    for (var i = 0; i < arr.length;i++){
        var d;
        fs.readFile('./maps/' + arr[i], "utf8",function read(err, data) {
            if (err) {
                throw err;
            }
            var obj = JSON.parse(data);
            console.log(obj.mapid)
            self.maps[obj.mapid] = obj;
            self.mapids.push(obj.mapid);
        });
    }
    console.log('loaded ' + arr.length + ' Maps from db');
}

// ----------------------------------------------------------
// Socket Functions
// ----------------------------------------------------------

MapTool.prototype.newConnection = function(socket) {
    console.log('New Player Connected');
    console.log('Socket ID: ' + socket.id);
    //Initialize new player
    var p = new Player();
    p.id = self.getId();
    p.setMapTool(self);
    console.log('Player ID: ' + p.id);
    p.init({socket:socket});
    self.queuePlayer(p,'connInfo', {mapNames: self.maps,id:p.id});
    self.players[p.id] = p;
}

MapTool.prototype.emit = function() {
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
MapTool.prototype.clearQueue = function() {
    for(var i in this.players) {
        this.players[i].netQueue = [];
    }
}

//Queue data to all players in the session
MapTool.prototype.queueData = function(c, d) {
    var data = { call: c, data: d};
    for(var i in this.players) {
        this.players[i].netQueue.push(data);
    }
}
//Queue data to a specific player
MapTool.prototype.queuePlayer = function(player, c, d) {
    var data = { call: c, data: d};
    player.netQueue.push(data);
}

//Queue DEBUG data to a specific player
MapTool.prototype.debug = function(player, d) {
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

exports.MapTool = MapTool;