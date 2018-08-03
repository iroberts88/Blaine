(function(window) {

    var GameMap = function(){
        sectorData: null;
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
    GameMap.prototype.setVisible = function(sString,visible){
        try{
            this[sString].setVisible(visible)
        }catch(e){
        }
    };
    GameMap.prototype.changeVisibleSectors = function(){
        if (this.sectorData){
            console.log(this.sectorData)
            if (this.sectorData.dir == 'left'){
                this.setVisible((this.sectorData.x-1) + 'x' + this.sectorData.y,true);
                this.setVisible((this.sectorData.x-1) + 'x' + (this.sectorData.y-1),true);
                this.setVisible((this.sectorData.x-1) + 'x' + (this.sectorData.y+1),true);
                this.setVisible((this.sectorData.x+2) + 'x' + this.sectorData.y,false);
                this.setVisible((this.sectorData.x+2) + 'x' + (this.sectorData.y-1),false);
                this.setVisible((this.sectorData.x+2) + 'x' + (this.sectorData.y+1),false);
            }else if (this.sectorData.dir == 'up'){
                this.setVisible(this.sectorData.x + 'x' + (this.sectorData.y-1),true);
                this.setVisible((this.sectorData.x-1) + 'x' + (this.sectorData.y-1),true);
                this.setVisible((this.sectorData.x+1) + 'x' + (this.sectorData.y-1),true);
                this.setVisible(this.sectorData.x + 'x' + (this.sectorData.y+2),false);
                this.setVisible((this.sectorData.x+1) + 'x' + (this.sectorData.y+2),false);
                this.setVisible((this.sectorData.x-1) + 'x' + (this.sectorData.y+2),false);
            }else if (this.sectorData.dir == 'right'){
                this.setVisible((this.sectorData.x+1) + 'x' + this.sectorData.y,true);
                this.setVisible((this.sectorData.x+1) + 'x' + (this.sectorData.y-1),true);
                this.setVisible((this.sectorData.x+1) + 'x' + (this.sectorData.y+1),true);
                this.setVisible((this.sectorData.x-2) + 'x' + this.sectorData.y,false);
                this.setVisible((this.sectorData.x-2) + 'x' + (this.sectorData.y-1),false);
                this.setVisible((this.sectorData.x-2) + 'x' + (this.sectorData.y+1),false);
            }else if (this.sectorData.dir == 'down'){
                this.setVisible(this.sectorData.x + 'x' + (this.sectorData.y+1),true);
                this.setVisible((this.sectorData.x-1) + 'x' + (this.sectorData.y+1),true);
                this.setVisible((this.sectorData.x+1) + 'x' + (this.sectorData.y+1),true);
                this.setVisible((this.sectorData.x+1) + 'x' + (this.sectorData.y-2),false);
                this.setVisible((this.sectorData.x-1) + 'x' + (this.sectorData.y-2),false);
                this.setVisible(this.sectorData.x + 'x' + (this.sectorData.y-2),false);
            }
            this.sectorData = null;
        }
    };
    GameMap.prototype.getTileAt = function(x,y){
        //character is attempting to move
        try{
            var coords = getSectorXY(Player.character.sector);
            var tile = {
                x: Player.character.tile[0],
                y: Player.character.tile[1]
            }
            tile.x += x;
            tile.y += y;
            if (tile.x < 0){
                tile.x = 21+x;
                coords.x -= 1;
                this.sectorData = {dir: 'left',x:coords.x,y:coords.y};
            }else if (tile.y < 0){
                tile.y = 21+y;
                coords.y -= 1;
                this.sectorData = {dir: 'up',x:coords.x,y:coords.y};
            }else if (tile.x > 20){
                tile.x = tile.x-21;
                coords.x += 1;
                this.sectorData = {dir: 'right',x:coords.x,y:coords.y};
            }else if (tile.y > 20){
                tile.y = tile.y-21;
                coords.y += 1;
                this.sectorData = {dir: 'down',x:coords.x,y:coords.y};
            }
            return this[coords.x + 'x' + coords.y].tiles[tile.x][tile.y];
        }catch(e){
            console.log(e);
        }
    };
    GameMap.prototype.getTileAtPC = function(pc,x,y){
        //PC is attempting to move
        try{
            var coords = getSectorXY(pc.sector);
            var tile = {
                x: pc.tile[0],
                y: pc.tile[1]
            }
            tile.x += x;
            tile.y += y;
            if (tile.x < 0){
                tile.x = 21+x;
                coords.x -= 1;
            }else if (tile.y < 0){
                tile.y = 21+y;
                coords.y -= 1;
            }else if (tile.x > 20){
                tile.x = tile.x-21;
                coords.x += 1;
            }else if (tile.y > 20){
                tile.y = tile.y-21;
                coords.y += 1;
            }
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
    	this.TILE_SIZE = mainObj.TILE_SIZE;
    	this.fullSectorSize = mainObj.TILE_SIZE*21;
    };

    Sector.prototype.init = function(s,data){
    	this.pos = getSectorXY(s);
    	this.tiles = [];
    	for (var i = 0; i < data.tiles.length;i++){
    		var arr = [];
    		for (var j = 0; j < data.tiles[i].length;j++){
 				var newTile = new Tile();
                newTile.init({
                	sectorid: s,
                    x: i,
                    y: j,
                    resource: data.tiles[i][j].resource,
                    open: data.tiles[i][j].open,
                    triggers: data.tiles[i][j].triggers,
                    overlayResource: data.tiles[i][j].overlayResource
                });
                newTile.sprite.position.x = this.pos.x*this.fullSectorSize + i*this.TILE_SIZE;
                newTile.sprite.position.y = this.pos.y*this.fullSectorSize + j*this.TILE_SIZE;
                if (data.tiles[i][j].resource == '1x1'){
                    Graphics.worldContainer2.addChild(newTile.sprite);
                }else{
                    Graphics.worldContainer.addChild(newTile.sprite);
                }
                if (newTile.overlaySprite){
                    newTile.overlaySprite.position.x = this.pos.x*this.fullSectorSize + i*this.TILE_SIZE;
                    newTile.overlaySprite.position.y = this.pos.y*this.fullSectorSize + j*this.TILE_SIZE;
                    if (data.tiles[i][j].overlayResource == '1x1'){
                        Graphics.worldContainer2.addChild(newTile.overlaySprite);
                    }else{
                        Graphics.worldContainer.addChild(newTile.overlaySprite);
                    }
                }
                arr.push(newTile);
    		}
            this.tiles.push(arr);
    	}
    };
    Sector.prototype.setVisible = function(bool){
        for (var i = 0; i < this.tiles.length;i++){
            for (var j = 0; j < this.tiles[i].length;j++){
                this.tiles[i][j].sprite.visible = bool;
                if (this.tiles[i][j].overlaySprite){
                    this.tiles[i][j].overlaySprite.visible = bool;
                }
            }
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
            this.sprite.scale.x = mainObj.GAME_SCALE;
            this.sprite.scale.y = mainObj.GAME_SCALE;
            this.open = (typeof data.open == 'undefined')  ? null : data.open;
            this.overlayResource = (typeof data.overlayResource == 'undefined')  ? null : data.overlayResource;
            this.overlaySprite = null; //2nd layer sprite
            if (this.overlayResource){
                this.overlaySprite = Graphics.getSprite(data.overlayResource); //tile sprite
                this.overlaySprite.scale.x = mainObj.GAME_SCALE;
                this.overlaySprite.scale.y = mainObj.GAME_SCALE;
                this.overlaySprite.visible = false;
            }
            this.triggers = (typeof data.triggers == 'undefined')  ? [] : data.triggers;
            this.sprite.visible = false;
        }catch(e){
            console.log("failed to init Tile");
            console.log(e);
        }
    };

    window.Tile = Tile;
})(window);