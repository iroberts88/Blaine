
(function(window) {
    Player = {
    	userData: null,
    	character: null,
        animateInfo: null,
        moving: false,
        owTexture: null,
        speed: 0.25,//time it takes in seconds to reach next tile
        targetPosition: null,
        targetTile: null,
        startPosition: null,
        moveTicker: 0,

        bumpcd: 0.35,
        bumpTicker: 0,

        init: function(data){
        	userData = data;
        },

        initCharacter: function(data){
            this.owTexture = data.owSprite;
        	this.character = {
        		name: data.name,
        		money: data.money,
        		sector: data.sector,
        		tile: data.tile,
                sprite: Graphics.getSprite('ow_' + this.owTexture + '_d1'),
                sprite2: Graphics.getSprite('ow_' + this.owTexture + '_d1'),
                map: data.map
        	};
            this.character.sprite.scale.x = mainObj.GAME_SCALE;
            this.character.sprite.scale.y = mainObj.GAME_SCALE;
            this.character.sprite.anchor.x = 0.5;
            this.character.sprite.anchor.y = 0.5;
            this.character.sprite2.scale.x = mainObj.GAME_SCALE;
            this.character.sprite2.scale.y = mainObj.GAME_SCALE;
            this.character.sprite2.anchor.x = 0.5;
            this.character.sprite2.anchor.y = 0.5;
            this.playerMask = new PIXI.Graphics();
            this.playerMask.beginFill(0xFFFFFF,1);
            this.playerMask.drawRect(0,0,mainObj.TILE_SIZE,mainObj.TILE_SIZE*0.75);
            this.playerMask.endFill();
            this.character.sprite2.mask = this.playerMask;
            this.resetPos();
            this.animateInfo = {
                ticker: 0,
                swapEvery: 0.15,
                direction: 'd',
                phase: 1,
                stopped: true
            }
        },
        resetPos: function(){
            var coords = Game.getSectorXY(this.character.sector);
            this.character.sprite.position.x = (mainObj.TILE_SIZE/2) + Game.map[this.character.sector].fullSectorSize*coords.x + mainObj.TILE_SIZE*this.character.tile[0];
            this.character.sprite.position.y = (mainObj.TILE_SIZE/2) - (mainObj.TILE_SIZE/4) + Game.map[this.character.sector].fullSectorSize*coords.y + mainObj.TILE_SIZE*this.character.tile[1];
            Graphics.worldContainer.addChild(this.character.sprite);
            this.character.sprite2.position.x = this.character.sprite.position.x;
            this.character.sprite2.position.y = this.character.sprite.position.y;
            Graphics.worldContainer.addChild(this.character.sprite2);
            this.playerMask.position.x = this.character.sprite.position.x - mainObj.TILE_SIZE/2;
            this.playerMask.position.y = this.character.sprite.position.y - mainObj.TILE_SIZE/2;
            Graphics.worldContainer.addChild(this.playerMask);
        },
        move: function(x,y,doTriggers){
            //attempt to move in the target direction
            if (this.moving){return;}
            if (Game.screenChange){return;}
            if (typeof doTriggers == 'undefined'){
                doTriggers = true;
            }
            var tile = Game.map.getTileAt(x,y);
            this.targetTile = tile;
            var currentTile = Game.map.getTileAt(0,0);
            if (x == 0 && y == 1){
                this.animateInfo.direction = 'd';
                if (doTriggers){
                    var r = false;
                    for (var i = 0; i < currentTile.triggers.length;i++){
                        var trigger = currentTile.triggers[i];
                        if (trigger.on == 'down'){
                            var ret = Triggers.doTrigger(trigger);
                            if (ret){r=true;}
                        }
                    }
                    if (r){
                        return;
                    }
                }
            }
            if (x == 0 && y == -1){
                this.animateInfo.direction = 'u';
                var r = false;
                if (doTriggers){
                    for (var i = 0; i < currentTile.triggers.length;i++){
                        var trigger = currentTile.triggers[i];
                        if (trigger.on == 'up'){
                            var ret = Triggers.doTrigger(trigger);
                            if (ret){r=true;}
                        }
                    }
                    if (r){
                        return;
                    }
                }
            }
            if (x == 1 && y == 0){
                this.animateInfo.direction = 'r';
                if (doTriggers){
                    var r = false;
                    for (var i = 0; i < currentTile.triggers.length;i++){
                        var trigger = currentTile.triggers[i];
                        if (trigger.on == 'right'){
                            var ret = Triggers.doTrigger(trigger);
                            if (ret){r=true;}
                        }
                    }
                    if (r){
                        return;
                    }
                }
            }
            if (x == -1 && y == 0){
                this.animateInfo.direction = 'l';
                if (doTriggers){
                    var r = false;
                    for (var i = 0; i < currentTile.triggers.length;i++){
                        var trigger = currentTile.triggers[i];
                        if (trigger.on == 'left'){
                            var ret = Triggers.doTrigger(trigger);
                            if (ret){r=true;}
                        }
                    }
                    if (r){
                        return;
                    }
                }
            }
            if (tile.open && (tile.resource != 'deep_water' && tile.resource != 'water')){
                //check for grass
                Game.map.changeVisibleSectors();
                if (tile.resource == '1x1' && Graphics.worldContainer.getChildIndex(tile.sprite) < Graphics.worldContainer.getChildIndex(this.character.sprite)){
                    Graphics.worldContainer.removeChild(tile.sprite);
                    Graphics.worldContainer.removeChild(this.character.sprite2);
                    Graphics.worldContainer.addChild(tile.sprite);
                    Graphics.worldContainer.addChild(this.character.sprite2);
                }
                Acorn.Net.socket_.emit('playerUpdate',{command:'moveAttempt',x:x,y:y});
                this.character.tile[0] = tile.x;
                this.character.tile[1] = tile.y;
                this.character.sector = tile.sectorid;
                this.moving = true;
                this.targetPosition = {
                    x: Graphics.worldContainer.position.x + -mainObj.TILE_SIZE*x,
                    y: Graphics.worldContainer.position.y + -mainObj.TILE_SIZE*y,
                    cX: this.character.sprite.position.x + mainObj.TILE_SIZE*x,
                    cY: this.character.sprite.position.y + mainObj.TILE_SIZE*y
                };
                this.startPosition = {
                    x: Graphics.worldContainer.position.x,
                    y: Graphics.worldContainer.position.y,
                    cX: this.character.sprite.position.x,
                    cY: this.character.sprite.position.y
                };
                this.moveTicker = 0;
                this.animateInfo.ticker = this.animateInfo.swapEvery;
            }else{
                if (this.bumpTicker >= this.bumpcd){
                    Acorn.Sound.play('bump');
                    this.bumpTicker = 0;
                }
                Game.map.sectorData = null;
            }
        },
        update: function(dt){
            this.animate(dt);
            if (this.bumpTicker < this.bumpcd){
                this.bumpTicker += dt;
            }
            if (this.moving){
                this.moveTicker += dt;
                if (this.moveTicker >= this.speed){
                    Graphics.worldContainer.position.x = this.targetPosition.x;
                    Graphics.worldContainer.position.y = this.targetPosition.y;
                    this.character.sprite.position.x = this.targetPosition.cX;
                    this.character.sprite.position.y = this.targetPosition.cY;
                    this.character.sprite2.position.x = this.targetPosition.cX;
                    this.character.sprite2.position.y = this.targetPosition.cY;
                    this.playerMask.position.x = this.character.sprite.position.x - mainObj.TILE_SIZE/2;
                    this.playerMask.position.y = this.character.sprite.position.y - mainObj.TILE_SIZE/2;
                    this.moving = false;
                    //DO ARRIVAL TRIGGER
                    for (var i = 0; i < this.targetTile.triggers.length;i++){
                        var trigger = this.targetTile.triggers[i];
                        if (trigger.on == 'arrival'){
                            Triggers.doTrigger(trigger);
                        }
                    }
                }else{
                    var dX = (this.targetPosition.x - this.startPosition.x)*(this.moveTicker/this.speed);
                    var dY = (this.targetPosition.y - this.startPosition.y)*(this.moveTicker/this.speed);
                    Graphics.worldContainer.position.x = this.startPosition.x + dX;
                    Graphics.worldContainer.position.y = this.startPosition.y + dY;
                    var dcX = (this.targetPosition.cX - this.startPosition.cX)*(this.moveTicker/this.speed);
                    var dcY = (this.targetPosition.cY - this.startPosition.cY)*(this.moveTicker/this.speed);
                    this.character.sprite.position.x = this.startPosition.cX + dcX;
                    this.character.sprite.position.y = this.startPosition.cY + dcY;
                    this.character.sprite2.position.x = this.startPosition.cX + dcX;
                    this.character.sprite2.position.y = this.startPosition.cY + dcY;
                    this.playerMask.position.x = this.character.sprite.position.x - mainObj.TILE_SIZE/2;
                    this.playerMask.position.y = this.character.sprite.position.y - mainObj.TILE_SIZE/2;
                }
            }
        },
        animate: function(dt){
            var dir = 'none'
            var aI = this.animateInfo;
            if (Acorn.Input.isPressed(Acorn.Input.Key.UP)){
                dir = 'u';
                aI.stopped = false;
            }else if (Acorn.Input.isPressed(Acorn.Input.Key.DOWN)){
                dir = 'd';
                aI.stopped = false;
            }else if (Acorn.Input.isPressed(Acorn.Input.Key.LEFT)){
                dir = 'l';
                aI.stopped = false;
            }else if (Acorn.Input.isPressed(Acorn.Input.Key.RIGHT)){
                dir = 'r';
                aI.stopped = false;
            }else if (!aI.stopped){
                if (this.moving == false){
                    aI.stopped = true;
                    aI.ticker = 0;
                    aI.phase = 1;
                    var stopDir = aI.direction
                    if (stopDir == 'r'){
                        stopDir = 'l';
                    }
                    this.character.sprite.texture = Graphics.getResource('ow_' + this.owTexture + '_' + stopDir + '1');
                    this.character.sprite2.texture = Graphics.getResource('ow_' + this.owTexture + '_' + stopDir + '1');
                }
            }
            if (dir != 'none' || this.moving){
                if (dir != aI.direction && !this.moving){
                    aI.direction = dir;
                }
                aI.ticker += dt;
                if (aI.ticker >= aI.swapEvery){
                    var animateDir = aI.direction;
                    if (animateDir == 'r'){
                        animateDir = 'l';
                    }
                    //next phase
                    aI.ticker -= aI.swapEvery;
                    aI.phase += 1;
                    if (aI.phase == 5){aI.phase = 1;}
                    if (aI.phase >= 3 && (aI.direction == 'l' || aI.direction == 'r')){aI.phase = 1;}
                    if (aI.phase == 1){
                        this.character.sprite.texture = Graphics.getResource('ow_' + this.owTexture + '_' + animateDir + '1');
                        this.character.sprite2.texture = Graphics.getResource('ow_' + this.owTexture + '_' + animateDir + '1');
                        if (aI.direction == 'r'){
                            this.character.sprite.scale.x = -mainObj.GAME_SCALE;
                            this.character.sprite2.scale.x = -mainObj.GAME_SCALE;
                        }else{
                            this.character.sprite.scale.x = mainObj.GAME_SCALE;
                            this.character.sprite2.scale.x = mainObj.GAME_SCALE;
                        }
                    }
                    if (aI.phase == 2){
                        this.character.sprite.texture = Graphics.getResource('ow_' + this.owTexture + '_' + animateDir + '2');
                        this.character.sprite2.texture = Graphics.getResource('ow_' + this.owTexture + '_' + animateDir + '2');
                        if (aI.direction == 'r'){
                            this.character.sprite.scale.x = -mainObj.GAME_SCALE;
                            this.character.sprite2.scale.x = -mainObj.GAME_SCALE;
                        }else{
                            this.character.sprite.scale.x = mainObj.GAME_SCALE;
                            this.character.sprite2.scale.x = mainObj.GAME_SCALE;
                        }
                    }
                    if (aI.phase == 3){
                        this.character.sprite.texture = Graphics.getResource('ow_' + this.owTexture + '_' + animateDir + '1');
                        this.character.sprite2.texture = Graphics.getResource('ow_' + this.owTexture + '_' + animateDir + '1');
                        this.character.sprite.scale.x = mainObj.GAME_SCALE;
                        this.character.sprite2.scale.x = mainObj.GAME_SCALE;
                    }
                    if (aI.phase == 4){
                        this.character.sprite.texture = Graphics.getResource('ow_' + this.owTexture + '_' + animateDir + '2');
                        this.character.sprite2.texture = Graphics.getResource('ow_' + this.owTexture + '_' + animateDir + '2');
                        this.character.sprite.scale.x = -mainObj.GAME_SCALE;
                        this.character.sprite2.scale.x = -mainObj.GAME_SCALE;
                    }
                }
            }
        }
       
    }
    window.Player = Player;
})(window);
