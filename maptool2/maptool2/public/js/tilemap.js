

(function(window) {

    var TileMap = function(){
        this.TILE_SIZE = 32;
        this.SECTOR_TILES = 21;

        this.scene = mainObj.game.scene.getScene('MapGen');

        this.worldContainer = this.scene.add.container();
        this.worldPrimitives = this.scene.add.graphics();
        this.tileIndex = {};

        this.moveSpeed = 400;
        this.moveVector =  new Phaser.Math.Vector2(0,0);
        this.newX = 0;
        this.newY = 0;
        this.oldX = 0;
        this.oldY = 0;
        this.horizontalTiles = Math.floor(1920/this.TILE_SIZE+1);
        this.verticalTiles = Math.floor(1080/this.TILE_SIZE+1);
    };

    TileMap.prototype.init = function(data) {
        if (data.mapid == ''){
            this.fullSectorSize = this.TILE_SIZE*this.SECTOR_TILES;
            this.sectors = {};
            var s = this.getSector(0,0);
        }else{
            this.name = data.mapid;
            this.fullSectorSize = this.TILE_SIZE*this.SECTOR_TILES;
            this.sectors = {};
            for (var sector in data.mapData){
                //init sectors;
                var sectorCoords = this.getXY(sector);
                var s = this.getSector(sectorCoords.x*this.fullSectorSize,sectorCoords.y*this.fullSectorSize,data.mapData[sector]);
            }
        }
        for (var i = 0; i < this.horizontalTiles;i++){
            if (typeof this.tileIndex[i] == 'undefined'){
                continue;
            }
            for (var j = 0; j < this.verticalTiles;j++){
                if (typeof this.tileIndex[i][j] == 'undefined'){
                    continue;
                }else{
                    this.tileIndex[i][j].setSprite();
                }
            }
        }
        this.newTile = this.tileIndex[0][0];
        this.oldTile = this.tileIndex[0][0];
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
        this.worldContainer.x += x;
        this.worldContainer.y += y;
        this.worldPrimitives.x += x;
        this.worldPrimitives.y += y;
        this.newX = Math.floor((this.worldContainer.x*-1)/this.TILE_SIZE);
        this.newY = Math.floor((this.worldContainer.y*-1)/this.TILE_SIZE);
        //update visible tiles
        x = this.newX-this.oldX;
        y = this.newY-this.oldY;
        if (x < 0){//moved to the left
            for (var i = x;i < 0;i++){
                for (var j = -this.verticalTiles;j <= this.verticalTiles;j++){
                    var tile = this.getTileAt(this.oldX+i,this.oldY+j);
                    if (tile){tile.setSprite();}
                    var tile2 = this.getTileAt(this.horizontalTiles+this.newX+Math.abs(i),this.oldY+j);
                    if (tile2){tile2.destroy()}
                }
            }
        }else if (x > 0){//moved to the right
            for (var i = x;i > 0;i--){
                for (var j = -this.verticalTiles;j <= this.verticalTiles;j++){
                    var tile = this.getTileAt(this.horizontalTiles+this.oldX+i,this.oldY+j);
                    if (tile){tile.setSprite();}
                    var tile2 = this.getTileAt(-this.horizontalTiles+this.newX-i,this.oldY+j);
                    if (tile2){tile2.destroy()}
                }
            }
        }
        if (y < 0){//moved up
            for (var i = y;i < 0;i++){
                for (var j = -this.horizontalTiles;j <= this.horizontalTiles;j++){
                    var tile = this.getTileAt(this.newX+j,this.oldY+i);
                    if (tile){tile.setSprite()}
                    var tile2 = this.getTileAt(this.newX+j,this.newY+this.verticalTiles+Math.abs(i));
                    if (tile2){tile2.destroy()}
                }
            }
        }else if (y > 0){//moved down
            for (var i = y;i > 0;i--){
                for (var j = -this.horizontalTiles;j <= this.horizontalTiles;j++){
                    var tile = this.getTileAt(this.newX+j,this.verticalTiles+this.oldY+i);
                    if (tile){tile.setSprite()}
                    var tile2 = this.getTileAt(this.newX+j,this.newY-this.verticalTiles-i);
                    if (tile2){tile2.destroy()}
                }
            }
        }
        this.oldX = this.newX;
        this.oldY = this.newY;
    };

    TileMap.prototype.deleteSector = function(x,y){
        try{
            var sector = this.sectors[x+'x'+y];
            for (var i = 0; i < sector.tiles.length;i++){
                for (var j = 0; j < sector.tiles[i].length;j++){
                    if (sector.tiles[i][j].sprite){
                        this.worldContainer.remove(sector.tiles[i][j].sprite);
                    }
                    if (sector.tiles[i][j].overlaySprite){
                        this.worldContainer.remove(sector.tiles[i][j].overlaySprite);
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

    };

    TileMap.prototype.reDraw = function(){
        this.worldPrimitives.clear();
        for (var i in this.sectors){
            sector = this.sectors[i];
            this.drawLines(sector);
        }
    };

    TileMap.prototype.drawLines = function(sector){
        var zoom = this.scene.ZOOM_SETTINGS[this.scene.currentZoomSetting];
        //draw lines
        this.worldPrimitives.lineStyle(1,0xFF0000,0.5);
        console.log(zoom);
        console.log(sector);

        for (var i = 0;i <= this.SECTOR_TILES;i++){
            this.worldPrimitives.moveTo(sector.pos[0]*zoom + this.TILE_SIZE*i*zoom,sector.pos[1]*zoom);
            this.worldPrimitives.lineTo(sector.pos[0]*zoom + this.TILE_SIZE*i*zoom,sector.pos[1]*zoom+this.fullSectorSize*zoom);
        }

        for (var i = 0;i <= this.SECTOR_TILES;i++){
            this.worldPrimitives.moveTo(sector.pos[0]*zoom,sector.pos[1]*zoom + this.TILE_SIZE*i*zoom);
            this.worldPrimitives.lineTo(sector.pos[0]*zoom+this.fullSectorSize*zoom,sector.pos[1]*zoom + this.TILE_SIZE*i*zoom);
        }
    };
    TileMap.prototype.update = function(deltaTime){
        this.move(this.moveVector.x*this.moveSpeed*deltaTime,this.moveVector.y*this.moveSpeed*deltaTime);
    };
    TileMap.prototype.addTileAt = function(tile,x,y){
        if (typeof this.tileIndex[x] == 'undefined'){
            this.tileIndex[x] = {};
        }
        this.tileIndex[x][y] = tile;
    };
    TileMap.prototype.getTileAt = function(x,y){
        if (typeof this.tileIndex[x] == 'undefined'){
            return null;
        }
        if (typeof this.tileIndex[x][y] == 'undefined'){
            return null;
        }
        return this.tileIndex[x][y];
    };

    window.TileMap = TileMap;
})(window);


(function(window) {

    var Tile = function(){
        this.scene = mainObj.game.scene.getScene('MapGen');
        this.map = this.scene.map;
    };

    Tile.prototype.init =  function(data){
        try{
            this.sectorId = data.sectorId; //id of the sector containing the sprite
            this.x = data.x;
            this.y = data.y;
            this.resource = data.resource; //the graphics resource used
            this.sprite = null;
            this.open = data.open
            this.overlayResource = data.overlayResource;
            this.overlaySprite = null; //2nd layer sprite
            this.triggers = data.triggers;
            let secCoords = this.map.getXY(this.sectorId);
            this.pos = {
                x: secCoords.x*this.map.fullSectorSize+this.x*this.map.TILE_SIZE,
                y: secCoords.y*this.map.fullSectorSize+this.y*this.map.TILE_SIZE
            }
            this.map.addTileAt(this,secCoords.x*this.map.SECTOR_TILES+this.x,secCoords.y*this.map.SECTOR_TILES+this.y);

            /*this.setSprite(this.resource);
            if (data.overlayResource){
                this.setOverlaySprite(data.overlayResource);
            }*/
        }catch(e){
            console.log("failed to init Tile");
            console.log(e);
        }
    };
    Tile.prototype.setResource = function(resource){
        this.resource = resource;
        this.setSprite();
    }
    Tile.prototype.setOverlayResource = function(resource){
        this.overlayResource = resource;
        this.setSprite();
    }
    Tile.prototype.setSprite = function(){
        if (this.map.worldContainer.exists(this.sprite)){
            this.map.worldContainer.remove(this.sprite);
            this.sprite.destroy();
        }
        if (this.scene.animations[this.resource]){
            this.sprite = this.scene.add.sprite(0,0,'sprites','1x1.png').play(this.resource);
        }else{
            this.sprite = this.scene.add.sprite(0,0,'sprites',this.resource + '.png');
        }
        this.sprite.x = this.pos.x;
        this.sprite.y = this.pos.y;
        this.sprite.setScale(2,2);
        this.map.worldContainer.add(this.sprite);
        this.setOverlaySprite();
    };

    Tile.prototype.setOverlaySprite = function(){
        if (!this.overlayResource){
            return;
        }
        if (this.map.worldContainer.exists(this.overlaySprite)){
            this.map.worldContainer.remove(this.overlaySprite);
            this.overlaySprite.destroy();
        }
        this.overlaySprite = this.scene.add.sprite(0,0,'sprites',this.overlayResource + '.png');
        this.overlaySprite.x = this.pos.x;
        this.overlaySprite.y = this.pos.y;
        this.overlaySprite.setScale(2,2);
        this.overlaySprite.alpha = 0.5;
        this.map.worldContainer.add(this.overlaySprite);
    };
    Tile.prototype.destroy = function(){

        if (this.map.worldContainer.exists(this.overlaySprite)){
            this.map.worldContainer.remove(this.overlaySprite);
            this.overlaySprite.destroy();
        }
        if (this.map.worldContainer.exists(this.sprite)){
            this.map.worldContainer.remove(this.sprite);
            this.sprite.destroy();
        }
    }
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
