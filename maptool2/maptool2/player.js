//----------------------------------------------------------------
//player.js
//----------------------------------------------------------------
var fs = require('fs');

var Player = function(){
    this.mapTool = null;
    this.mapData = null;

    this.editInfoL = null;
    this.editInfo = null;

    this.overwriteInfo = null;
    this.overwriteInfoName = null;
    this.overwriteInfoL = null;
};

Player.prototype.init = function (data) {
    //init player specific variables
   
    this.netQueue = [];

    if (typeof data.socket != 'undefined'){
        this.socket = data.socket;
        this.setupSocket();
    }

};
    
Player.prototype.tick = function(deltaTime){
};

Player.prototype.onDisconnect = function(callback) {
    this.onDisconnectHandler = callback;
};

Player.prototype.setMapTool = function(ge){
    this.mapTool = ge;
};


Player.prototype.setupSocket = function() {

    // On playerUpdate event
    var that = this;

    this.socket.on('confirmMapSave', function (d) {
        try{
            if (d.c){
                var sectorList = [];
                for (var i in that.mapData.mapData){
                    sectorList.push(i);
                }
                that.mapTool.maps[that.mapData.name] = {
                    'mapid': that.mapData.name,
                    'sectorArray': sectorList,
                    'mapData': that.mapData.mapData
                }
                fs.writeFile('./maps/' + that.mapData.name + '.json',JSON.stringify(that.mapTool.maps[that.mapData.name], null, 2), function(err){
                    if (err){
                        return console.log(err);
                    }
                });
                that.mapTool.queuePlayer(that,"mapSaved", {name:that.mapData.name});
            }else{
                that.mapData = null;
            }
        }catch(e){
            that.mapTool.debug(that, {'id': 'confirmMapSaveError', 'error': e.stack, cMapData: d});
        }
    });

    this.socket.on('deleteMap', function (d) {
        console.log(d);
        try{
            if (typeof that.mapTool.maps[d.name] == 'undefined'){
                that.mapTool.debug(that, {'id': 'deleteMapError', 'error': "no map found"});
            }else{
                console.log('deleting map ' + d.name);
                fs.unlink('./maps/' + d.name + '.json',function(err){
                    if(err) return console.log(err);
                    console.log('file deleted successfully');
                });
                delete that.mapTool.maps[d.name];
                for (var i = 0; i < that.mapTool.mapids.length;i++){
                    if (d.name == that.mapTool.mapids[i]){
                        that.mapTool.mapids.splice(i,1);
                    }
                }
            }
            
        }catch(e){
            that.mapTool.debug(that, {'id': 'createMapError', 'error': e.stack, dMapData: d});
        }
    });

    this.socket.on('createMap', function (d) {
        console.log(d);
        try{
            if (typeof that.mapTool.maps[d.name] == 'undefined'){
                //Create new map
                var sectorList = [];
                for (var i in d.mapData){
                    sectorList.push(i);
                }
                that.mapTool.mapids.push(d.name);
                that.mapTool.maps[d.name] = {
                    'mapid': d.name,
                    'sectorArray': sectorList,
                    'mapData': d.mapData
                }
                fs.writeFile('./maps/' + d.name + '.json',JSON.stringify(that.mapTool.maps[d.name], null, 2), function(err){
                    if (err){
                        return console.log(err);
                    }
                });
            }else{
                that.mapTool.queuePlayer(that,"confirmMapSave", {name:d.name});
                that.mapData = d;
            }
            
        }catch(e){
            that.mapTool.debug(that, {'id': 'createMapError', 'error': e.stack, dMapData: d});
        }
    });

    this.socket.on('editMap', function (d) {
        console.log(d);
        try{
            if (typeof that.mapTool.maps[d.name] != 'undefined'){
                that.mapTool.maps[d.name].found = true;
                that.mapTool.queuePlayer(that,"editMap", that.mapTool.maps[d.name]);
            }else{
                console.log('No map named ' + d.name);
                that.mapTool.queuePlayer(that,"editMap", {found: false});
            }
        }catch(e){
            that.mapTool.debug(that, {'id': 'createMapError', 'error': e.stack, dMapData: d});
        }
    });

    this.socket.on('disconnect', function () {
        try{
            console.log('Player has disconnected.');
            // If callback exists, call it
            if(that.onDisconnectHandler != null && typeof that.onDisconnectHandler == 'function' ) {
                that.onDisconnectHandler();
            }
        }catch(e){
            console.log('error on disconnect ( will error out on guest or user = null)');
        }
    });
};

exports.Player = Player;
