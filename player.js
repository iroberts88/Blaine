//----------------------------------------------------------------
//player.js
//----------------------------------------------------------------
var User = require('./user.js').User,
    Character = require('./character.js').Character,
    Zone = require('./zone.js').Zone;

const crypto = require('crypto');

var AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

var Player = function(){
    this.gameEngine = null;
    this.user = null;
    this.id = null;
    this.ready = null;
    this.character = null;
};

Player.prototype.init = function (data) {
    //init player specific variables
   
    this.netQueue = [];

    if (typeof data.socket != 'undefined'){
        this.socket = data.socket;
        this.setupSocket();
    }
    this.ready = false;
};

Player.prototype.startGame = function(char){
    this.character = char;

    //add character to zone
    this.gameEngine.addPlayerToZone(this,this.character.currentMap);
    //send down data to start new game
    var zone = this.gameEngine.zones[this.character.currentMap];
    var sector = zone.map[this.character.currentSector];
    var players = zone.getPlayers(sector);

    this.gameEngine.queuePlayer(this,'startGame',{
        map: this.character.currentMap,
        music: this.character.currentMusic,
        character: this.character.getClientData(),
        players: players
    });
};


Player.prototype.tick = function(deltaTime){
   
};

Player.prototype.onDisconnect = function(callback) {
    this.onDisconnectHandler = callback;
};

Player.prototype.setGameEngine = function(ge){
    this.gameEngine = ge;
    this.id = ge.getId();
};

