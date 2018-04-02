
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

        this.nameDistance = 30;
    }

    PlayerCharacter.prototype.init = function(data){
        this.id = data.id;
		this.name = data.name;
		this.sector = data.sector;
		this.tile = data.tile;
        this.owTexture = data.owSprite;
        this.sprite = Graphics.getSprite('ow_' + this.owTexture + '_d1')
        this.sprite.scale.x = 2;
        this.sprite.scale.y = 2;
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        var coords = Game.getSectorXY(this.sector);
        this.sprite.position.x = 16+Game.map[this.sector].fullSectorSize*coords.x + 32*this.tile[0];
        this.sprite.position.y = 8+Game.map[this.sector].fullSectorSize*coords.y + 32*this.tile[1];

        this.sprite2 = new PIXI.Text(data.name,AcornSetup.nameStyle);
        this.sprite2.anchor.x = 0.5;
        this.sprite2.anchor.y = 0.5;
        this.sprite2.position.x = 16+Game.map[this.sector].fullSectorSize*coords.x + 32*this.tile[0];
        this.sprite2.position.y = 8+Game.map[this.sector].fullSectorSize*coords.y + 32*this.tile[1] - this.nameDistance;

        Graphics.worldContainer.addChild(this.sprite);
        Graphics.worldContainer.addChild(this.sprite2);
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
            console.log('here?3');
        if (this.moving){return;}
        var tile = Game.map.getTileAtPC(this,x,y);
            console.log('here?2');
        if (tile.open && (tile.resource != 'deep_water' && tile.resource != 'water')){
            console.log('here?');
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
                x: this.sprite.position.x + 32*x,
                y: this.sprite.position.y + 32*y
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
        if (this.moving){
            this.moveTicker += dt;
            if (this.moveTicker >= this.SPEED){
                this.sprite.position.x = this.targetPosition.x;
                this.sprite.position.y = this.targetPosition.y;
                this.sprite2.position.x = this.targetPosition.x;
                this.sprite2.position.y = this.targetPosition.y-this.nameDistance;
                this.moving = false;
                this.moveQueue.shift();
                if (this.moveQueue.length == 0){
                    var dir = this.animateInfo.direction;
                    if (dir == 'r'){dir = 'l'}
                    this.sprite.texture = Graphics.getResource('ow_' + this.owTexture + '_' + dir + '1');
                }
            }else{
                var dX = (this.targetPosition.x - this.startPosition.x)*(this.moveTicker/this.SPEED);
                var dY = (this.targetPosition.y - this.startPosition.y)*(this.moveTicker/this.SPEED);
                this.sprite.position.x = this.startPosition.x + dX;
                this.sprite.position.y = this.startPosition.y + dY;
                this.sprite2.position.x = this.startPosition.x + dX;
                this.sprite2.position.y = this.startPosition.y + dY-this.nameDistance;
            }
        }

            console.log('here?6');
        if (this.moveQueue.length > 0 && !this.moving){

            //if the length is greater than 3-5ish just move to the tile??

            //check if on correct tile

            console.log('here?5');
            if (this.tile[0] == this.moveQueue[0].start[0] && this.tile[1] == this.moveQueue[0].start[1]){
                //try to move

            console.log('here?4');
                this.move(this.moveQueue[0].x,this.moveQueue[0].y);
            }
        }
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
                    if (aI.direction == 'r'){
                        this.sprite.scale.x = -2;
                    }else{
                        this.sprite.scale.x = 2;
                    }
                }
                if (aI.phase == 2){
                    this.sprite.texture = Graphics.getResource('ow_' + this.owTexture + '_' + animateDir + '2');
                    if (aI.direction == 'r'){
                        this.sprite.scale.x = -2;
                    }else{
                        this.sprite.scale.x = 2;
                    }
                }
                if (aI.phase == 3){
                    this.sprite.texture = Graphics.getResource('ow_' + this.owTexture + '_' + animateDir + '1');
                    this.sprite.scale.x = 2;
                }
                if (aI.phase == 4){
                    this.sprite.texture = Graphics.getResource('ow_' + this.owTexture + '_' + animateDir + '2');
                    this.sprite.scale.x = -2;
                }
            }
        }
    }
    
    window.PlayerCharacter = PlayerCharacter;
})(window);
