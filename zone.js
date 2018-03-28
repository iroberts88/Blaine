//----------------------------------------------------------------
//zone.js
//----------------------------------------------------------------

var Player = require('./player.js').Player,
    AWS = require("aws-sdk");

var Zone = function() {

    //list of players in this zone
    this.players = {};
    this.playerCount = 0;

    //this zone's map
    this.map = null;
   
    //variables for ID's
    this.debugList = {}; //used avoid multiple debug chains in tick()
}

Zone.prototype.init = function (data) {
    //basically just initialize the map here
};

Zone.prototype.tick = function(deltaTime) {

    //update debug list
    for (var k in this.debugList){
        this.debugList[k].t -= deltaTime;
        if (this.debugList[k].t <= -5.0){
            //debug hasnt been updated in 5 seconds
            //remove from debug list
            console.log('deleting debug with id ' + this.debugList[k].id);
            delete this.debugList[k];
        }
    }
    this.emit();
    this.clearQueue();
    this.lastTime = now;
}

//Player functions

Zone.prototype.addPlayer = function(p){
    this.players[p.id] = p;
    this.playerCount += 1;
    return this.playerCount;
}

Zone.prototype.removePlayer = function(p){
    this.playerLogout(p);
    delete this.users[p.user.userData.username];
    delete this.players[p.id];
    this.playerCount -= 1;
    return this.playerCount;
}

// ----------------------------------------------------------
// Socket Functions
// ----------------------------------------------------------

Zone.prototype.emit = function() {
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
Zone.prototype.clearQueue = function() {
    for(var i in this.players) {
        this.players[i].netQueue = [];
    }
}

//Queue data to all players in the session
Zone.prototype.queueData = function(c, d) {
    var data = { call: c, data: d};
    for(var i in this.players) {
        this.players[i].netQueue.push(data);
    }
}
//Queue data to a specific player
Zone.prototype.queuePlayer = function(player, c, d) {
    var data = { call: c, data: d};
    player.netQueue.push(data);
}

//Queue DEBUG data to a specific player
Zone.prototype.debug = function(player, d) {
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

exports.Zone = Zone;