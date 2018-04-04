
(function(window) {
    Game = {
        map: null,

        ready: false,

        pcs: {},

        npcs: {},

        screenChange: false,
        screenTicker: 0,
        screenChangeTime: 0.75,

        newMapData: null,

        requestMade: false,
        call: null,
        mapsCache: {},

        init: function() {
            /*Graphics.uiPrimitives.lineStyle(1,0xFFFFFF,1);
            Graphics.uiPrimitives.beginFill(0xFFFFFF,1)
            Graphics.uiPrimitives.drawRect(0,0,Graphics.width/2-336,Graphics.height);
            Graphics.uiPrimitives.drawRect(0,0,Graphics.width,Graphics.height/2-336);
            Graphics.uiPrimitives.drawRect(Graphics.width/2+336,0,Graphics.width/2-336,Graphics.height);
            Graphics.uiPrimitives.drawRect(0,Graphics.height/2+336,Graphics.width,Graphics.height/2-336);
            Graphics.uiPrimitives.endFill()*/
        },
        
        resetPos: function(){
            //set world position to sector 0,0 position
            Graphics.worldContainer.position.x = Graphics.width/2-mainObj.TILE_SIZE/2;
            Graphics.worldContainer.position.y = Graphics.height/2-mainObj.TILE_SIZE/2;
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
            Graphics.worldContainer.position.x -= Player.character.tile[0]*mainObj.TILE_SIZE;
            Graphics.worldContainer.position.y -= Player.character.tile[1]*mainObj.TILE_SIZE;

            Player.resetPos();
        },
        setNewMap: function(name){
            console.log(name);
            try{
                var myObj = this.mapsCache[name];
                Graphics.worldContainer.removeChildren();
                Graphics.uiPrimitives2.clear();
                Game.map = new GameMap();
                Game.map.init(myObj.mapData);
                Player.character.tile = Game.newMapData.tile;
                Player.character.sector = Game.newMapData.sector;
                Player.character.map = Game.newMapData.map;
                Game.resetPos();
                Game.screenChange = false;
                Game.screenTicker = 0;
                Graphics.uiPrimitives2.clear();
                for (var i = 0; i < Game.newMapData.players.length;i++){
                    if (Game.newMapData.players[i].id != mainObj.id){
                        var pc = new PlayerCharacter();
                        pc.init(Game.newMapData.players[i]);
                        Game.pcs[Game.newMapData.players[i].id] = pc;
                    }
                }
                Game.newMapData = null;
                Game.requestMade = false;
            }catch(e){
                console.log(e);
            }
        },
        update: function(dt){
            if (!this.ready){return;}
            if (this.screenChange){
                this.screenTicker += dt;
                if (this.screenTicker > this.screenChangeTime && this.newMapData && !this.requestMade){
                    if (typeof this.mapsCache[this.newMapData.map] == 'undefined'){
                        Acorn.Net.socket_.emit('playerUpdate',{command: 'requestMapData',name: this.newMapData.map});
                        Game.requestMade = true;
                    }else{
                        //function here?
                        this.setNewMap(this.newMapData.map);
                    }

                    /*
                    $.ajax({
                        url: './maps/' + this.newMapData.map + '.json',
                        cache: false,
                        timeout: 4.0,
                        dataType: 'json',
                        done: function(data){
                            try{
                                var myObj = JSON.parse(data);
                                Graphics.worldContainer.removeChildren();
                                Graphics.uiPrimitives2.clear();
                                Game.map = new GameMap();
                                Game.map.init(myObj.mapData);
                                Player.character.tile = Game.newMapData.tile;
                                Player.character.sector = Game.newMapData.sector;
                                Player.character.map = Game.newMapData.map;
                                Game.resetPos();
                                Game.screenChange = false;
                                Game.screenTicker = 0;
                                Graphics.uiPrimitives2.clear();
                                for (var i = 0; i < Game.newMapData.players.length;i++){
                                    if (Game.newMapData.players[i].id != mainObj.id){
                                        var pc = new PlayerCharacter();
                                        pc.init(Game.newMapData.players[i]);
                                        Game.pcs[Game.newMapData.players[i].id] = pc;
                                    }
                                }
                                Game.newMapData = null;
                                Game.requestMade = false;
                            }catch(e){
                                console.log(e);
                            }
                        },
                        fail: function(data){
                            console.log('ERROR');
                            console.log(data);
                            if (confirm("Error loading map. Retry?")){
                                this.requestMade = false;
                            }
                        } 
                    });*/
                    /*var xmlhttp = new XMLHttpRequest();
                    xmlhttp.onreadystatechange = function() {
                        console.log('state change')
                        if (xmlhttp.readyState == 4 && xmlhttp.status == 200 && Game.newMapData != null) {
                            try{
                                var myObj = JSON.parse(xmlhttp.responseText);
                                Graphics.worldContainer.removeChildren();
                                Graphics.uiPrimitives2.clear();
                                Game.map = new GameMap();
                                Game.map.init(myObj.mapData);
                                Player.character.tile = Game.newMapData.tile;
                                Player.character.sector = Game.newMapData.sector;
                                Player.character.map = Game.newMapData.map;
                                Game.resetPos();
                                Game.screenChange = false;
                                Game.screenTicker = 0;
                                Graphics.uiPrimitives2.clear();
                                for (var i = 0; i < Game.newMapData.players.length;i++){
                                    if (Game.newMapData.players[i].id != mainObj.id){
                                        var pc = new PlayerCharacter();
                                        pc.init(Game.newMapData.players[i]);
                                        Game.pcs[Game.newMapData.players[i].id] = pc;
                                    }
                                }
                                Game.newMapData = null;
                                Game.requestMade = false;
                            }catch(e){
                                console.log(e);
                            }
                        }
                    };
                    xmlhttp.open("GET",'./maps/' + this.newMapData.map + '.json', true);
                    xmlhttp.send();*/
                }else{
                    Graphics.uiPrimitives2.lineStyle(1,0xFFFFFF,0.25);
                    Graphics.uiPrimitives2.beginFill(0xFFFFFF,0.25)
                    Graphics.uiPrimitives2.drawRect(0,0,Graphics.width,Graphics.height);
                    Graphics.uiPrimitives2.endFill()
                }
                return;
            }else{
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
            }
        },

        removePC: function(data){
            try{
                var pc = Game.pcs[data.id];
                Graphics.worldContainer.removeChild(pc.sprite);
                Graphics.worldContainer.removeChild(pc.sprite2);
                Graphics.worldContainer.removeChild(pc.nameTag);
                Graphics.worldContainer.removeChild(pc.playerMask);
                delete Game.pcs[data.id];
            }catch(e){

            }
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