Player.prototype.setupSocket = function() {

    // On playerUpdate event
    var that = this;

    this.socket.on('playerUpdate', function (data) {
        try{
            switch(data.command){
                case 'logout':
                    try{
                        that.gameEngine.playerLogout(that);
                        that.gameEngine.queuePlayer(that,'logout', {});
                    }catch(e){
                        that.gameEngine.debug(that,{id: 'logoutError', error: e.stack});
                    }
                    break;
                case 'newChar':
                    try{
                        console.log(data);
                        if (data.slot < 1 || data.slot > 3){
                            //TODO deal with bad char info
                            break;
                        }else{
                            //create new character
                            var char = new Character();
                            data.owner = that;
                            data.id = that.gameEngine.getId();
                            data.money = 0;
                            data.currentSector = '0x0';
                            data.currentTile = [9,12];
                            data.currentMap = 'pallet_house1_floor2';
                            //data.currentSector = '0x0';
                            //data.currentTile = [9,12];
                            //data.currentMap = 'pallet';
                            data.music = 'pallet';
                            char.init(data);
                            that.startGame(char);
                        }
                    }catch(e){
                        that.gameEngine.debug(that,{id: 'newCharError', error: e.stack});
                    }
                    break;
                case 'moveAttempt':
                    //get tile at x/y
                    try{
                        var zone = that.gameEngine.zones[that.character.currentMap];
                        var coords = zone.getSectorXY(that.character.currentSector);
                        var tile = {
                            x: that.character.currentTile[0],
                            y: that.character.currentTile[1]
                        }
                        tile.x += data.x;
                        tile.y += data.y;
                        var moveSector = [0,0];
                        if (tile.x < 0){
                            tile.x = 20;
                            coords.x -=1;
                            moveSector[0] -=1;
                        }else if (tile.y < 0){
                            tile.y = 20;
                            coords.y -=1;
                            moveSector[1] -=1;
                        }else if (tile.x > 20){
                            tile.x = 0;
                            coords.x +=1;
                            moveSector[0] +=1;
                        }else if (tile.y > 20){
                            tile.y = 0;
                            coords.y +=1;
                            moveSector[1] +=1;
                        }
                        var newTile = zone.map[coords.x + 'x' + coords.y].tiles[tile.x][tile.y];
                        if (newTile.open && (newTile.resource != 'deep_water' && newTile.resource != 'water')){
                            //move!!!
                            //first, if the sector changed move sectors
                            zone.changeSector(that,moveSector,coords.x + 'x' + coords.y,tile);
                            //send a move command to all players in adjacent sectors
                            var coords2 = zone.getSectorXY(that.character.currentSector);
                            for (var i = -1;i < 2;i++){
                                for (var j = -1;j < 2;j++){
                                    try{
                                        for (var pl in zone.map[(coords2.x+i) + 'x' + (coords2.y+j)].players){
                                            var player = zone.map[(coords2.x+i) + 'x' + (coords2.y+j)].players[pl];
                                            that.gameEngine.queuePlayer(player,'movePC',{
                                                id: that.id,
                                                x:data.x,
                                                y:data.y,
                                                start: [that.character.currentTile[0],that.character.currentTile[1]]
                                            })
                                        }
                                    }catch(e){
                                        that.gameEngine.debug(that,{id: 'moveAttempt', error: e.stack});
                                    }
                                }
                            }
                            //change the sector/tile variables
                            that.character.currentSector = coords.x + 'x' + coords.y;
                            that.character.currentTile = [tile.x, tile.y];
                        }
                    }catch(e){
                        that.gameEngine.debug(that,{id: 'moveAttempt', error: e.stack});
                    }
                    break;
                case 'changeMap':
                    try{
                        console.log(data);
                        //check current Tile
                        var zone = that.gameEngine.zones[that.character.currentMap]
                        var tile = zone.map[that.character.currentSector].tiles[that.character.currentTile[0]][that.character.currentTile[1]];
                        for (var i = 0; i < tile.triggers.length;i++){
                            var trigger = tile.triggers[i];
                            console.log(trigger);
                            if (trigger.do == 'changeMap' && trigger.data.map == data.map && trigger.data.sector == data.sector && trigger.data.tile == data.tile){
                                that.character.currentSector = data.sector;
                                console.log('derp')
                                var c = zone.getSectorXY(trigger.data.tile);
                                that.character.currentTile = [c.x,c.y];
                                that.gameEngine.removePlayerFromZone(that,that.character.currentMap);
                                that.character.currentMap = data.map;
                                that.gameEngine.addPlayerToZone(that,data.map);
                                var newZone = that.gameEngine.zones[that.character.currentMap];
                                var newSector = zone.map[that.character.currentSector];
                                var players = newZone.getPlayers(newSector);
                                that.gameEngine.queuePlayer(that,'changeMap',{
                                    map: that.character.currentMap,
                                    sector: that.character.currentSector,
                                    tile: that.character.currentTile,
                                    players: players
                                });
                            }
                        }
                    }catch(e){
                        console.log("error changing map...reset pos?");
                        that.gameEngine.debug(that,{id: 'changeMap', error: e.stack});
                    }
                    break;
            }
        }catch(e){
            console.log("Player Update Error");
            console.log(e);
        }
    });


    this.socket.on('clientCommand', function(data) {
        // this needs to be parsed: data.command
        // format: >COMMAND ID AMOUNT
        //commands:
        try{
            var commandBool = false;
            var c = data.command;
            var commands = [];
            var from = 0;
            for (var i = 0; i < c.length; i++){
                if (c.charAt(i) === ' '){
                    commands.push(c.substring(from,i))
                    from = i+1;
                }
            }
            commands.push(c.substring(from,c.length));
            switch (commands[0]){
               
            }
        }catch(e){
            console.log(e);
        }
    });

    this.socket.on('disconnect', function () {
        try{
            that.user.unlock();
            console.log('Player ' + that.id + ' (' + that.user.userData.username + ') has disconnected.');
            that.user.updateDB();
            that.gameEngine.removePlayer(that);
            // If callback exists, call it
            if(that.onDisconnectHandler != null && typeof that.onDisconnectHandler == 'function' ) {
                that.onDisconnectHandler();
            }
        }catch(e){
            console.log('error on disconnect ( will error out on guest or user = null)');
        }
    });

    
    this.socket.on('loginAttempt', function (d) {
        try{
            if (d.sn && d.pw){
                d.sn = d.sn.toLowerCase();
                var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                var params = {
                    TableName: 'users',
                    Key: {
                        username: d.sn
                    }
                }
                docClient.get(params, function(err, data) {
                    try{
                        if (err) {
                            console.error("Unable to find user. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            if (typeof data.Item != 'undefined'){
                                const hash = crypto.createHmac('sha256', d.pw);
                                if (hash.digest('hex') == data.Item.password){
                                    //SET USER DATA TO EXISTING USER
                                    that.user = User();
                                    that.user.setOwner(that);
                                    that.user.init(data.Item);
                                    that.user.lock();
                                    that.gameEngine.users[d.sn] = that.user;
                                    that.gameEngine.queuePlayer(that,"loggedIn", {name:data.Item.username, characters: that.user.characters});
                                }else{
                                    that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'wrongpass'});
                                }
                            }else{
                                that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'wrongpass'});
                            }
                        }
                    }catch(e){
                        console.log(e);
                    }
                });
            }
        }catch(e){
            console.log('Login Attempt failed');
            console.log(e);
            that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'wrongpass'});
        }
    });
    this.socket.on('guestLogin', function (d) {
        console.log(d);
        try{
            d.sn = d.sn.toLowerCase();
            var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
            var params = {
                TableName: 'users',
                Key: {
                    username: d.sn
                }
            }
            docClient.get(params, function(err, data) {
                if (err) {
                } else {
                    console.log("Attempting guest logon...");
                    if (d.sn.length >= 3 && d.sn.length <= 16 && typeof data.Item == 'undefined' && typeof that.gameEngine.users[d.sn] == 'undefined'){
                        console.log('valid username - adding guest');
                        var u = {
                            username: d.sn,
                            guest: true
                        };
                        that.user = User();
                        that.user.setOwner(that);
                        that.user.init(u);
                        that.gameEngine.users[d.sn] = that.user;
                        that.gameEngine.queuePlayer(that,"loggedIn", {name:d.sn, characters: that.user.characters});
                    }else if (typeof data.Item != 'undefined' || typeof that.gameEngine.users[d.sn] != 'undefined'){
                        that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'userexists'});
                    }else{
                        that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'snlength'});
                    }
                }
            });
        }catch(e){
            console.log('error creating user');
            console.log(e.stack);
        }
    });
    this.socket.on('createUser', function (d) {
        console.log(d);
        try{
            d.sn = d.sn.toLowerCase();
            if (typeof that.gameEngine.users[d.sn] == 'undefined'){
                var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                var params = {
                    TableName: 'users',
                    Key: {
                        username: d.sn
                    }
                };
                docClient.get(params, function(err, data) {
                    if (err) {
                        console.error("Unable to find user. Error JSON:", JSON.stringify(err, null, 2));
                    } else {
                        //check password lengths, and if item exists
                        console.log("Create user succeeded:", JSON.stringify(data, null, 2));
                        if (d.sn.length >= 3 && d.sn.length <= 16 && d.pw.length >= 6 && typeof data.Item == 'undefined'){
                            console.log('valid account info - creating account');
                            //first, initialize the user data
                            var params2 = {
                                TableName: 'blaine_userdata',
                                Item: {
                                    'username': d.sn,
                                    'characters': {},
                                }
                            }
                            docClient.put(params2, function(err, data2) {
                                if (err) {
                                    console.error("Unable to add user data. Error JSON:", JSON.stringify(err, null, 2));
                                } else {
                                    console.log("Create userdata succeeded:", JSON.stringify(data2, null, 2));
                                    //hash the password
                                    const hash = crypto.createHmac('sha256', d.pw);
                                    var u = {
                                        username: d.sn,
                                        password: hash.digest('hex')
                                    };
                                    that.user = User();
                                    that.user.setOwner(that);
                                    that.user.init(u);
                                    that.gameEngine.users[d.sn] = that.user;
                                    that.gameEngine.queuePlayer(that,"loggedIn", {name:d.sn, characters: that.user.characters});
                                    var params3 = {
                                        TableName: 'users',
                                        Item: {
                                            'username': d.sn,
                                            'password': that.user.userData.password,
                                            'admin': false,
                                            'loggedin': true,
                                            'createDate': new Date().toJSON(),
                                            'lastLogin': new Date().toJSON()
                                        }
                                    }
                                    docClient.put(params3, function(err, data3) {
                                        if (err) {
                                            console.error("Unable to add user. Error JSON:", JSON.stringify(err, null, 2));
                                        } else {
                                            console.log("Create user succeeded:", JSON.stringify(data3, null, 2));
                                        }
                                    });
                                }
                            });
                            
                        }else if (typeof data.Item != 'undefined'){
                            that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'userexists'});
                        }else if (d.sn.length < 3 || d.sn.length > 16){
                            that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'snlength'});
                        }else if (d.pw.length < 8 || d.pw.length > 16){
                            that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'plength'});
                        }
                    }
                });
            }else{
                //user exists
                that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'userexists'});
            }
        }catch(e){
            console.log('error creating user');
            console.log(e.stack);
        }
    });
};

exports.Player = Player;
