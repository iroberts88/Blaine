
(function(window) {
    Player = {
    	userData: null,
    	character: null,
        animateInfo: null,
        moving: false,
        owTexture: 'ash',
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
        	this.character = {
        		name: data.name,
        		rival: data.rival,
        		money: data.money,
        		sector: data.sector,
        		tile: data.tile,
                sprite: Graphics.getSprite('ow_' + this.owTexture + '_d1'),
                map: data.map
        	};
            this.character.sprite.scale.x = 2;
            this.character.sprite.scale.y = 2;
            this.character.sprite.anchor.x = 0.5;
            this.character.sprite.anchor.y = 0.5;
            this.character.sprite.position.x = Graphics.width/2;
            this.character.sprite.position.y = Graphics.height/2-8;
            Graphics.world.addChild(this.character.sprite);
            this.animateInfo = {
                ticker: 0,
                swapEvery: 0.15,
                direction: 'd',
                phase: 1,
                stopped: true
            }
        },
        move: function(x,y){
            //attempt to move in the target direction
            if (this.moving){return;}
            if (Game.screenChange){return;}
            var tile = Game.map.getTileAt(x,y);
            this.targetTile = tile;
            var currentTile = Game.map.getTileAt(0,0);
            if (x == 0 && y == 1){
                this.animateInfo.direction = 'd';
                var r = false;
                for (var i = 0; i < currentTile.triggers.length;i++){
                    var trigger = currentTile.triggers[i];
                    if (trigger.on == 'down'){
                        var ret = Triggers.doTrigger(trigger);
                        if (ret){r=true;}
                    }
                }
                if (r){
                    console.log('wut')
                    return;
                }
            }
            if (x == 0 && y == -1){
                this.animateInfo.direction = 'u';
                var r = false;
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
            if (x == 1 && y == 0){
                this.animateInfo.direction = 'r';
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
            if (x == -1 && y == 0){
                this.animateInfo.direction = 'l';
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
            if (tile.open && (tile.resource != 'deep_water' && tile.resource != 'water')){
                Acorn.Net.socket_.emit('playerUpdate',{command:'moveAttempt',x:x,y:y});
                this.character.tile[0] = tile.x;
                this.character.tile[1] = tile.y;
                this.character.sector = tile.sectorid;
                this.moving = true;
                this.targetPosition = {
                    x: Graphics.worldContainer.position.x + -32*x,
                    y: Graphics.worldContainer.position.y + -32*y
                };
                this.startPosition = {
                    x: Graphics.worldContainer.position.x,
                    y: Graphics.worldContainer.position.y
                };
                this.moveTicker = 0;
                this.animateInfo.ticker = this.animateInfo.swapEvery;
            }else{
                if (this.bumpTicker >= this.bumpcd){
                    Acorn.Sound.play('bump');
                    this.bumpTicker = 0;
                }
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
                        if (aI.direction == 'r'){
                            this.character.sprite.scale.x = -2;
                        }else{
                            this.character.sprite.scale.x = 2;
                        }
                    }
                    if (aI.phase == 2){
                        this.character.sprite.texture = Graphics.getResource('ow_' + this.owTexture + '_' + animateDir + '2');
                        if (aI.direction == 'r'){
                            this.character.sprite.scale.x = -2;
                        }else{
                            this.character.sprite.scale.x = 2;
                        }
                    }
                    if (aI.phase == 3){
                        this.character.sprite.texture = Graphics.getResource('ow_' + this.owTexture + '_' + animateDir + '1');
                        this.character.sprite.scale.x = 2;
                    }
                    if (aI.phase == 4){
                        this.character.sprite.texture = Graphics.getResource('ow_' + this.owTexture + '_' + animateDir + '2');
                        this.character.sprite.scale.x = -2;
                    }
                }
            }
        }
       
    }
    window.Player = Player;
})(window);
