
(function(window) {
    var PlayerCharacter = function(){

        this.SPEED = 0.25;//time it takes in seconds to reach next tile
        this.sector = null;
        this.tile = null;
        this.name = null;
        this.animateInfo = null;
        this.moving = false;
        this.owTexture = null;
        this.targetPosition = null;
        this.startPosition = null;
        this.moveTicker = 0;
        this.moveQueue = [];

        this.nameDistance = mainObj.TILE_SIZE-2;

        this.remove = false;

        this.sayBubble = null;
        this.sayBubbleTicker = 0;
        this.sayBubbleDuration = 5.0;
    }

    PlayerCharacter.prototype.init = function(data){
        this.id = data.id;
		this.name = data.name;
		this.sector = data.sector;
		this.tile = data.tile;
        this.owTexture = data.owSprite;
        this.sprite = Graphics.getSprite('ow_' + this.owTexture + '_d1');
        this.sprite2 = Graphics.getSprite('ow_' + this.owTexture + '_d1');
        this.sprite.scale.x = mainObj.GAME_SCALE;
        this.sprite.scale.y = mainObj.GAME_SCALE;
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.sprite2.scale.x = mainObj.GAME_SCALE;
        this.sprite2.scale.y = mainObj.GAME_SCALE;
        this.sprite2.anchor.x = 0.5;
        this.sprite2.anchor.y = 0.5;
        
        var coords = Game.getSectorXY(this.sector);
        this.sprite.position.x = (mainObj.TILE_SIZE/2) + Game.map[this.sector].fullSectorSize*coords.x + mainObj.TILE_SIZE*this.tile[0];
        this.sprite.position.y = (mainObj.TILE_SIZE/2) - (mainObj.TILE_SIZE/4) +Game.map[this.sector].fullSectorSize*coords.y + mainObj.TILE_SIZE*this.tile[1];
        this.sprite2.position.x = this.sprite.position.x;
        this.sprite2.position.y = this.sprite.position.y;
        
        this.playerMask = new PIXI.Graphics();
        this.playerMask.beginFill(0xFFFFFF,1);
        this.playerMask.drawRect(0,0,mainObj.TILE_SIZE,mainObj.TILE_SIZE*0.75);
        this.playerMask.endFill();
        this.playerMask.position.x = this.sprite.position.x - mainObj.TILE_SIZE/2;
        this.playerMask.position.y = this.sprite.position.y - mainObj.TILE_SIZE/2;
        this.sprite2.mask = this.playerMask;

        this.nameTag = new PIXI.Text(data.name.toUpperCase(),AcornSetup.nameStyle);
        this.nameTag.anchor.x = 0.5;
        this.nameTag.anchor.y = 0.5;
        this.nameTag.position.x = (mainObj.TILE_SIZE/2)+Game.map[this.sector].fullSectorSize*coords.x + mainObj.TILE_SIZE*this.tile[0];
        this.nameTag.position.y = (mainObj.TILE_SIZE/4)+Game.map[this.sector].fullSectorSize*coords.y + mainObj.TILE_SIZE*this.tile[1] - this.nameDistance;

        Graphics.worldContainer.addChild(this.sprite);
        Graphics.worldContainer.addChild(this.sprite2);
        Graphics.worldContainer.addChild(this.playerMask);
        Graphics.worldContainer.addChild(this.nameTag);
        this.animateInfo = {
            ticker: 0,
            swapEvery: 0.15,
            direction: 'd',
            phase: 1,
            stopped: true
        }
    };

    PlayerCharacter.prototype.move = function(x,y){
        //attempt to move in the target direction
        if (this.moving){return;}
        var tile = Game.map.getTileAtPC(this,x,y);
        if (tile.open && (tile.resource != 'deep_water' && tile.resource != 'water')){
            if (tile.resource == '1x1' && Graphics.worldContainer.getChildIndex(tile.sprite) < Graphics.worldContainer.getChildIndex(this.sprite2)){
                Graphics.worldContainer.removeChild(tile.sprite);
                Graphics.worldContainer.addChild(tile.sprite);
                Game.resetTopSprites()
            }
            this.tile[0] = tile.x;
            this.tile[1] = tile.y;
            this.sector = tile.sectorid;
            this.moving = true;
            if (x == 0 && y == 1){
                this.animateInfo.direction = 'd';
            }
            if (x == 0 && y == -1){
                this.animateInfo.direction = 'u';
            }
            if (x == 1 && y == 0){
                this.animateInfo.direction = 'r';
            }
            if (x == -1 && y == 0){
                this.animateInfo.direction = 'l';
            }
            this.targetPosition = {
                x: this.sprite.position.x + mainObj.TILE_SIZE*x,
                y: this.sprite.position.y + mainObj.TILE_SIZE*y
            };
            this.startPosition = {
                x: this.sprite.position.x,
                y: this.sprite.position.y
            };
            this.moveTicker = 0;
            this.animateInfo.ticker = this.animateInfo.swapEvery;
        }
    };

    PlayerCharacter.prototype.update = function(dt){
        this.animate(dt);

        if (this.remove && this.moveQueue.length == 0){
            Game._removePC({id:this.id});
        }
        if (this.moving){
            this.moveTicker += dt;
            if (this.moveTicker >= this.SPEED){
                this.sprite.position.x = this.targetPosition.x;
                this.sprite.position.y = this.targetPosition.y;
                this.sprite2.position.x = this.targetPosition.x;
                this.sprite2.position.y = this.targetPosition.y;
                this.playerMask.position.x = this.sprite.position.x - mainObj.TILE_SIZE/2;
                this.playerMask.position.y = this.sprite.position.y - mainObj.TILE_SIZE/2;
                this.nameTag.position.x = this.targetPosition.x;
                this.nameTag.position.y = this.targetPosition.y-this.nameDistance;
                this.moving = false;
                this.moveQueue.shift();
                if (this.moveQueue.length == 0){
                    var dir = this.animateInfo.direction;
                    if (dir == 'r'){dir = 'l'}
                    this.sprite.texture = Graphics.getResource('ow_' + this.owTexture + '_' + dir + '1');
                    this.sprite2.texture = Graphics.getResource('ow_' + this.owTexture + '_' + dir + '1');
                }
            }else{
                var dX = (this.targetPosition.x - this.startPosition.x)*(this.moveTicker/this.SPEED);
                var dY = (this.targetPosition.y - this.startPosition.y)*(this.moveTicker/this.SPEED);
                this.sprite.position.x = this.startPosition.x + dX;
                this.sprite.position.y = this.startPosition.y + dY;
                this.sprite2.position.x = this.startPosition.x + dX;
                this.sprite2.position.y = this.startPosition.y + dY;
                this.playerMask.position.x = this.sprite.position.x - mainObj.TILE_SIZE/2;
                this.playerMask.position.y = this.sprite.position.y - mainObj.TILE_SIZE/2;
                this.nameTag.position.x = this.startPosition.x + dX;
                this.nameTag.position.y = this.startPosition.y + dY-this.nameDistance;
            }
        }

        if (this.moveQueue.length > 0 && !this.moving){

            //if the length is greater than 3-5ish just move to the tile??

            //check if on correct tile
            if (this.tile[0] == this.moveQueue[0].start[0] && this.tile[1] == this.moveQueue[0].start[1]){
                //try to move
                this.move(this.moveQueue[0].x,this.moveQueue[0].y);
            }
        }

        if (this.sayBubble){
            this.sayBubble.position.x = this.sprite.position.x;
            this.sayBubble.position.y = this.nameTag.position.y - 15;
            this.sayBubbleTicker += dt;
            if (this.sayBubbleTicker >= this.sayBubbleDuration){
                Graphics.worldContainer.removeChild(this.sayBubble);
                this.sayBubble = null;
            }
        }
    };
    PlayerCharacter.prototype.setSayBubble = function(text){
        if (this.sayBubble){
            Graphics.worldContainer.removeChild(this.sayBubble);
            this.sayBubble = null;
        }
        var t = new PIXI.Text(this.name + ': ' + text,{
            font: '16px Pokemon',
            fill: 'black',
            align: 'left',
            wordWrap: true,
            wordWrapWidth: 300
        });
        var padding = 10;
        t.position.x = padding;
        t.position.y = padding;
        var gfx = new PIXI.Graphics();
        gfx.lineStyle(4,0x000000,1);
        gfx.beginFill(0xDCDCDC,1)
        gfx.drawRoundedRect(0,0,t.width + padding*2,t.height + padding*2,10);
        gfx.endFill();
        var cont = new PIXI.Container();
        cont.addChild(gfx);
        cont.addChild(t);
        var texture = PIXI.RenderTexture.create(t.width + padding*2,5+t.height + padding*2);
        var renderer = new PIXI.CanvasRenderer();
        Graphics.app.renderer.render(cont,texture);

        this.sayBubble = Graphics.makeUiElement({
            texture: texture,
            anchor: [0.5,1],
            position: [this.sprite.position.x,this.nameTag.position.y - 15]
        })
        Graphics.worldContainer.addChild(this.sayBubble);
        this.sayBubbleTicker = 0;
    };
    PlayerCharacter.prototype.animate = function(dt){
        var aI = this.animateInfo;
        if (this.moving){
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
                    this.sprite.texture = Graphics.getResource('ow_' + this.owTexture + '_' + animateDir + '1');
                    this.sprite2.texture = Graphics.getResource('ow_' + this.owTexture + '_' + animateDir + '1');
                    if (aI.direction == 'r'){
                        this.sprite.scale.x = -mainObj.GAME_SCALE;
                        this.sprite2.scale.x = -mainObj.GAME_SCALE;
                    }else{
                        this.sprite.scale.x = mainObj.GAME_SCALE;
                        this.sprite2.scale.x = mainObj.GAME_SCALE;
                    }
                }
                if (aI.phase == 2){
                    this.sprite.texture = Graphics.getResource('ow_' + this.owTexture + '_' + animateDir + '2');
                    this.sprite2.texture = Graphics.getResource('ow_' + this.owTexture + '_' + animateDir + '2');
                    if (aI.direction == 'r'){
                        this.sprite.scale.x = -mainObj.GAME_SCALE;
                        this.sprite2.scale.x = -mainObj.GAME_SCALE;
                    }else{
                        this.sprite.scale.x = mainObj.GAME_SCALE;
                        this.sprite2.scale.x = mainObj.GAME_SCALE;
                    }
                }
                if (aI.phase == 3){
                    this.sprite.texture = Graphics.getResource('ow_' + this.owTexture + '_' + animateDir + '1');
                    this.sprite2.texture = Graphics.getResource('ow_' + this.owTexture + '_' + animateDir + '1');
                    this.sprite.scale.x = mainObj.GAME_SCALE;
                    this.sprite2.scale.x = mainObj.GAME_SCALE;
                }
                if (aI.phase == 4){
                    this.sprite.texture = Graphics.getResource('ow_' + this.owTexture + '_' + animateDir + '2');
                    this.sprite2.texture = Graphics.getResource('ow_' + this.owTexture + '_' + animateDir + '2');
                    this.sprite.scale.x = -mainObj.GAME_SCALE;
                    this.sprite2.scale.x = -mainObj.GAME_SCALE;
                }
            }
        }
    }
    
    window.PlayerCharacter = PlayerCharacter;
})(window);
