(function(window) {

    var GameMap = function(){
    };

    GameMap.prototype.init = function(data){
    	for (var s in data){
    		var sector = this.createSector(s,data[s]);
    		this[s] = sector;
    	}
    };

    GameMap.prototype.createSector = function(s,data){
    	var sector = new Sector();
    	sector.init(s,data);
    	return sector;
    };
    GameMap.prototype.getTileAt = function(x,y){
        try{
            var coords = getSectorXY(Player.character.sector);
            var tile = {
                x: Player.character.tile[0],
                y: Player.character.tile[1]
            }
            tile.x += x;
            tile.y += y;
            if (tile.x < 0){
                tile.x = 20;
                coords.x -= 1;
            }else if (tile.y < 0){
                tile.y = 20;
                coords.x += 1;
            }else if (tile.x > 20){
                tile.x = 0;
                coords.y -= 1;
            }else if (tile.y > 20){
                tile.y = 0;
                coords.y += 1;
            }
            console.log(coords);
            console.log(tile)
            return this[coords.x + 'x' + coords.y].tiles[tile.x][tile.y];
        }catch(e){
            console.log(e);
        }
    };
    window.GameMap = GameMap;
})(window);

var getSectorXY = function(string){
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

(function(window) {

    var Sector = function(){
    	this.pos = null;
    	this.tiles = null;
    	this.TILE_SIZE = 32;
    	this.fullSectorSize = 32*21;
    };

    Sector.prototype.init = function(s,data){
    	this.pos = getSectorXY(s);
    	this.tiles = [];
    	for (var i = 0; i < data.length;i++){
    		var arr = [];
    		for (var j = 0; j < data[i].length;j++){
 				var newTile = new Tile();
                newTile.init({
                	sectorid: s,
                    x: i,
                    y: j,
                    resource: data[i][j].resource,
                    open: data[i][j].open,
                    triggers: data[i][j].triggers,
                    overlayResource: data[i][j].overlayResource
                });
                newTile.sprite.position.x = this.pos.x*this.fullSectorSize + i*this.TILE_SIZE;
                newTile.sprite.position.y = this.pos.y*this.fullSectorSize + j*this.TILE_SIZE;
                Graphics.worldContainer.addChild(newTile.sprite);
                if (newTile.overlaySprite){
                    newTile.overlaySprite.position.x = this.pos.x*this.fullSectorSize + i*this.TILE_SIZE;
                    newTile.overlaySprite.position.y = this.pos.y*this.fullSectorSize + j*this.TILE_SIZE;
                    Graphics.worldContainer.addChild(newTile.overlaySprite);
                }
                arr.push(newTile);
    		}
            this.tiles.push(arr);
    	}
    };

    window.Sector = Sector;
})(window);

(function(window) {

    var Tile = function(){};

    Tile.prototype.init = function(data){ 
    	try{
    		this.sectorid = data.sectorid;
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
            }
            this.triggers = data.triggers;
        }catch(e){
            console.log("failed to init Tile");
            console.log(e);
        }
    };

    window.Tile = Tile;
})(window);