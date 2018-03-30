
(function(window) {
    Game = {
        map: null,

        ready: false,

        pcs: {},

        npcs: {},

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
            for (var i = -1; i < 2;i++){
                for (var j = -1; j < 2; j++){
                    try{
                        var sec = this.map[(sector.pos.x+i) + 'x' + (sector.pos.y+j)];
                        sec.setVisible(true);
                    }catch(e){
                        console.log(e);
                    }
                }
            }
            Graphics.worldContainer.position.x -= sector.pos.x*sector.fullSectorSize;
            Graphics.worldContainer.position.y -= sector.pos.y*sector.fullSectorSize;
            Graphics.worldContainer.position.x -= Player.character.tile[0]*32;
            Graphics.worldContainer.position.y -= Player.character.tile[1]*32;
        },
        update: function(dt){
            if (!this.ready){return;}
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
            for (var i in this.pcs){
                this.pcs[i].update(dt);
            }
        },

        removePC: function(data){
            var pc = Game.pcs[data.id];
            Graphics.worldContainer.removeChild(pc.sprite);
            delete Game.pcs[data.id];
        },

        getSectorXY: function(string){
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
        }

    }
    window.Game = Game;
})(window);
