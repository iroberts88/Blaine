//----------------------------------------------------------------
//player.js
//----------------------------------------------------------------
var User = require('./user.js').User,
    Character = require('./character.js').Character,
    Zone = require('./zone.js').Zone,
    Battle = require('./battle.js').Battle,
    Trainer = require('./trainer.js').Trainer,
    Pokemon = require('./pokemon.js').Pokemon,
    Triggers = require('./triggers.js').Triggers;

const crypto = require('crypto');

var AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

var directions = {
    '-1,0': 'left',
    '0,-1': 'up',
    '0,1': 'down',
    '1,0': 'right'
}

var Player = function(){
    this.gameEngine = null;
    this.battle = null;
    this.user = null;
    this.id = null;
    this.ready = null;
    this.character = null;

    this.battle = null;
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
    var zoneData = this.gameEngine.zones[this.character.currentMap].zoneData;
    this.gameEngine.queuePlayer(this,'startGame',{
        map: this.character.currentMap,
        zoneData: zoneData,
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

    this.socket.on('battleUpdate', function (data) {
        if (typeof data.command == 'undefined'){
            //TODO Error no command
            console.log("No Command")
            console.log(data);
            return;
        }

        switch(data.command){
            case 'turn':
                if (that.battle == null || typeof data.turnData == 'undefined'){
                    return;
                }
                //Parse turn info as valid, add to battle
                //TODO ALL OF THESE CHECKS
                if (data.turnData.run){
                    //check run
                    console.log('Trying to run');
                    if (that.battle.wild){
                        //TODO run % chance?
                        //exit battle
                        that.battle.end = true;
                        that.battle = null;
                        that.gameEngine.queuePlayer(that,'battleData', {run:true});
                    }
                }else{
                    for (var i in data.turnData){
                        switch(data.turnData[i].command){
                            case 'item':
                                //make sure player HAS the item
                                //if used on a pokemon, make sure the pokemon is valid and item type is valid
                                break;
                            case 'switch':
                                //make sure the pokemon switch is valid
                                break;
                            case 'fight':
                                //make sure the move has PP and is valid
                                break;
                        }
                        that.battle.addTurnData(i,data.turnData[i]);
                    }
                }
                break;
            case 'roundReady':
                that.battle.readyForNextRound[that.id] = true;
                console.log(that.battle.readyForNextRound)
                break;
        }
    });

    this.socket.on('playerUpdate', function (data) {
        try{
            if (that.battle != null){
                //player updates during an active battle are ignored
                return;
            }
            switch(data.command){
                case 'logout':
                    that.gameEngine.playerLogout(that);
                    that.gameEngine.queuePlayer(that,'logout', {});
                    break;
                case 'swapPkmn':
                    that.character.swapPkmn(data);
                    break;
                case 'newChar':
                    if (data.slot < 1 || data.slot > 3){
                        //TODO deal with bad char info
                        break;
                    }else{
                        //create new character
                        var char = new Character();
                        data.owner = that;
                        data.id = that.gameEngine.getId();
                        data.money = 0;
                        data.pokedex = {};
                        //data.currentSector = '0x0';
                        //data.currentTile = [5,5];
                        //data.currentMap = 'pallet';
                        data.currentSector = '0x0';
                        data.currentTile = [9,12];
                        data.currentMap = 'pallet_house1_floor2';
                        data.music = 'pallet';
                        char.init(data);
                        that.startGame(char);
                    }
                    break;
                case 'moveAttempt':
                    //get tile at x/y
                    try{
                        if (data.cTile[0] != that.character.currentTile[0] || data.cTile[1] != that.character.currentTile[1] || data.cSector != that.character.currentSector){
                            return;
                        }
                        var zone = that.gameEngine.zones[that.character.currentMap];
                        var coords = zone.getSectorXY(that.character.currentSector);
                        var tile = {
                            x: that.character.currentTile[0],
                            y: that.character.currentTile[1]
                        }
                        // !TRIGGER! try to do directional triggers
                        var t = zone.map[that.character.currentSector].tiles[that.character.currentTile[0]][that.character.currentTile[1]];
                        var end = false;
                        for (var i = 0; i < t.triggers.length;i++){
                            var trigger = t.triggers[i];
                            if (trigger.on == directions[data.x+','+data.y]){
                                if (Triggers.doTrigger(that.character,trigger)){
                                    end = true;
                                }
                            }
                        }
                        if (end){return;}
                        tile.x += data.x;
                        tile.y += data.y;
                        var moveSector = [0,0];
                        if (tile.x < 0){
                            tile.x = 21+data.x;
                            coords.x -=1;
                            moveSector[0] -= 1;
                        }else if (tile.y < 0){
                            tile.y = 21+data.y;
                            coords.y -=1;
                            moveSector[1] -= 1;
                        }else if (tile.x > 20){
                            tile.x = tile.x-21;
                            coords.x +=1;
                            moveSector[0] +=1;
                        }else if (tile.y > 20){
                            tile.y = tile.y-21;
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
                                    if (zone.map.hasOwnProperty((coords2.x+i) + 'x' + (coords2.y+j))){
                                        for (var pl in zone.map[(coords2.x+i) + 'x' + (coords2.y+j)].players){
                                            var player = zone.map[(coords2.x+i) + 'x' + (coords2.y+j)].players[pl];
                                            that.gameEngine.queuePlayer(player,'movePC',{
                                                id: that.id,
                                                x:data.x,
                                                y:data.y,
                                                start: [that.character.currentTile[0],that.character.currentTile[1]]
                                            })
                                        }
                                    }
                                }
                            }
                            //change the sector/tile variables
                            that.character.currentSector = coords.x + 'x' + coords.y;
                            that.character.currentTile = [tile.x, tile.y];
                            // !TRIGGER! Try to do arrival triggers
                            var t = zone.map[that.character.currentSector].tiles[that.character.currentTile[0]][that.character.currentTile[1]];
                            for (var i = 0; i < t.triggers.length;i++){
                                var trigger = t.triggers[i];
                                if (trigger.on == 'arrival'){
                                    Triggers.doTrigger(that.character,trigger);
                                }
                            }
                        }
                    }catch(e){
                        that.gameEngine.debug(that,{id: 'moveAttempt', error: e.stack});
                    }
                    break;
                case 'requestMapData':
                    try{
                        var zoneData = that.gameEngine.zones[data.name].zoneData;
                        that.gameEngine.queuePlayer(that,'mapData',{
                            zoneData: zoneData,
                            name: data.name
                        });
                    }catch(e){
                        that.gameEngine.debug(that,{id: 'requestMapDataError', error: e.stack});
                    }
                    break;
            }
        }catch(e){
            console.log("Player Update Error");
            console.log(e);
        }
    });


    this.socket.on('clientCommand', function(data) {
        // this needs to be parsed: data.cString
        // format: >COMMAND ID AMOUNT
        //commands:
        if (data.cString.length > 128){
            return;
        }
        try{
            if (data.cString.charAt(0) != '/'){
                //its a SAY command
                if (data.cString == ''){
                    return;
                }
                if (that.battle){
                    var u = that.user.userData.username
                    that.battle.sendChat(u.toUpperCase() + ': ' + data.cString);
                    return
                }
                console.log('Say: ' + data.cString);
                var players = [];
                //send a move command to all players in adjacent sectors
                var zone = that.gameEngine.zones[that.character.currentMap];
                var coords = zone.getSectorXY(that.character.currentSector);
                for (var i = -1;i < 2;i++){
                    for (var j = -1;j < 2;j++){
                        try{
                            for (var pl in zone.map[(coords.x+i) + 'x' + (coords.y+j)].players){
                                var player = zone.map[(coords.x+i) + 'x' + (coords.y+j)].players[pl];
                                that.gameEngine.queuePlayer(player,"say", {id: that.id,text: data.cString});
                            }
                        }catch(e){
                            that.gameEngine.debug(that,{id: 'chatAttempt', error: e.stack});
                        }
                    }
                }
                return;
            }
            var commandBool = false;
            var c = data.cString.substring(1,data.cString.length);
            var commands = [];
            var from = 0;
            for (var i = 0; i < c.length; i++){
                if (c.charAt(i) === ' '){
                    commands.push(c.substring(from,i))
                    from = i+1;
                }
            }
            commands.push(c.substring(from,c.length));
            console.log(commands);
            switch (commands[0]){
                case 'battle':
                    if (that.battle != null){console.log("Battle exists");return;}
                    console.log("Start Battle");
                    var pokemon = [Math.ceil(Math.random()*15)];
                    var levels = [Math.ceil(Math.random()*50)];

                    var battle = new Battle(that.gameEngine);
                    var pkmn = new Trainer(that.gameEngine);
                    pkmn.init({wild: true,pokemon:pokemon,levels:levels});
                    if (battle.init({team1: [that.character],team2: [pkmn],type: '1v1'})){
                        console.log("Battle successfully initialized!!");
                        that.battle = battle;
                        that.gameEngine.activeBattles[battle.id] = battle;
                    }
                    break;
                case 'arp':
                    console.log("Adding Random Pokemon!");
                    var pokemon = Math.ceil(Math.random()*15);
                    var level = Math.ceil(Math.random()*100);

                    var newPoke = new Pokemon();
                    newPoke.init(that.gameEngine.pokemon[pokemon],{
                        character: that.character,
                        nickname: '',
                        level: level,
                        id: that.gameEngine.getId()
                    })
                    that.character.addPokemon(newPoke);
                    break;
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
        if (that.user){return;}
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
        if (that.user){return;}
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
        if (that.user){return;}
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
