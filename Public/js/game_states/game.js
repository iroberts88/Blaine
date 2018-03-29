
(function(window) {
    Game = {
        map: null,
        init: function() {
            Graphics.uiPrimitives.lineStyle(1,0xFFFFFF,1);
            Graphics.uiPrimitives.beginFill(0xFFFFFF,1)
            Graphics.uiPrimitives.drawRect(0,0,Graphics.width/2-336,Graphics.height);
            Graphics.uiPrimitives.drawRect(0,0,Graphics.width,Graphics.height/2-336);
            Graphics.uiPrimitives.drawRect(Graphics.width/2+336,0,Graphics.width/2-336,Graphics.height);
            Graphics.uiPrimitives.drawRect(0,Graphics.height/2+336,Graphics.width,Graphics.height/2-336);
            Graphics.uiPrimitives.endFill()
        },
        
        resetPos: function(){
            //set world position to sector 0,0 position
            Graphics.worldContainer.position.x = Graphics.width/2-16;
            Graphics.worldContainer.position.y = Graphics.height/2-16;
            //get sector
            var sector = this.map[Player.character.sector];
            Graphics.worldContainer.position.x -= sector.pos.x*sector.fullSectorSize;
            Graphics.worldContainer.position.y -= sector.pos.y*sector.fullSectorSize;
            Graphics.worldContainer.position.x -= Player.character.tile[0]*32;
            Graphics.worldContainer.position.y -= Player.character.tile[1]*32;
        },
        update: function(dt){
            Graphics.uiPrimitives2.clear();
            if (Acorn.Input.isPressed(Acorn.Input.Key.UP)){
            	Player.move(0,-1);
            }else if (Acorn.Input.isPressed(Acorn.Input.Key.DOWN)){
            	Player.move(0,1);
            }else if (Acorn.Input.isPressed(Acorn.Input.Key.LEFT)){
            	Player.move(-1,0);
            }else if (Acorn.Input.isPressed(Acorn.Input.Key.RIGHT)){
            	Player.move(1,0);
            }
            Player.update(dt);
        }

    }
    window.Game = Game;
})(window);
