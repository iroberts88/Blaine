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
    var mapData = {};
    var sector = zone.map[this.character.currentSector];
    for (var i = -1;i < 2;i++){
        for (var j = -1;j < 2;j++){
            var s = (sector.sectorX+i) + 'x' + (sector.sectorY+j);
            console.log(s);
            if (typeof zone.map[s] != 'undefined'){
                //sector exists, get info
                mapData[s] = zone.map[s].tiles;
            }
        }
    }
    this.gameEngine.queuePlayer(this,'startGame',{
        map: mapData,
        character: this.character.getClientData()
    });
};

Player.prototype.tick = function(deltaTime){
   
};

Player.prototype.onDisconnect = function(callback) {
    this.onDisconnectHandler = callback;
};

Player.prototype.setGameEngine = function(ge){
    this.gameEngine = ge;
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
                            //data.currentMap = 'pallet_house1_floor2';
                            //data.currentSector = '0x0';
                            //data.currentTile = [9,12];
                            data.currentMap = 'pallet';
                            data.currentSector = '0x0';
                            data.currentTile = [8,8];
                            char.init(data);
                            that.startGame(char);
                        }
                    }catch(e){
                        that.gameEngine.debug(that,{id: 'newCharError', error: e.stack});
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
