//----------------------------------------------------------------
//player.js
//----------------------------------------------------------------
var User = require('./user.js').User,
    Character = require('./character.js').Character,
    Zone = require('./zone.js').Zone,
    Battle = require('./battle.js').Battle,
    CENUMS = require('./enums.js').Enums, //init client enums
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
    this.engine = null;
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
    this.engine.addPlayerToZone(this,this.character.currentMap);
    //send down data to start new game
    var zone = this.engine.zones[this.character.currentMap];
    var sector = zone.map[this.character.currentSector];
    var players = zone.getPlayers(sector);
    var zoneData = this.engine.zones[this.character.currentMap].zoneData;
    var cData = {};
    cData[CENUMS.MAP] = this.character.currentMap;
    cData[CENUMS.ZONEDATA] = zoneData;
    cData[CENUMS.MUSIC] = this.character.currentMusic;
    cData[CENUMS.CHARACTER] = this.character.getClientData();
    cData[CENUMS.PLAYERS] = players;
    this.engine.queuePlayer(this,CENUMS.STARTGAME,cData);

};


Player.prototype.tick = function(deltaTime){
   
};

Player.prototype.onDisconnect = function(callback) {
    this.onDisconnectHandler = callback;
};

Player.prototype.setGameEngine = function(ge){
    this.engine = ge;
    this.id = ge.getId();
};
Player.prototype.checkData = function(obj,elements){
    for (var i = 0; i < elements.length;i++){
        if (typeof obj[elements[i]] == 'undefined'){
            return false;
        }
    }
    return true;
}
Player.prototype.setupSocket = function() {

    // On playerUpdate event
    var that = this;

    this.socket.on(CENUMS.BATTLEUPDATE, function (data) {
        if (!data){return;}
        if (typeof data[CENUMS.COMMAND] == 'undefined'){
            //TODO Error no command
            that.engine.log("No Command")
            that.engine.log(data);
            return;
        }

        if (!that.battle){
            that.engine.log('no battle...');
            return;

        }
        console.log(data);
        switch(data[CENUMS.COMMAND]){
            case CENUMS.ATTACK:
                if (!that.checkData(data,[CENUMS.POKEMON,CENUMS.MOVEID])){
                    return;
                }
                var cData = {};
                cData[data[CENUMS.POKEMON]] = data[CENUMS.POKEMON];
                //Parse turn info as valid, add to battle
                //TODO ALL OF THESE CHECKS
                //MAKE SURE THE MOVE IS VALID!
                var pokemon = that.character.getPokemon(data[CENUMS.POKEMON]);
                if (!pokemon){
                    console.log('pokemon with id ' + data[CENUMS.POKEMON] + ' doesnt exist');
                    pokemon.turnInvalid();
                    return;
                }
                if (!pokemon.getMove(data[CENUMS.MOVEID])){
                    console.log('pokemon dos not have move: ' + data[CENUMS.MOVEID] );
                    pokemon.turnInvalid();
                    return;
                }
                var move = pokemon.getMove(data[CENUMS.MOVEID]);
                //make sure the move has pp
                if (pokemon.currentPP[pokemon.getMoveIndex(data[CENUMS.MOVEID])] <= 0){
                    console.log('move is out of PP: ' + data[CENUMS.MOVEID] );
                    pokemon.turnInvalid();
                    return;
                }
                //make sure the target is valid
                var target = null;
                switch (move.targetType){
                    case CENUMS.SINGLE:
                        if (data[CENUMS.TEAM] == 1){
                            target = that.battle.team1Pokemon[data[CENUMS.TARGET]-1];
                        }else if (data[CENUMS.TEAM] == 2){
                            target = that.battle.team2Pokemon[data[CENUMS.TARGET]-1];
                        }
                        if (typeof target == 'undefined' || !target){
                            console.log('invalid target');
                            pokemon.turnInvalid();
                            return;
                        }
                        break;
                    case CENUMS.ALLY:
                        var team = that.battle.getTeamPokemon(that.character);
                        target = team[data[CENUMS.TARGET]-1];
                        if (typeof target == 'undefined' || !target){
                            console.log('invalid target');
                            pokemon.turnInvalid();
                            return;
                        }
                        break;
                    case CENUMS.ENEMY:
                        var team = that.battle.getEnemyTeamPokemon(that.character);
                        target = team[data[CENUMS.TARGET]-1];
                        if (typeof target == 'undefined' || !target){
                            console.log('invalid target');
                            pokemon.turnInvalid();
                            return;
                        }
                        break;
                    default:
                        target = pokemon;
                        break;

                }
                //add the move the the pokemon!
                pokemon.currentTurnData = {
                    command: 'attack',
                    id: that.engine.getId(),
                    target: target,
                    move: move
                }
                break;
            case CENUMS.NEWPKMN:
                var pkmn = that.character.getPokemon(data[CENUMS.POKEMON]);
                if (!pkmn){
                    return;
                }else{
                    if (pkmn.currentHP.value == 0){
                        return;
                    }
                    if (that.character.battle.activePokemon[pkmn.id]){
                        return;
                    }
                }
                var repNum = data[CENUMS.NUMBER];
                var team = that.character.battle.getTeamPkmn(that.character);
                if (team[repNum-1]){
                    console.log('that pokemon is already active!!');
                    return;
                }
                team[repNum-1] = pkmn;

                var cData = {};
                cData[CENUMS.POKEMON] = pkmn.getLessClientData();
                cData[CENUMS.SLOT] = repNum;
                that.battle.queueData(CENUMS.NEWPKMN,cData);


                that.character.activePokemon[pkmn.id] = pkmn;
                that.battle.activePokemon[pkmn.id] = pkmn;
                pkmn.character.participated[pkmn.id] = true;

                if (!that.character.hasFaintedPokemon()){
                    //still has a fainte pokemon?
                    that.battle.waitingTime = 1.5;
                    that.battle.waitingTicker = 0;
                }
                break;
            case CENUMS.SWAPPKMN:
                if (!that.checkData(data,[CENUMS.POKEMON,CENUMS.TARGET])){
                    return;
                }
                var cData = {};
                cData[data[CENUMS.POKEMON]] = data[CENUMS.POKEMON];
                //make sure the pokemon is this players, not fainted, and not active

                var pokemon = that.character.getPokemon(data[CENUMS.POKEMON]);
                var target = that.character.getPokemon(data[CENUMS.TARGET]);
                if (!pokemon){
                    console.log('pokemon with id ' + data[CENUMS.POKEMON] + ' doesnt exist');
                    pokemon.turnInvalid();
                    return;
                }
                if (!target){
                    console.log('target pokemon with id ' + data[CENUMS.TARGET] + ' doesnt exist');
                    pokemon.turnInvalid();
                    return;
                }
                if (target.currentHP.value == 0){
                    console.log('target pokemon is fainted');
                    pokemon.turnInvalid();
                    return;
                }
                if (target.character.battle.activePokemon[target.id]){
                    console.log('target pokemon is already active');
                    pokemon.turnInvalid();
                    return;
                }
                pokemon.currentTurnData = {
                    command: 'switch',
                    id: that.engine.getId(),
                    target: target,
                    pkmn: pokemon
                }
                break;
            case CENUMS.ITEM:
                if (!that.checkData(data,[CENUMS.POKEMON,CENUMS.ID])){
                    return;
                }
                var target = null;
                var pokemon = that.character.getPokemon(data[CENUMS.POKEMON]);
                var item = that.character.inventory.getItem(data[CENUMS.ID]);
                if (!item){
                    console.log('invalid item!!');
                    pokemon.turnInvalid();
                    return;
                }
                var tt = item.targetType;

                if (tt == CENUMS.FEILD || tt == CENUMS.FIELDPKMN){
                    console.log('Invalid Item type!! HAX');
                    pokemon.turnInvalid();
                    return;
                }else if (tt == CENUMS.ALLPKMN || tt == CENUMS.BATTLEPKMN || tt == CENUMS.ENEMY){
                    if (typeof that.battle.activePokemon[data[CENUMS.TARGET]] == 'undefined'){
                        console.log("that item type needs a target");
                        pokemon.turnInvalid();
                        return;
                    }else{
                        target = that.battle.activePokemon[data[CENUMS.TARGET]]
                    }
                }

                pokemon.currentTurnData = {
                    command: 'item',
                    id: that.engine.getId(),
                    target: target,
                    pkmn: pokemon
                }
                break;
            case CENUMS.RUN:
                if (!that.checkData(data,[CENUMS.POKEMON,CENUMS.MOVEID])){
                    return;
                }
                that.engine.log('Trying to run');
                if (that.battle.wild){
                    //TODO run % chance?
                    //exit battle
                    that.battle.end = true;
                    that.battle = null;
                    that.engine.queuePlayer(that,CENUMS.BATTLEDATA, {run:true});
                }
                break;
            case CENUMS.READY:
                that.ready = true;
                that.battle.checkReady();
                break;
        }
    });

    this.socket.on(CENUMS.PLAYERUPDATE, function (data) {

        try{
            if (that.battle != null){
                //player updates during an active battle are ignored
                return;
            }
            switch(data[CENUMS.COMMAND]){
                case CENUMS.LOGOUT:
                    that.engine.playerLogout(that);
                    that.engine.queuePlayer(that,CENUMS.LOGOUT, {});
                    break;
                case CENUMS.SWAPPKMN:
                    that.character.swapPkmn(data);
                    break;
                case CENUMS.NEWCHAR:
                    if (data[CENUMS.SLOT] < 1 || data[CENUMS.SLOT] > 3){
                        //TODO deal with bad char info
                        break;
                    }else{
                        //create new character
                        var char = Character();
                        data.owner = that;
                        data.id = that.engine.getId();
                        data.money = 0;
                        data.pokedex = {};
                        //data.currentSector = '0x0';
                        //data.currentTile = [5,5];
                        //data.currentMap = 'pallet';
                        data.currentSector = '0x0';
                        data.currentTile = [9,12];
                        data.currentMap = 'pallet_house1_floor2';
                        data.music = 'pallet';
                        data.engine = that.engine;
                        char._init(data);
                        that.startGame(char);
                    }
                    break;
                case CENUMS.MOVEATTEMPT:
                    //get tile at x/y
                    try{
                        if (data[CENUMS.TILE][0] != that.character.currentTile[0] || data[CENUMS.TILE][1] != that.character.currentTile[1] || data[CENUMS.SECTOR] != that.character.currentSector){
                            return;
                        }
                        var zone = that.engine.zones[that.character.currentMap];
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
                            if (trigger.on == directions[data[CENUMS.X]+','+data[CENUMS.Y]]){
                                if (Triggers.doTrigger(that.character,trigger)){
                                    end = true;
                                }
                            }
                        }
                        if (end){return;}
                        tile.x += data[CENUMS.X];
                        tile.y += data[CENUMS.Y];
                        var moveSector = [0,0];
                        if (tile.x < 0){
                            tile.x = 21+data[CENUMS.X];
                            coords.x -=1;
                            moveSector[0] -= 1;
                        }else if (tile.y < 0){
                            tile.y = 21+data[CENUMS.Y];
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
                                            var cData = {}
                                            cData[CENUMS.ID] = that.character.id;
                                            cData[CENUMS.X] = data[CENUMS.X];
                                            cData[CENUMS.Y] = data[CENUMS.Y];
                                            cData[CENUMS.START] = [that.character.currentTile[0],that.character.currentTile[1]];
                                            that.engine.queuePlayer(player,CENUMS.MOVEPC,cData)
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
                        that.engine.debug(that,e,{id: 'moveAttempt', error: e.stack});
                    }
                    break;
                case CENUMS.REQUESTMAPDATA:
                    try{
                        var zoneData = that.engine.zones[data[CENUMS.NAME]].zoneData;
                        var cData = {};
                        cData[CENUMS.NAME] = data[CENUMS.NAME];
                        cData[CENUMS.ZONEDATA] = zoneData;
                        that.engine.queuePlayer(that,CENUMS.MAPDATA,cData);
                    }catch(e){
                        that.engine.debug(that,{id: 'requestMapDataError', error: e.stack});
                    }
                    break;
            }
        }catch(e){
            console.log("Player Update Error");
            console.log(e);
        }
    });

    this.socket.on(CENUMS.PING, function(data) {
        that.engine.queuePlayer(that,CENUMS.PING,{});
    });

    this.socket.on(CENUMS.CLIENTCOMMAND, function(data) {
        // this needs to be parsed: command
        // format: >COMMAND ID AMOUNT
        //commands:
        console.log(data);
        var command = data[CENUMS.TEXT];
        if (command.length > 128){
            return;
        }
        try{
            if (command.charAt(0) != '/'){
                //its a SAY command
                if (command == ''){
                    return;
                }
                if (that.battle){
                    var u = that.user.userData.username
                    that.battle.sendChat(u.toUpperCase() + ': ' + command);
                    return
                }
                console.log('Say: ' + command);
                var players = [];
                //send a move command to all players in adjacent sectors
                var zone = that.engine.zones[that.character.currentMap];
                var coords = zone.getSectorXY(that.character.currentSector);
                for (var i = -1;i < 2;i++){
                    for (var j = -1;j < 2;j++){
                        try{
                            for (var pl in zone.map[(coords.x+i) + 'x' + (coords.y+j)].players){
                                var player = zone.map[(coords.x+i) + 'x' + (coords.y+j)].players[pl];
                                var cData = {}
                                cData[CENUMS.ID] = that.character.id;
                                cData[CENUMS.TEXT] = command;
                                that.engine.queuePlayer(player,CENUMS.SAY, cData);
                            }
                        }catch(e){
                            that.engine.debug(that,{id: 'chatAttempt', error: e.stack});
                        }
                    }
                }
                return;
            }
            var commandBool = false;
            var c = command.substring(1,command.length);
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
                case 'b':
                    //trainer battle
                    if (that.battle != null){console.log("Battle exists");return;}
                    console.log("Start Battle");
                    var pokemon = [4,4,4];//[Math.ceil(Math.random()*15),Math.ceil(Math.random()*15),Math.ceil(Math.random()*15)];
                    var levels = [3,3,3];
                    var battle = new Battle(that.engine);
                    var trainer = new Trainer(that.engine);
                    trainer.init({pokemon:pokemon,levels:levels});
                    if (battle.init({team1: [that.character],team2: [trainer],type: 'trainer'})){
                        console.log("Battle successfully initialized!!");
                        that.battle = battle;
                        that.engine.inactiveBattles[battle.id] = battle;
                    }
                    break;
                case 'wbattle':
                    //wild battle
                    //1v1 pokemon, the pokemon is likely to run when its health gets low //trainer battle
                    if (that.battle != null){console.log("Battle exists");return;}
                    console.log("Start Battle");
                    var pokemon = [Math.ceil(Math.random()*15)];
                    var levels = [3];
                    var battle = new Battle(that.engine);
                    var trainer = new Trainer(that.engine);
                    trainer.init({pokemon:pokemon,levels:levels});
                    if (battle.init({team1: [that.character],team2: [trainer],type: 'wild'})){
                        console.log("Battle successfully initialized!!");
                        that.battle = battle;
                        that.engine.inactiveBattles[battle.id] = battle;
                    }
                    break;
                case 'tbattle':
                    if (that.battle != null){console.log("Battle exists");return;}
                    console.log("Start Battle");
                    var pokemon = [Math.ceil(Math.random()*15)];
                    var levels = [5];

                    var battle = new Battle(that.engine);
                    var pokemon = [Math.ceil(Math.random()*15),Math.ceil(Math.random()*15),Math.ceil(Math.random()*15)];
                    var levels = [3,3,3];
                    var trainer1 = new Trainer(that.engine);
                    trainer1.init({wild: true,pokemon:pokemon,levels:levels});
                    var pokemon = [Math.ceil(Math.random()*15),Math.ceil(Math.random()*15),Math.ceil(Math.random()*15)];
                    var levels = [3,3,3];
                    var trainer2 = new Trainer(that.engine);
                    trainer2.init({wild: true,pokemon:pokemon,levels:levels});
                    var pokemon = [Math.ceil(Math.random()*15),Math.ceil(Math.random()*15),Math.ceil(Math.random()*15)];
                    var levels = [3,3,3];
                    var trainer3 = new Trainer(that.engine);
                    trainer3.init({wild: true,pokemon:pokemon,levels:levels});
                    if (battle.init({team1: [that.character,trainer1],team2: [trainer2,trainer3],type: 'team'})){
                        console.log("Battle successfully initialized!!");
                        that.battle = battle;
                        that.engine.inactiveBattles[battle.id] = battle;
                    }
                    break;
                case 'arp':
                    console.log("Adding Random Pokemon!");
                    var pokemon = Math.ceil(Math.random()*15);
                    var level = Math.ceil(Math.random()*100);

                    var newPoke = new Pokemon();
                    newPoke.init(that.engine.pokemon[pokemon],{
                        character: that.character,
                        nickname: '',
                        engine: that.engine,
                        level: level,
                        id: that.engine.getId()
                    })
                    that.character._addPokemon(newPoke);
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
            that.engine.removePlayer(that);
            // If callback exists, call it
            if(that.onDisconnectHandler != null && typeof that.onDisconnectHandler == 'function' ) {
                that.onDisconnectHandler();
            }
        }catch(e){
            console.log('error on disconnect ( will error out on guest or user = null)');
        }
    });

    
    this.socket.on(CENUMS.LOGINATTEMPT, function (d) {
        if (that.user){return;}
        var cData = {};
        try{
            if (d[CENUMS.USER] && d[CENUMS.PASSWORD]){
                d[CENUMS.USER] = d[CENUMS.USER].toLowerCase();
                var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                var params = {
                    TableName: 'users',
                    Key: {
                        username: d[CENUMS.USER]
                    }
                }
                docClient.get(params, function(err, data) {
                    var cData = {};
                    try{
                        if (err) {
                            console.error("Unable to find user. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            if (typeof data.Item != 'undefined'){
                                const hash = crypto.createHmac('sha256', d[CENUMS.PASSWORD]);
                                if (hash.digest('hex') == data.Item.password){
                                    //SET USER DATA TO EXISTING USER
                                    that.user = User();
                                    that.user.setOwner(that);
                                    that.user.init(data.Item);
                                    that.user.lock();
                                    that.engine.users[d[CENUMS.USER]] = that.user;
                                    cData[CENUMS.NAME] = data.Item.username;
                                    cData[CENUMS.CHARACTERS] = that.user.characters;
                                    that.engine.queuePlayer(that,CENUMS.LOGGEDIN, cData);
                                }else{
                                    cData[CENUMS.TEXT] = CENUMS.PWERRORWRONGPASS;
                                    that.engine.queuePlayer(that,CENUMS.SETLOGINERRORTEXT, cData);
                                }
                            }else{
                                cData[CENUMS.TEXT] = CENUMS.PWERRORWRONGPASS;
                                that.engine.queuePlayer(that,CENUMS.SETLOGINERRORTEXT, cData);
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
            cData[CENUMS.TEXT] = CENUMS.PWERRORWRONGPASS;
            that.engine.queuePlayer(that,CENUMS.SETLOGINERRORTEXT, cData);
        }
    });
    this.socket.on(CENUMS.GUESTLOGIN, function (d) {
        console.log(d);
        var cData = {}
        if (that.user){return;}
        try{
            d[CENUMS.USER] = d[CENUMS.USER].toLowerCase();
            var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
            var params = {
                TableName: 'users',
                Key: {
                    username: d[CENUMS.USER]
                }
            }
            docClient.get(params, function(err, data) {
                if (err) {
                } else {
                    console.log("Attempting guest logon...");
                    if (d[CENUMS.USER].length >= 3 && d[CENUMS.USER].length <= 16 && typeof data.Item == 'undefined' && typeof that.engine.users[d[CENUMS.USER]] == 'undefined'){
                        console.log('valid username - adding guest');
                        var u = {
                            username: d[CENUMS.USER],
                            guest: true
                        };
                        that.user = User();
                        that.user.setOwner(that);
                        that.user.init(u);
                        that.engine.users[d[CENUMS.USER]] = that.user;
                        that.engine.queuePlayer(that,CENUMS.LOGGEDIN, {name:d[CENUMS.USER], characters: that.user.characters});
                    }else if (typeof data.Item != 'undefined' || typeof that.engine.users[d[CENUMS.USER]] != 'undefined'){
                        cData[CENUMS.TEXT] = CENUMS.PWERRORUSEREXISTS;
                        that.engine.queuePlayer(that,CENUMS.SETLOGINERRORTEXT, cData);
                    }else{
                        cData[CENUMS.TEXT] = CENUMS.PWERRORSNLENGTH;
                        that.engine.queuePlayer(that,CENUMS.SETLOGINERRORTEXT, cData);
                    }
                }
            });
        }catch(e){
            console.log('error creating user');
            console.log(e.stack);
        }
    });
    this.socket.on(CENUMS.CREATEUSER, function (d) {
        console.log(d);
        if (that.user){return;}
        var cData = {};
        try{
            d[CENUMS.USER] = d[CENUMS.USER].toLowerCase();
            if (typeof that.engine.users[d[CENUMS.USER]] == 'undefined'){
                var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                var params = {
                    TableName: 'users',
                    Key: {
                        username: d[CENUMS.USER]
                    }
                };
                docClient.get(params, function(err, data) {
                    if (err) {
                        console.error("Unable to find user. Error JSON:", JSON.stringify(err, null, 2));
                    } else {
                        //check password lengths, and if item exists
                        var cData = {};
                        console.log("Create user succeeded:", JSON.stringify(data, null, 2));
                        if (d[CENUMS.USER].length >= 3 && d[CENUMS.USER].length <= 16 && d[CENUMS.PASSWORD].length >= 6 && typeof data.Item == 'undefined'){
                            console.log('valid account info - creating account');
                            //first, initialize the user data
                            var params2 = {
                                TableName: 'blaine_userdata',
                                Item: {
                                    'username': d[CENUMS.USER],
                                    'characters': {},
                                }
                            }
                            docClient.put(params2, function(err, data2) {
                                if (err) {
                                    console.error("Unable to add user data. Error JSON:", JSON.stringify(err, null, 2));
                                } else {
                                    console.log("Create userdata succeeded:", JSON.stringify(data2, null, 2));
                                    //hash the password
                                    const hash = crypto.createHmac('sha256', d[CENUMS.PASSWORD]);
                                    var u = {
                                        username: d[CENUMS.USER],
                                        password: hash.digest('hex')
                                    };
                                    that.user = User();
                                    that.user.setOwner(that);
                                    that.user.init(u);
                                    that.engine.users[d[CENUMS.USER]] = that.user;
                                    cData[CENUMS.NAME] = d[CENUMS.USER];
                                    cData[CENUMS.CHARACTERS] = that.user.characters;
                                    that.engine.queuePlayer(that,CENUMS.LOGGEDIN, cData);
                                    var params3 = {
                                        TableName: 'users',
                                        Item: {
                                            'username': d[CENUMS.USER],
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
                            cData[CENUMS.TEXT] = CENUMS.PWERRORUSEREXISTS;
                            that.engine.queuePlayer(that,CENUMS.SETLOGINERRORTEXT, cData);
                        }else if (d[CENUMS.USER].length < 3 || d[CENUMS.USER].length > 16){
                            cData[CENUMS.TEXT] = CENUMS.PWERRORSNLENGTH;
                            that.engine.queuePlayer(that,CENUMS.SETLOGINERRORTEXT, cData);
                        }else if (d[CENUMS.PASSWORD].length < 8 || d[CENUMS.PASSWORD].length > 16){
                            cData[CENUMS.TEXT] = CENUMS.PWERRORPLENGTH;
                            that.engine.queuePlayer(that,CENUMS.SETLOGINERRORTEXT, cData);
                        }
                    }
                });
            }else{
                //user exists
                cData[CENUMS.TEXT] = CENUMS.PWERRORUSEREXISTS;
                that.engine.queuePlayer(that,CENUMS.SETLOGINERRORTEXT, cData);
            }
        }catch(e){
            console.log('error creating user');
            console.log(e.stack);
        }
    });
};

exports.Player = Player;
