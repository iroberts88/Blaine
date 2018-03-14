
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
        Graphics.worldContainer.position.x += x/2;
        Graphics.worldContainer.position.y += y/2;
        Graphics.worldPrimitives.position.x = Graphics.worldContainer.position.x;
        Graphics.worldPrimitives.position.y = Graphics.worldContainer.position.y;
    }

    TileMap.prototype.createSector = function(x,y){
        //creates a new sector
        //adds it to the sectors list at 'xxy'
        var sArray = []; 
        for (var i = 0; i < this.SECTOR_TILES; i++){
            var arr = [];
            for (var j = 0; j < this.SECTOR_TILES; j++){
                var newTile = new Tile();
                newTile.init({
                    sectorId: x + 'x' + y,
                    x: j,
                    y: i,
                    resource: this.defaultTile,
                    open: false
                });
                newTile.sprite.position.x = x*this.fullSectorSize + j*this.TILE_SIZE;
                newTile.sprite.position.y = y*this.fullSectorSize + i*this.TILE_SIZE;
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
