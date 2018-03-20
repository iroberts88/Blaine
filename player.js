//----------------------------------------------------------------
//player.js
//----------------------------------------------------------------
var User = require('./user.js').User;

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
                        that.user.unlock();
                        that.user.updateDB();
                        that.user = null;
                    }catch(e){
                        that.gameEngine.debug(that,{id: 'logoutError', error: e.stack});
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
            if (that.gameSession){
                that.gameSession.handleDisconnect(that,false);
            }else{
                that.gameEngine.removePlayer(that);
            }
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
            if (!that.gameSession){
                if (d.guest){
                    //SET USER DATA TO GUEST
                    that.user = User();
                    that.user.setOwner(that);
                    that.user.init({guest: true});
                    that.user.setLastLogin(Date.now());
                    that.gameEngine.queuePlayer(that,"loggedIn", {name:that.user.userData.username,stats:that.user.userData.stats});
                }else if (d.sn && d.pw){
                    d.sn = d.sn.toLowerCase();
                    if (!that.gameEngine.users[that.gameEngine._userIndex[d.sn]].loggedin){
                        var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                        var params = {
                            TableName: 'users',
                            Key: {
                                username: d.sn
                            }
                        }
                        docClient.get(params, function(err, data) {
                            if (err) {
                                console.error("Unable to find user. Error JSON:", JSON.stringify(err, null, 2));
                            } else {
                                const hash = crypto.createHmac('sha256', d.pw);
                                if (hash.digest('hex') == data.Item.password){
                                    //SET USER DATA TO EXISTING USER
                                    that.user = User();
                                    that.user.setOwner(that);
                                    that.user.init(data.Item);
                                    that.user.lock();
                                    that.user.setLastLogin(Date.now().toJSON);
                                    that.gameEngine.queuePlayer(that,"loggedIn", {name:data.Item.username});
                                }else{
                                    that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'wp'});
                                }
                            }
                        });
                    }else{
                        that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'l'});
                    }
                }
            }
        }catch(e){
            console.log('Login Attempt failed');
            console.log(e);
            that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'wp'});
        }
    });
    //TODO - set player variable to show they are logged in
    //on the client - catch "loggedIn" and move to the main menu, display stats, add logout button
    this.socket.on('createUser', function (d) {
        console.log(d);
        try{
            d.sn = d.sn.toLowerCase();
            if (!that.gameSession && d.sn != 'guest' && d.pw){
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
                    //check password lengths, and if item exists
                    console.log("Create user succeeded:", JSON.stringify(data, null, 2));
                    if (d.sn.length >= 3 && d.sn.length <= 16 && d.pw.length >= 8 && d.pw.length <= 16 && typeof data.Item == 'undefined'){
                        console.log('valid account info - creating account');
                        //first, initialize the user data
                        var params2 = {
                            TableName: 'tactics_userdata',
                            Item: {
                                'username': d.sn,
                                'characters': [],
                                'inventory': []
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
                                var params3 = {
                                    TableName: 'users',
                                    Item: {
                                        'username': d.sn,
                                        'password': that.user.userData.password,
                                        'admin': false,
                                        'chatlog': [],
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
                                        that.gameEngine.users[d.sn] = params3.Item;
                                        that.gameEngine._userIndex[d.sn] = d.sn;
                                        that.gameEngine.queuePlayer(that,"loggedIn", {name:d.sn});
                                    }
                                });
                            }
                        });
                        
                    }else if (typeof data.Item != 'undefined'){
                        that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'uiu'});
                    }else if (d.sn.length < 3 || d.sn.length > 16){
                        that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'ule'});
                    }else if (d.pw.length < 8 || d.pw.length > 16){
                        that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'ple'});
                    }
                }
                });
            }
        }catch(e){
            console.log('error creating user');
            console.log(e.stack);
        }
    });
};

exports.Player = Player;
