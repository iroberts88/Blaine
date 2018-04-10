
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

        pokedexUI: new PIXI.Container(),
        pokemonUI: new PIXI.Container(),
        characterUI: new PIXI.Container(),
        settingsUI: new PIXI.Container(),

        pokedexButton: null,
        pokemonButton: null,
        characterButton: null,
        settingsButton: null,

        init: function() {
            this.initUIButtons();
        },

        update: function(deltaTime){
            if (!this.ready){return;}
            if (this.screenChange){
                this.updateScreenChange(deltaTime);
                return;
            }

            if (Acorn.Input.isPressed(Acorn.Input.Key.UP)){
                Player.move(0,-1);
            }else if (Acorn.Input.isPressed(Acorn.Input.Key.DOWN)){
                Player.move(0,1);
            }else if (Acorn.Input.isPressed(Acorn.Input.Key.LEFT)){
                Player.move(-1,0);
            }else if (Acorn.Input.isPressed(Acorn.Input.Key.RIGHT)){
                Player.move(1,0);
            }
            //update the player
            Player.update(deltaTime);
            //update each PC
            for (var i in this.pcs){
                this.pcs[i].update(deltaTime);
            }
        },
        
        updateScreenChange: function(deltaTime){
            this.screenTicker += deltaTime;
            if (this.screenTicker > this.screenChangeTime && this.newMapData && !this.requestMade){
                if (typeof this.mapsCache[this.newMapData.map] == 'undefined'){
                    Acorn.Net.socket_.emit('playerUpdate',{command: 'requestMapData',name: this.newMapData.map});
                    Game.requestMade = true;
                }else{
                    //function here?
                    this.setNewMap(this.newMapData.map);
                }
                Graphics.uiPrimitives2.clear();
            }else{
                Graphics.uiPrimitives2.lineStyle(1,0xFFFFFF,0.25);
                Graphics.uiPrimitives2.beginFill(0xFFFFFF,0.25);
                Graphics.uiPrimitives2.drawRect(0,0,Graphics.width,Graphics.height);
                Graphics.uiPrimitives2.endFill();
            }
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
        },

        initUIButtons: function(){

            var bSize = 75;
            var dexTex = PIXI.RenderTexture.create(bSize,bSize);
            var pkmnTex = PIXI.RenderTexture.create(bSize,bSize);
            var charTex = PIXI.RenderTexture.create(bSize,bSize);
            var setTex = PIXI.RenderTexture.create(bSize,bSize);
            var renderer = new PIXI.CanvasRenderer();
            var g1 = new PIXI.Graphics();
            var c1 = new PIXI.Container();
            var c2 = new PIXI.Container();
            c1.addChild(g1);
            c1.addChild(c2);

            g1.lineStyle(1,0xFFFFFF,1);
            g1.beginFill(0xFFFFFF,1);
            g1.drawRoundedRect(0,0,bSize,bSize,10);
            g1.endFill();

            var sprite = Graphics.getSprite('ow_book');
            sprite.scale.x = (bSize/16);
            sprite.scale.y = (bSize/16);
            sprite.position.x -= 3;
            c2.addChild(sprite);

            Graphics.app.renderer.render(c1,dexTex);
            sprite.position.x += 3;
            sprite.texture = Graphics.getResource('ow_pokeball');
            Graphics.app.renderer.render(c1,pkmnTex);
            sprite.texture = Graphics.getResource('ow_' + Game.char + '_d1');
            Graphics.app.renderer.render(c1,charTex);
            sprite.texture = Graphics.getResource('ow_clipboard');
            Graphics.app.renderer.render(c1,setTex);

            var padding = 20;
            this.pokedexButton = Graphics.makeUiElement({
                texture: dexTex,
                interactive: true,buttonMode: true,
                position: [(Graphics.width/2 - (padding*1.5) - bSize*1.5),bSize/2 + 10],
                anchor: [0.5,0.5],
                clickFunc: function onClick(e){
                    Acorn.Sound.play('select');
                }
            });
            Graphics.uiContainer.addChild(this.pokedexButton);
            this.pokemonButton = Graphics.makeUiElement({
                texture: pkmnTex,
                interactive: true,buttonMode: true,
                position: [(Graphics.width/2 - padding/2 - bSize/2),bSize/2 + 10],
                anchor: [0.5,0.5],
                clickFunc: function onClick(e){
                    Acorn.Sound.play('select');
                }
            });
            Graphics.uiContainer.addChild(this.pokemonButton);
            this.characterButton = Graphics.makeUiElement({
                texture: charTex,
                interactive: true,buttonMode: true,
                position: [(Graphics.width/2 + padding/2 + bSize/2),bSize/2 + 10],
                anchor: [0.5,0.5],
                clickFunc: function onClick(e){
                    Acorn.Sound.play('select');
                }
            });
            Graphics.uiContainer.addChild(this.characterButton);
            this.settingsButton = Graphics.makeUiElement({
                texture: setTex,
                interactive: true,buttonMode: true,
                position: [(Graphics.width/2 + (padding*1.5) + bSize*1.5),bSize/2 + 10],
                anchor: [0.5,0.5],
                clickFunc: function onClick(e){
                    Acorn.Sound.play('select');
                }
            });
            Graphics.uiContainer.addChild(this.settingsButton);
        }
    }
    window.Game = Game;
})(window);
