
(function(window) {

    var TileMap = function(){
        this.TILE_SIZE = 32;
        this.SECTOR_TILES = 21;
    };

    TileMap.prototype.init = function(data) {
        if (typeof data.name == 'undefined'){
            this.fullSectorSize = this.TILE_SIZE*this.SECTOR_TILES;
            this.sectors = {};
            this.defaultTile = data.dTile; //black tile??
            var s = this.getSector(0,0);
        }else{
            this.name = data.name;
        }
    };

    TileMap.prototype.getSector = function(x,y){
        //gets the sector at position x,y
        var xPos = Math.floor(x/this.fullSectorSize);
        var yPos = Math.floor(y/this.fullSectorSize);
        //if sector does not exist, create one
        if (typeof this.sectors[xPos + 'x' + yPos] == 'undefined'){
            this.createSector(xPos,yPos);
        }
        return this.sectors[xPos,yPos];
    };

    TileMap.prototype.move = function(x,y){
        Graphics.world.position.x += x/2;
        Graphics.world.position.y += y/2;
    }

    TileMap.prototype.createSector = function(x,y){
        //creates a new sector
        //adds it to the sectors list at 'xxy'
        if (typeof this.sectors[x+'x'+y] != 'undefined'){return;}
        var sArray = []; 
        for (var i = 0; i < this.SECTOR_TILES; i++){
            var arr = [];
            for (var j = 0; j < this.SECTOR_TILES; j++){
                var newTile = new Tile();
                newTile.init({
                    sectorId: x + 'x' + y,
                    x: i,
                    y: y,
                    resource: this.defaultTile,
                    open: false
                });
                newTile.sprite.position.x = x*this.fullSectorSize + i*this.TILE_SIZE;
                newTile.sprite.position.y = y*this.fullSectorSize + j*this.TILE_SIZE;
                Graphics.worldContainer.addChild(newTile.sprite);
                arr.push(newTile);
            }
            sArray.push(arr);
        }

        var sector = {
            tiles: sArray,
            x: x,
            y: y,
            pos: [x*this.fullSectorSize,y*this.fullSectorSize]
        }

        //draw lines
        Graphics.worldPrimitives.lineStyle(3,0xFF0000,0.5)
        Graphics.worldPrimitives.moveTo(sector.pos[0],sector.pos[1]);
        Graphics.worldPrimitives.lineTo(sector.pos[0]+this.fullSectorSize,sector.pos[1]);
        Graphics.worldPrimitives.lineTo(sector.pos[0]+this.fullSectorSize,sector.pos[1]+this.fullSectorSize);
        Graphics.worldPrimitives.lineTo(sector.pos[0],sector.pos[1]+this.fullSectorSize);
        Graphics.worldPrimitives.lineTo(sector.pos[0],sector.pos[1]);


        Graphics.worldPrimitives.lineStyle(1,0xFF0000,0.5);
        for (var i = 1;i < this.SECTOR_TILES;i++){
            Graphics.worldPrimitives.moveTo(sector.pos[0] + this.TILE_SIZE*i,sector.pos[1]);
            Graphics.worldPrimitives.lineTo(sector.pos[0] + this.TILE_SIZE*i,sector.pos[1]+this.fullSectorSize);
        }

        for (var i = 1;i < this.SECTOR_TILES;i++){
            Graphics.worldPrimitives.moveTo(sector.pos[0],sector.pos[1] + this.TILE_SIZE*i);
            Graphics.worldPrimitives.lineTo(sector.pos[0]+this.fullSectorSize,sector.pos[1] + this.TILE_SIZE*i);
        }
        this.sectors[x + 'x' + y] = sector;
    };

    TileMap.prototype.getTile = function(){
        //defaults to mouse position
        try{
            var mX = (Acorn.Input.mouse.X / Graphics.actualRatio[0]) - Graphics.world.position.x;
            var mY = (Acorn.Input.mouse.Y / Graphics.actualRatio[1]) - Graphics.world.position.y;

            var sectorX = Math.floor(mX/(this.SECTOR_TILES*this.TILE_SIZE));
            var sectorY = Math.floor(mY/(this.SECTOR_TILES*this.TILE_SIZE));

            var mTX = mX - sectorX*(this.SECTOR_TILES*this.TILE_SIZE);
            var mTY = mY - sectorY*(this.SECTOR_TILES*this.TILE_SIZE);
            var tileX = Math.floor(mTX/(this.TILE_SIZE));
            var tileY = Math.floor(mTY/(this.TILE_SIZE));
            return this.sectors[sectorX + 'x' + sectorY].tiles[tileX][tileY];
        }catch(e){
            console.log(e);
            return 'none';
        }
    }
    TileMap.prototype.update = function(deltaTime){

    };

    window.TileMap = TileMap;
})(window);


(function(window) {

    var Tile = function(){
    };

    Tile.prototype.init =  function(data){
        try{
            this.sectorId = data.sectorId; //id of the sector containing the sprite
            this.x = data.x;
            this.y = data.y;
            this.resource = data.resource; //the graphics resource used
            this.sprite = Graphics.getSprite(data.resource); //tile sprite
            this.sprite.scale.x = 2;
            this.sprite.scale.y = 2;
            this.open = true; //tile is open for movement

            this.overlaySprite = null; //2nd layer sprite
            this.moveTrigger = null; //tile triggers an event when stepped on
            this.interactTrigger = null;//tile triggers an event when interacted with
        }catch(e){
            console.log("failed to init Tile");
            console.log(e);
        }
    }

    window.Tile = Tile;
})(window);
