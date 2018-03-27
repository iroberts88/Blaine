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
    if (this.editInfo != null){
        var length = 0;
        for (var i in this.editInfo.mapData){
            length += 1;
        }
        if (length == this.editInfoL){
            this.mapTool.queuePlayer(this,"editMap", this.editInfo);
            this.editInfo = null;
        }
    }


    if (this.overwriteInfo != null){
        var length = 0;
        for (var i in this.overwriteInfo){
            length += 1;
        }
        if (length == this.overwriteInfoL){
            //all sectors deleted
            //push new sectors
            var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
            for (var i in this.overwriteInfo){
                var sec = {
                    'sectorid': this.overwriteInfoName + '_' + i,
                    'sectornumber': i,
                    'tiles': this.overwriteInfo[i].tiles
                }
                this.mapTool.maps[this.overwriteInfoName].mapData[i] = sec;
                var params = {
                    TableName: 'blaine_sectors',
                    Item: sec
                }
                docClient.put(params, function(err, data3) {
                    if (err) {
                        console.error("Unable to ADD NEW SECTOR****. Error JSON:", JSON.stringify(err, null, 2));
                    } else {
                        console.log("Create sector succeeded:", JSON.stringify(data3, null, 2));
                    }
                });
            }
            this.overwriteInfo = null;
        }
    }
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
                    Key:{mapid: d.name}
                }
                //DELETE ALL SECTORS FIRST?
                docClient.delete(params, function(err, data) {
                    if (err) {
                        console.error("Unable to delete map. Error JSON:", JSON.stringify(err, null, 2));
                    } else {
                        console.log("Delete map succeeded:", JSON.stringify(data, null, 2));
                        var sectorList = [];
                        for (var i in that.mapData){
                            sectorList.push(i);
                        }
                        var params2 = {
                            TableName: 'blaine_maps',
                            Item: {
                                'mapid': d.name,
                                'mapData': sectorList
                            }
                        }
                        docClient.put(params2, function(err, data2) {
                            if (err) {
                                console.error("Unable to re-create map*********. Error JSON:", JSON.stringify(err, null, 2));
                            } else {
                                console.log("Create map succeeded:", JSON.stringify(data2, null, 2));
                                for (var i = 0; i < that.mapTool.maps[d.name].sectorArray.length;i++){
                                    var params3 = {
                                        TableName: 'blaine_sectors',
                                        Key: {
                                            'sectorid': d.name + '_' + that.mapTool.maps[d.name].sectorArray[i],
                                        }
                                    }
                                    docClient.delete(params3, function(err, data3) {
                                        if (err) {
                                            console.error("Unable to delete sector********. Error JSON:", JSON.stringify(err, null, 2));
                                        } else {
                                            console.log("Delete Sector succeeded:", JSON.stringify(data3, null, 2));
                                        }
                                    });
                                }
                                that.overwriteInfo = that.mapData;
                                that.overwriteInfoName = d.name;
                                that.overwriteInfoL = sectorList.length;
                                that.mapTool.mapids.push(d.name);
                                that.mapTool.maps[d.name] = {
                                    'mapid': d.name,
                                    'sectorArray': sectorList,
                                    'mapData': {}
                                }
                                that.mapTool.queuePlayer(that,"mapSaved", {name:d.name});
                            }
                        });
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
                    for (var i = 0; i < that.mapTool.maps[d.name].sectorArray.length;i++){
                        var params3 = {
                            TableName: 'blaine_sectors',
                            Key: {
                                'sectorid': d.name + '_' + that.mapTool.maps[d.name].sectorArray[i],
                            }
                        }
                        docClient.delete(params3, function(err, data3) {
                            if (err) {
                                console.error("Unable to delete sector********. Error JSON:", JSON.stringify(err, null, 2));
                            } else {
                                console.log("Delete Sector succeeded:", JSON.stringify(data3, null, 2));
                            }
                        });
                    }
                }
                delete that.mapTool.maps[d.name];
                for (var i = 0; i < that.mapTool.mapids.length;i++){
                    if (d.name == that.mapTool.mapids[i]){
                        that.mapTool.mapids.splice(i,1);
                    }
                }
            });
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
                        var sectorList = [];
                        for (var i in d.mapData){
                            sectorList.push(i);
                        }
                        var params2 = {
                            TableName: 'blaine_maps',
                            Item: {
                                'mapid': d.name,
                                'mapData': sectorList
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
                                    'sectorArray': sectorList,
                                    'mapData': {}
                                }
                                for (var i in d.mapData){
                                    var sec = {
                                        'sectorid': d.name + '_' + i,
                                        'sectornumber': i,
                                        'tiles': d.mapData[i].tiles
                                    };
                                    that.mapTool.maps[d.name].mapData[i] = sec;
                                    var params3 = {
                                        TableName: 'blaine_sectors',
                                        Item: sec
                                    }
                                    docClient.put(params3, function(err, data3) {
                                        if (err) {
                                            console.error("Unable to create sector. Error JSON:", JSON.stringify(err, null, 2));
                                        } else {
                                            console.log("Create sector succeeded:", JSON.stringify(data3, null, 2));
                                        }
                                    });
                                }
                                that.mapTool.queuePlayer(that,"mapSaved", {name:d.name});
                            }
                        });
                    }else{
                        that.mapTool.queuePlayer(that,"confirmMapSave", {name:d.name});
                        that.mapData = d.mapData;
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
                        that.editInfo = {found: true,name: d.name,mapData: {}};
                        that.editInfoL = data.Item.mapData.length;
                        for (var i = 0; i < data.Item.mapData.length;i++){
                            var params2 = {
                                TableName: 'blaine_sectors',
                                Key: {
                                    sectorid: data.Item.mapid + '_' + data.Item.mapData[i]
                                }
                            }
                            docClient.get(params2, function(err, data2) {  
                                if (err) {
                                    console.error("Unable to find map. Error JSON:", JSON.stringify(err, null, 2));
                                }else{
                                    that.editInfo.mapData[data2.Item.sectornumber] = {tiles: data2.Item.tiles};
                                }
                            });
                        }
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
