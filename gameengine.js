//----------------------------------------------------------------
//gameengine.js
//----------------------------------------------------------------

var Player = require('./player.js').Player,
    Zone = require('./zone.js').Zone,
    Attack = require('./attack.js').Attack,
    CENUMS = require('./enums.js').Enums,
    utils = require('./utils.js').Utils,
    Utils = new utils(),
    fs = require('fs'),
    AWS = require("aws-sdk");

var self = null;

var GameEngine = function() {
    this.users = {};
    this.gameTickInterval = 20;
    this.lastTime = Date.now();

    this.players = {};
    this.playerCount = 0;

    this.items = {};
    this.moveEffectiveness = {};
    this.moveEffectiveness[CENUMS.TYPE_NORMAL] = {};
    this.moveEffectiveness[CENUMS.TYPE_NORMAL][CENUMS.TYPE_ROCK] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_NORMAL][CENUMS.TYPE_STEEL] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_NORMAL][CENUMS.TYPE_GHOST] = 0;
    this.moveEffectiveness[CENUMS.TYPE_FIRE] = {};
    this.moveEffectiveness[CENUMS.TYPE_FIRE][CENUMS.TYPE_ROCK] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_FIRE][CENUMS.TYPE_STEEL] = 2;
    this.moveEffectiveness[CENUMS.TYPE_FIRE][CENUMS.TYPE_BUG] = 2;
    this.moveEffectiveness[CENUMS.TYPE_FIRE][CENUMS.TYPE_FIRE] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_FIRE][CENUMS.TYPE_WATER] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_FIRE][CENUMS.TYPE_GRASS] = 2;
    this.moveEffectiveness[CENUMS.TYPE_FIRE][CENUMS.TYPE_ICE] = 2;
    this.moveEffectiveness[CENUMS.TYPE_FIRE][CENUMS.TYPE_DRAGON] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_WATER] = {};
    this.moveEffectiveness[CENUMS.TYPE_WATER][CENUMS.TYPE_ROCK] = 2;
    this.moveEffectiveness[CENUMS.TYPE_WATER][CENUMS.TYPE_GROUND] = 2;
    this.moveEffectiveness[CENUMS.TYPE_WATER][CENUMS.TYPE_FIRE] = 2;
    this.moveEffectiveness[CENUMS.TYPE_WATER][CENUMS.TYPE_WATER] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_WATER][CENUMS.TYPE_GRASS] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_WATER][CENUMS.TYPE_DRAGON] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_GRASS] = {};
    this.moveEffectiveness[CENUMS.TYPE_GRASS][CENUMS.TYPE_FLYING] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_GRASS][CENUMS.TYPE_POISON] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_GRASS][CENUMS.TYPE_BUG] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_GRASS][CENUMS.TYPE_STEEL] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_GRASS][CENUMS.TYPE_FIRE] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_GRASS][CENUMS.TYPE_GRASS] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_GRASS][CENUMS.TYPE_DRAGON] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_GRASS][CENUMS.TYPE_GROUND] = 2;
    this.moveEffectiveness[CENUMS.TYPE_GRASS][CENUMS.TYPE_ROCK] = 2;
    this.moveEffectiveness[CENUMS.TYPE_GRASS][CENUMS.TYPE_WATER] = 2;
    this.moveEffectiveness[CENUMS.TYPE_ELECTRIC] = {};
    this.moveEffectiveness[CENUMS.TYPE_ELECTRIC][CENUMS.TYPE_WATER] = 2;
    this.moveEffectiveness[CENUMS.TYPE_ELECTRIC][CENUMS.TYPE_FLYING] = 2;
    this.moveEffectiveness[CENUMS.TYPE_ELECTRIC][CENUMS.TYPE_GROUND] = 0;
    this.moveEffectiveness[CENUMS.TYPE_ELECTRIC][CENUMS.TYPE_GRASS] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_ELECTRIC][CENUMS.TYPE_ELECTRIC] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_ELECTRIC][CENUMS.TYPE_DRAGON] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_ROCK] = {};
    this.moveEffectiveness[CENUMS.TYPE_ROCK][CENUMS.TYPE_FLYING] = 2;
    this.moveEffectiveness[CENUMS.TYPE_ROCK][CENUMS.TYPE_BUG] = 2;
    this.moveEffectiveness[CENUMS.TYPE_ROCK][CENUMS.TYPE_FIRE] = 2;
    this.moveEffectiveness[CENUMS.TYPE_ROCK][CENUMS.TYPE_ICE] = 2;
    this.moveEffectiveness[CENUMS.TYPE_ROCK][CENUMS.TYPE_FIGHTING] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_ROCK][CENUMS.TYPE_GROUND] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_ROCK][CENUMS.TYPE_STEEL] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_GROUND] = {};
    this.moveEffectiveness[CENUMS.TYPE_GROUND][CENUMS.TYPE_POISON] = 2;
    this.moveEffectiveness[CENUMS.TYPE_GROUND][CENUMS.TYPE_ROCK] = 2;
    this.moveEffectiveness[CENUMS.TYPE_GROUND][CENUMS.TYPE_STEEL] = 2;
    this.moveEffectiveness[CENUMS.TYPE_GROUND][CENUMS.TYPE_FIRE] = 2;
    this.moveEffectiveness[CENUMS.TYPE_GROUND][CENUMS.TYPE_ELECTRIC] = 2;
    this.moveEffectiveness[CENUMS.TYPE_GROUND][CENUMS.TYPE_FLYING] = 0;
    this.moveEffectiveness[CENUMS.TYPE_GROUND][CENUMS.TYPE_BUG] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_GROUND][CENUMS.TYPE_GASS] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_POISON] = {};
    this.moveEffectiveness[CENUMS.TYPE_POISON][CENUMS.TYPE_GRASS] = 2;
    this.moveEffectiveness[CENUMS.TYPE_POISON][CENUMS.TYPE_FAIRY] = 2;
    this.moveEffectiveness[CENUMS.TYPE_POISON][CENUMS.TYPE_STEEL] = 0;
    this.moveEffectiveness[CENUMS.TYPE_POISON][CENUMS.TYPE_POISON] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_POISON][CENUMS.TYPE_GROUND] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_POISON][CENUMS.TYPE_ROCK] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_POISON][CENUMS.TYPE_GHOST] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_FLYING] = {};
    this.moveEffectiveness[CENUMS.TYPE_FLYING][CENUMS.TYPE_FIGHTING] = 2;
    this.moveEffectiveness[CENUMS.TYPE_FLYING][CENUMS.TYPE_BUG] = 2;
    this.moveEffectiveness[CENUMS.TYPE_FLYING][CENUMS.TYPE_GRASS] = 2;
    this.moveEffectiveness[CENUMS.TYPE_FLYING][CENUMS.TYPE_ROCK] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_FLYING][CENUMS.TYPE_STEEL] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_FLYING][CENUMS.TYPE_ELECTRIC] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_PSYCHIC] = {};
    this.moveEffectiveness[CENUMS.TYPE_PSYCHIC][CENUMS.TYPE_FIGHTING] = 2;
    this.moveEffectiveness[CENUMS.TYPE_PSYCHIC][CENUMS.TYPE_POISON] = 2;
    this.moveEffectiveness[CENUMS.TYPE_PSYCHIC][CENUMS.TYPE_DARK] = 0;
    this.moveEffectiveness[CENUMS.TYPE_PSYCHIC][CENUMS.TYPE_STEEL] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_PSYCHIC][CENUMS.TYPE_PSYCHIC] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_GHOST] = {};
    this.moveEffectiveness[CENUMS.TYPE_GHOST][CENUMS.TYPE_GHOST] = 2;
    this.moveEffectiveness[CENUMS.TYPE_GHOST][CENUMS.TYPE_PSYCHIC] = 2;
    this.moveEffectiveness[CENUMS.TYPE_GHOST][CENUMS.TYPE_DARK] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_GHOST][CENUMS.TYPE_NORMAL] = 0;
    this.moveEffectiveness[CENUMS.TYPE_FIGHTING] = {};
    this.moveEffectiveness[CENUMS.TYPE_FIGHTING][CENUMS.TYPE_NORMAL] = 2;
    this.moveEffectiveness[CENUMS.TYPE_FIGHTING][CENUMS.TYPE_ROCK] = 2;
    this.moveEffectiveness[CENUMS.TYPE_FIGHTING][CENUMS.TYPE_STEEL] = 2;
    this.moveEffectiveness[CENUMS.TYPE_FIGHTING][CENUMS.TYPE_ICE] = 2;
    this.moveEffectiveness[CENUMS.TYPE_FIGHTING][CENUMS.TYPE_DARK] = 2;
    this.moveEffectiveness[CENUMS.TYPE_FIGHTING][CENUMS.TYPE_GHOST] = 0;
    this.moveEffectiveness[CENUMS.TYPE_FIGHTING][CENUMS.TYPE_FLYING] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_FIGHTING][CENUMS.TYPE_POISON] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_FIGHTING][CENUMS.TYPE_BUG] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_FIGHTING][CENUMS.TYPE_PSYCHIC] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_FIGHTING][CENUMS.TYPE_FAIRY] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_ICE] = {};
    this.moveEffectiveness[CENUMS.TYPE_ICE][CENUMS.TYPE_FLYING] = 2;
    this.moveEffectiveness[CENUMS.TYPE_ICE][CENUMS.TYPE_GROUND] = 2;
    this.moveEffectiveness[CENUMS.TYPE_ICE][CENUMS.TYPE_GRASS] = 2;
    this.moveEffectiveness[CENUMS.TYPE_ICE][CENUMS.TYPE_DRAGON] = 2;
    this.moveEffectiveness[CENUMS.TYPE_ICE][CENUMS.TYPE_STEEL] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_ICE][CENUMS.TYPE_FIRE] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_ICE][CENUMS.TYPE_WATER] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_ICE][CENUMS.TYPE_ICE] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_BUG] = {};
    this.moveEffectiveness[CENUMS.TYPE_BUG][CENUMS.TYPE_GRASS] = 2;
    this.moveEffectiveness[CENUMS.TYPE_BUG][CENUMS.TYPE_PSYCHIC] = 2;
    this.moveEffectiveness[CENUMS.TYPE_BUG][CENUMS.TYPE_DARK] = 2;
    this.moveEffectiveness[CENUMS.TYPE_BUG][CENUMS.TYPE_FIGHTING] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_BUG][CENUMS.TYPE_FLYING] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_BUG][CENUMS.TYPE_GHOST] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_BUG][CENUMS.TYPE_STEEL] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_BUG][CENUMS.TYPE_POISON] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_BUG][CENUMS.TYPE_FIRE] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_BUG][CENUMS.TYPE_FAIRY] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_STEEL] = {};
    this.moveEffectiveness[CENUMS.TYPE_STEEL][CENUMS.TYPE_ROCK] = 2;
    this.moveEffectiveness[CENUMS.TYPE_STEEL][CENUMS.TYPE_ICE] = 2;
    this.moveEffectiveness[CENUMS.TYPE_STEEL][CENUMS.TYPE_FAIRY] = 2;
    this.moveEffectiveness[CENUMS.TYPE_STEEL][CENUMS.TYPE_STEEL] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_STEEL][CENUMS.TYPE_FIRE] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_STEEL][CENUMS.TYPE_WATER] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_STEEL][CENUMS.TYPE_ELECTRIC] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_DARK] = {};
    this.moveEffectiveness[CENUMS.TYPE_DARK][CENUMS.TYPE_GHOST] = 2;
    this.moveEffectiveness[CENUMS.TYPE_DARK][CENUMS.TYPE_PSYCHIC] = 2;
    this.moveEffectiveness[CENUMS.TYPE_DARK][CENUMS.TYPE_FIGHTING] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_DARK][CENUMS.TYPE_DARK] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_DARK][CENUMS.TYPE_FAITY] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_DRAGON] = {};
    this.moveEffectiveness[CENUMS.TYPE_DRAGON][CENUMS.TYPE_DRAGON] = 2;
    this.moveEffectiveness[CENUMS.TYPE_DRAGON][CENUMS.TYPE_STEEL] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_DRAGON][CENUMS.TYPE_FAIRY] = 0;
    this.moveEffectiveness[CENUMS.TYPE_FAIRY] = {};
    this.moveEffectiveness[CENUMS.TYPE_FAIRY][CENUMS.TYPE_FIGHTING] = 2;
    this.moveEffectiveness[CENUMS.TYPE_FAIRY][CENUMS.TYPE_DRAGON] = 2;
    this.moveEffectiveness[CENUMS.TYPE_FAIRY][CENUMS.TYPE_DARK] = 2;
    this.moveEffectiveness[CENUMS.TYPE_FAIRY][CENUMS.TYPE_POISON] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_FAIRY][CENUMS.TYPE_STEEL] = 0.5;
    this.moveEffectiveness[CENUMS.TYPE_FAIRY][CENUMS.TYPE_FIRE] = 0.5;
 
    //database objects
    this.mapids = [];
    this.mapCount = 0; //for checking if all maps have loaded before ready
    this.pokemon = {};
    this.attacks = {};

    this.zones = {};
    this.zoneUpdateList = {}; //a list of zones with active players

    this.inactiveBattles = {};
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

GameEngine.prototype.battleReady = function(battle) {
    if (typeof this.inactiveBattles[battle.id] == 'undefined'){
        console.log('Battle does not exist or is already ready');
    }else{
        this.activeBattles[battle.id] = battle;
        delete this.inactiveBattles[battle.id];
    }
}

GameEngine.prototype.battleEnd = function(battle) {
    if (typeof this.activeBattles[battle.id] == 'undefined'){
        console.log('Battle does not exist or is not active');
    }else{
        this.inactiveBattles[battle.id] = battle;
        delete this.activeBattles[battle.id];
    }
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
        atk.init(arr[i]);
        atk.attackid = self.getId();
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