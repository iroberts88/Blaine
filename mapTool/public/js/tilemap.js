
(function(window) {

    var TileMap = function(){};

    TileMap.prototype.init = function(data) {
        if (typeof data.name == 'undefined'){
            this.sectors = {};
            this.defaultTile = '0x0';
            var s = this.getSector(0,0);
        }else{
            this.name = data.name;
        }
       
    };

    TileMap.prototype.getSector = function(x,y){
        for (var i = 0; i < 21,i++){
            for (var j = 0; j < 21;j++){
                var newTile = new Tile();
                newTile.init({
                    sectorId: x + 'x' + y;
                    x: j,
                    y: i,
                    resource: this.defaultTile
                })
            }
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
