
(function(window) {

    var TileMap = function(){
        this.TILE_SIZE = 32;
        this.SECTOR_TILES = 21;
    };

    TileMap.prototype.init = function(data) {
        if (MapGen.mapName == ''){
            this.fullSectorSize = this.TILE_SIZE*this.SECTOR_TILES;
            this.sectors = {};
            var s = this.getSector(0,0);
        }else{
            this.name = data.name;
            this.fullSectorSize = this.TILE_SIZE*this.SECTOR_TILES;
            this.sectors = {};
            console.log(data.mapData);
            for (var sector in data.mapData){
                //init sectors;
                console.log(sector);
                var sectorCoords = this.getXY(sector);
                var s = this.getSector(sectorCoords.x*this.fullSectorSize,sectorCoords.y*this.fullSectorSize,data.mapData[sector]);
            }
        }
    };
    TileMap.prototype.getXY = function(string){
        var x = '';
        var y = '';
        var coords = {};
        var onX = true;
        for (var i = 0; i < string.length;i++){
            if (string.charAt(i) == 'x'){
                onX = false;
                continue;
            }
            if (onX){
                x = x + string.charAt(i);
            }else{
                y = y + string.charAt(i);
            }
        }
        coords.x = parseInt(x);
        coords.y = parseInt(y);
        return coords;
    };
    TileMap.prototype.setSector = function(data){

    };
    TileMap.prototype.getSector = function(x,y,data){
        //gets the sector at position x,y
        var xPos = Math.floor(x/this.fullSectorSize);
        var yPos = Math.floor(y/this.fullSectorSize);
        //if sector does not exist, create one
        if (typeof this.sectors[xPos + 'x' + yPos] == 'undefined'){
            this.createSector(xPos,yPos,data);
        }
        return this.sectors[xPos,yPos];
    };

    TileMap.prototype.move = function(x,y){
        Graphics.worldContainer.position.x += x/2;
        Graphics.worldContainer.position.y += y/2;
        Graphics.worldPrimitives.position.x += x/2;
        Graphics.worldPrimitives.position.y += y/2;
    };

    TileMap.prototype.deleteSector = function(x,y){
        try{
            var sector = this.sectors[x+'x'+y];
            for (var i = 0; i < sector.tiles.length;i++){
                for (var j = 0; j < sector.tiles[i].length;j++){
                    if (sector.tiles[i][j].sprite){
                        Graphics.worldContainer.removeChild(sector.tiles[i][j].sprite);
                    }
                    if (sector.tiles[i][j].overlaySprite){
                        Graphics.worldContainer.removeChild(sector.tiles[i][j].overlaySprite);
                    }
                }
            }
            delete this.sectors[x+'x'+y];
        }catch(e){
            console.log(e);
        }
    };
    TileMap.prototype.createSector = function(x,y,data){
        console.log('creating sector ' + x + ',' + y)
        //creates a new sector
        //adds it to the sectors list at 'xxy'
        if (typeof this.sectors[x+'x'+y] != 'undefined'){return;}
        var sArray = []; 
        for (var i = 0; i < this.SECTOR_TILES; i++){
            var arr = [];
            for (var j = 0; j < this.SECTOR_TILES; j++){
                var newTile = new Tile();
                if (data){
                    var d = {}
                    d.x = i;
                    d.y = j;
                    d.sectorId = x + 'x' + y;
                    d.resource = data.tiles[i][j].resource;
                    d.open = (typeof data.tiles[i][j].open == 'undefined') ? 0 : data.tiles[i][j].open;
                    d.triggers = (typeof data.tiles[i][j].triggers == 'undefined') ? [] : data.tiles[i][j].triggers;
                    d.overlayResource = (typeof data.tiles[i][j].overlayResource == 'undefined') ? null : data.tiles[i][j].overlayResource;
                    newTile.init(d);
                }else{
                    newTile.init({
                        sectorId: x + 'x' + y,
                        x: i,
                        y: j,
                        resource: this.defaultTile,
                        open: true,
                        triggers: [],
                        overlayResource: 0
                    });
                }
                newTile.sprite.position.x = x*this.fullSectorSize + i*this.TILE_SIZE;
                newTile.sprite.position.y = y*this.fullSectorSize + j*this.TILE_SIZE;
                Graphics.worldContainer.addChild(newTile.sprite);
                if (newTile.overlaySprite){
                    newTile.overlaySprite.position.x = x*this.fullSectorSize + i*this.TILE_SIZE;
                    newTile.overlaySprite.position.y = y*this.fullSectorSize + j*this.TILE_SIZE;
                    Graphics.worldContainer.addChild(newTile.overlaySprite);
                }
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
        this.sectors[x + 'x' + y] = sector;

        this.drawLines(sector);
    };

    TileMap.prototype.reDraw = function(){
        Graphics.worldPrimitives.clear();
        for (var i in this.sectors){
            sector = this.sectors[i];
            this.drawLines(sector);
        }
    };

    TileMap.prototype.drawLines = function(sector){
        var zoom = MapGen.ZOOM_SETTINGS[MapGen.currentZoomSetting];
        //draw lines
        Graphics.worldPrimitives.lineStyle(1,0xFF0000,0.5);

        for (var i = 0;i <= this.SECTOR_TILES;i++){
            Graphics.worldPrimitives.moveTo(sector.pos[0]*zoom + this.TILE_SIZE*i*zoom,sector.pos[1]*zoom);
            Graphics.worldPrimitives.lineTo(sector.pos[0]*zoom + this.TILE_SIZE*i*zoom,sector.pos[1]*zoom+this.fullSectorSize*zoom);
        }

        for (var i = 0;i <= this.SECTOR_TILES;i++){
            Graphics.worldPrimitives.moveTo(sector.pos[0]*zoom,sector.pos[1]*zoom + this.TILE_SIZE*i*zoom);
            Graphics.worldPrimitives.lineTo(sector.pos[0]*zoom+this.fullSectorSize*zoom,sector.pos[1]*zoom + this.TILE_SIZE*i*zoom);
        }
    };
    TileMap.prototype.getTile = function(){
        //defaults to mouse position
        var zoom = MapGen.ZOOM_SETTINGS[MapGen.currentZoomSetting];
        try{
            var mX = (Acorn.Input.mouse.X / Graphics.actualRatio[0]) - Graphics.worldContainer.position.x;
            var mY = (Acorn.Input.mouse.Y / Graphics.actualRatio[1]) - Graphics.worldContainer.position.y;

            var sectorX = Math.floor(mX/(this.SECTOR_TILES*this.TILE_SIZE*zoom));
            var sectorY = Math.floor(mY/(this.SECTOR_TILES*this.TILE_SIZE*zoom));

            var mTX = mX - sectorX*(this.SECTOR_TILES*this.TILE_SIZE*zoom);
            var mTY = mY - sectorY*(this.SECTOR_TILES*this.TILE_SIZE*zoom);
            var tileX = Math.floor(mTX/(this.TILE_SIZE*zoom));
            var tileY = Math.floor(mTY/(this.TILE_SIZE*zoom));
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
            this.open = data.open

            this.overlayResource = data.overlayResource;
            this.overlaySprite = null; //2nd layer sprite
            if (this.overlayResource){
                this.overlaySprite = Graphics.getSprite(data.overlayResource); //tile sprite
                this.overlaySprite.scale.x = 2;
                this.overlaySprite.scale.y = 2;
                this.overlaySprite.alpha = 0.5;
            }
            this.triggers = data.triggers;
        }catch(e){
            console.log("failed to init Tile");
            console.log(e);
        }
    };

    Tile.prototype.setSprite = function(resource){
        try{
            Graphics.worldContainer.removeChild(this.sprite);
        }catch(e){}
        var posX = this.sprite.position.x;
        var posY = this.sprite.position.y;
        this.sprite = Graphics.getSprite(resource);
        this.sprite.position.x = posX;
        this.sprite.position.y = posY;
        this.sprite.scale.x = 2;
        this.sprite.scale.y = 2;
        Graphics.worldContainer.addChild(this.sprite);
        this.resource = resource;
        try{
            //check if sprite is above overlay
            if (Graphics.worldContainer.getChildIndex(this.sprite) > Graphics.worldContainer.getChildIndex(this.overlaySprite)){
                console.log('swapped');
                Graphics.worldContainer.swapChildren(this.sprite,this.overlaySprite);
            }
        }catch(e){
            console.log(e);
        }
    };

    Tile.prototype.setOverlaySprite = function(resource){
        try{
            //remove sprite if one exists
            Graphics.worldContainer.removeChild(this.overlaySprite);
        }catch(e){};
        var posX = this.sprite.position.x;
        var posY = this.sprite.position.y;
        this.overlaySprite = Graphics.getSprite(resource);
        this.overlaySprite.position.x = posX;
        this.overlaySprite.position.y = posY;
        this.overlaySprite.scale.x = 2;
        this.overlaySprite.scale.y = 2;
        this.overlaySprite.alpha = 0.5;
        Graphics.worldContainer.addChild(this.overlaySprite);
        this.overlayResource = resource;
    };
    Tile.prototype.getTileData = function(){
        var data = {}
        data.resource = this.resource;
        if (this.open){
            data.open =  true;
        }
        if (this.overlayResource){
            data.overlayResource = this.overlayResource;
        }
        if (this.triggers.length > 0){
            data.triggers = this.triggers;
        }
        return data;
    }
    window.Tile = Tile;
})(window);
