//----------------------------------------------------------------
//player.js
//----------------------------------------------------------------

var AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

var Player = function(){
    this.mapTool = null;
    this.mapData = null;
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
                var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                var params = {
                    TableName: 'blaine_maps',
                    Key:{mapid: that.mapData.name},
                    UpdateExpression: "set mapData = :m",
                    ExpressionAttributeValues: {
                        ':m': that.mapData.mapData
                    }
                }
                docClient.update(params, function(err, data) {
                    if (err) {
                        console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                    } else {
                        console.log("Map saved:", JSON.stringify(data, null, 2));
                    }
                });
            }else{
                that.mapData = null;
            }
        }catch(e){
            that.mapTool.debug(that, {'id': 'confirmMapSaveError', 'error': e.stack, cMapData: d});
        }
    });

    this.socket.on('deleteMap', function (d) {
        try{
            var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
            var params = {
                TableName: 'blaine_maps',
                Key:{mapid: d.name}
            }
            docClient.delete(params, function(err, data) {
                if (err) {
                    console.error("Unable to delete map. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("Delete map succeeded:", JSON.stringify(data, null, 2));
                }
            });
            delete that.mapTool.maps[d.name];
            for (var i = 0; i < that.mapTool.mapids.length;i++){
                if (d.name == that.mapTool.mapids[i]){
                    that.mapTool.mapids.splice(i,1);
                }
            }
        }catch(e){
            that.mapTool.debug(that, {'id': 'deleteMapError', 'error': e.stack, dMapData: d});
        }
    });

    this.socket.on('createMap', function (d) {
        console.log(d);
        try{
            var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
            var params = {
                TableName: 'blaine_maps',
                Key: {
                    mapid: d.name
                }
            }
            docClient.get(params, function(err, data) {
                if (err) {
                    console.error("Unable to check for map. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    if (typeof data.Item == 'undefined'){
                        var params2 = {
                            TableName: 'blaine_maps',
                            Item: {
                                'mapid': d.name,
                                'mapData': d.mapData
                            }
                        }
                        docClient.put(params2, function(err, data2) {
                            if (err) {
                                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                            } else {
                                console.log("Create map succeeded:", JSON.stringify(data2, null, 2));
                                that.mapTool.mapids.push(d.name);
                                that.mapTool.maps[d.name] = {
                                    'mapid': d.name,
                                    'mapData': d.mapData
                                }
                                that.mapTool.queuePlayer(that,"mapSaved", {name:d.name});
                            }
                        });
                    }else{
                        that.mapTool.queuePlayer(that,"confirmMapSave", {name:d.name});
                        that.mapData = d;
                    }
                }
            });
            
        }catch(e){
            that.mapTool.debug(that, {'id': 'createMapError', 'error': e.stack, dMapData: d});
        }
    });

    this.socket.on('editMap', function (d) {
        console.log(d);
        try{
            var docClient = new AWS.DynamoDB.DocumentClient();
            var params = {
                TableName: 'blaine_maps',
                Key: {
                    mapid: d.name
                }
            }
            docClient.get(params, function(err, data) {
                if (err) {
                    console.error("Unable to find map. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    if (typeof data.Item != 'undefined'){
                        that.mapTool.queuePlayer(that,"editMap", {found:true,name:data.Item.mapid,mapData:data.Item.mapData});
                    }else{
                        console.log('No map named ' + d.name);
                        that.mapTool.queuePlayer(that,"editMap", {found: false});
                    }
                }
            });
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
