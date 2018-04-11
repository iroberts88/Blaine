
(function(window) {
    Game = {
        UI_OFFSETSCALE: 0.8,
        SCREEN_CHANGE_TIME: 0.75,
        BORDER_SCALE: 3,

        map: null,

        ready: false,

        pcs: {},

        npcs: {},

        screenChange: false,
        screenTicker: 0,

        newMapData: null,

        requestMade: false,
        call: null,
        mapsCache: {},

        uiBoxTexture: null,

        pokedexUI: new PIXI.Container(),
        pokemonUI: new PIXI.Container(),
        characterUI: new PIXI.Container(),
        settingsUI: new PIXI.Container(),

        pokedexButton: null,
        pokemonButton: null,
        characterButton: null,
        settingsButton: null,

        activeUI: null,

        init: function() {
            this.initUIButtons();

            this.uiBoxTexture = this.getBoxTexture();
            this.initDexUI();
            this.initPkmnUI();
            this.initCharUI();
            this.initSetUI();
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
            if (Acorn.Input.isPressed(Acorn.Input.Key.CANCEL)){
                this.clearUI();
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
            if (this.screenTicker > this.SCREEN_CHANGE_TIME && this.newMapData && !this.requestMade){
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
                    if (Game.activeUI){
                        Graphics.ui.removeChild(Game.activeUI);
                        Acorn.Sound.play('select');
                    }else{
                        Acorn.Sound.play('menu');
                    }
                    Graphics.ui.addChild(Game.pokedexUI);
                    Game.activeUI = Game.pokedexUI;
                }
            });
            Graphics.uiContainer.addChild(this.pokedexButton);
            this.pokemonButton = Graphics.makeUiElement({
                texture: pkmnTex,
                interactive: true,buttonMode: true,
                position: [(Graphics.width/2 - padding/2 - bSize/2),bSize/2 + 10],
                anchor: [0.5,0.5],
                clickFunc: function onClick(e){
                    if (Game.activeUI){
                        Graphics.ui.removeChild(Game.activeUI);
                        Acorn.Sound.play('select');
                    }else{
                        Acorn.Sound.play('menu');
                    }
                    Graphics.ui.addChild(Game.pokemonUI);
                    Game.activeUI = Game.pokemonUI;
                }
            });
            Graphics.uiContainer.addChild(this.pokemonButton);
            this.characterButton = Graphics.makeUiElement({
                texture: charTex,
                interactive: true,buttonMode: true,
                position: [(Graphics.width/2 + padding/2 + bSize/2),bSize/2 + 10],
                anchor: [0.5,0.5],
                clickFunc: function onClick(e){
                    if (Game.activeUI){
                        Graphics.ui.removeChild(Game.activeUI);
                        Acorn.Sound.play('select');
                    }else{
                        Acorn.Sound.play('menu');
                    }
                    Graphics.ui.addChild(Game.characterUI);
                    Game.activeUI = Game.characterUI;
                }
            });
            Graphics.uiContainer.addChild(this.characterButton);
            this.settingsButton = Graphics.makeUiElement({
                texture: setTex,
                interactive: true,buttonMode: true,
                position: [(Graphics.width/2 + (padding*1.5) + bSize*1.5),bSize/2 + 10],
                anchor: [0.5,0.5],
                clickFunc: function onClick(e){
                    if (Game.activeUI){
                        Graphics.ui.removeChild(Game.activeUI);
                        Acorn.Sound.play('select');
                    }else{
                        Acorn.Sound.play('menu');
                    }
                    Graphics.ui.addChild(Game.settingsUI);
                    Game.activeUI = Game.settingsUI;
                }
            });
            Graphics.uiContainer.addChild(this.settingsButton);
        },

        initDexUI: function(){
            this.pokedexUI.removeChildren();

            var bg = new PIXI.Sprite(this.uiBoxTexture);
            this.pokedexUI.addChild(bg);

            var x = Graphics.makeUiElement({
                text: "X",
                style: AcornSetup.style2,
                interactive: true,buttonMode: true,
                position: [Graphics.width-24,24],
                anchor: [1,0],
                clickFunc: function onClick(e){
                    Game.clearUI();
                }
            });
            x.style.fontSize = 64;
            this.pokedexUI.addChild(x);

            this.pokedexUI.scale.x = this.UI_OFFSETSCALE;
            this.pokedexUI.scale.y = this.UI_OFFSETSCALE;
            this.pokedexUI.position.x = Graphics.width*((1-this.UI_OFFSETSCALE)/2);
            this.pokedexUI.position.y = Graphics.height*((1-this.UI_OFFSETSCALE)/2);
        },

        initPkmnUI: function(){
            this.pokemonUI.removeChildren();

            var bg = new PIXI.Sprite(this.uiBoxTexture);
            this.pokemonUI.addChild(bg);

            var x = Graphics.makeUiElement({
                text: "X",
                style: AcornSetup.style2,
                interactive: true,buttonMode: true,
                position: [Graphics.width-24,24],
                anchor: [1,0],
                clickFunc: function onClick(e){
                    Game.clearUI();
                }
            });
            x.style.fontSize = 64;
            this.pokemonUI.addChild(x);
            
            this.pokemonUI.scale.x = this.UI_OFFSETSCALE;
            this.pokemonUI.scale.y = this.UI_OFFSETSCALE;
            this.pokemonUI.position.x = Graphics.width*((1-this.UI_OFFSETSCALE)/2);
            this.pokemonUI.position.y = Graphics.height*((1-this.UI_OFFSETSCALE)/2);
        },

        initCharUI: function(){
            this.characterUI.removeChildren();

            var bg = new PIXI.Sprite(this.uiBoxTexture);
            this.characterUI.addChild(bg);

            var x = Graphics.makeUiElement({
                text: "X",
                style: AcornSetup.style2,
                interactive: true,buttonMode: true,
                position: [Graphics.width-24,24],
                anchor: [1,0],
                clickFunc: function onClick(e){
                    Game.clearUI();
                }
            });
            x.style.fontSize = 64;
            this.characterUI.addChild(x);
            
            this.characterUI.scale.x = this.UI_OFFSETSCALE;
            this.characterUI.scale.y = this.UI_OFFSETSCALE;
            this.characterUI.position.x = Graphics.width*((1-this.UI_OFFSETSCALE)/2);
            this.characterUI.position.y = Graphics.height*((1-this.UI_OFFSETSCALE)/2);
        },

        initSetUI: function(){
            this.settingsUI.removeChildren();

            var bg = new PIXI.Sprite(this.uiBoxTexture);
            this.settingsUI.addChild(bg);

            var x = Graphics.makeUiElement({
                text: "X",
                style: AcornSetup.style2,
                interactive: true,buttonMode: true,
                position: [Graphics.width-24,24],
                anchor: [1,0],
                clickFunc: function onClick(e){
                    Game.clearUI();
                }
            });
            x.style.fontSize = 64;
            this.settingsUI.addChild(x);
            
            this.settingsUI.scale.x = this.UI_OFFSETSCALE;
            this.settingsUI.scale.y = this.UI_OFFSETSCALE;
            this.settingsUI.position.x = Graphics.width*((1-this.UI_OFFSETSCALE)/2);
            this.settingsUI.position.y = Graphics.height*((1-this.UI_OFFSETSCALE)/2);
        },

        clearUI: function(){
            if (this.activeUI){
                Graphics.ui.removeChild(this.activeUI);
            }
            this.activeUI = null;
        },

        getBoxTexture: function(){
            var cont = new PIXI.Container();
            var gfx = new PIXI.Graphics();
            var borders = new PIXI.Container();
            gfx.lineStyle(1,0xFFFFFF,1);
            gfx.beginFill(0xFFFFFF,1);
            gfx.drawRect(0,0,Graphics.width,Graphics.height);
            gfx.endFill();
            
            //make borders
            for (var i = 1;i < 79;i++){
                var sp1 = Graphics.getSprite('border_t');
                var sp2 = Graphics.getSprite('border_b');
                sp1.position.x = 24*i;
                sp2.position.x = 24*i;
                sp1.position.y = 0;
                sp2.position.y = Graphics.height;
                sp1.anchor.y = 0;
                sp2.anchor.y = 1;
                sp1.scale.x = 3;
                sp1.scale.y = 3;
                sp2.scale.x = 3;
                sp2.scale.y = 3;
                borders.addChild(sp1);
                borders.addChild(sp2);
            }
            for (var i = 1;i < 44;i++){
                var sp1 = Graphics.getSprite('border_l');
                var sp2 = Graphics.getSprite('border_r');
                sp1.position.x = 0;
                sp2.position.x = Graphics.width;
                sp1.position.y = 24*i;
                sp2.position.y = 24*i;
                sp1.anchor.x = 0;
                sp2.anchor.x = 1;
                sp1.scale.x = 3;
                sp1.scale.y = 3;
                sp2.scale.x = 3;
                sp2.scale.y = 3;
                borders.addChild(sp1);
                borders.addChild(sp2);
            }

            var sp1 = Graphics.getSprite('border_tl');
            var sp2 = Graphics.getSprite('border_tr');
            var sp3 = Graphics.getSprite('ow_border_br');
            var sp4 = Graphics.getSprite('border_bl');
            sp1.position.x = 0;
            sp1.position.y = 0;
            sp1.anchor.x = 0;
            sp1.anchor.y = 0;
            sp1.scale.x = 3;
            sp1.scale.y = 3;

            sp2.position.x = Graphics.width;
            sp2.position.y = 0;
            sp2.anchor.x = 1;
            sp2.anchor.y = 0;
            sp2.scale.x = 3;
            sp2.scale.y = 3;


            sp3.position.x = Graphics.width;
            sp3.position.y = Graphics.height;
            sp3.anchor.x = 1;
            sp3.anchor.y = 1;
            sp3.scale.x = 3;
            sp3.scale.y = 3;


            sp4.position.x = 0;
            sp4.position.y = Graphics.height;
            sp4.anchor.x = 0;
            sp4.anchor.y = 1;
            sp4.scale.x = 3;
            sp4.scale.y = 3;

            borders.addChild(sp1);
            borders.addChild(sp2);
            borders.addChild(sp3);
            borders.addChild(sp4);

            cont.addChild(gfx);
            cont.addChild(borders);

            gfx.alpha = 0.8
            borders.alpha = 0.5;

            var texture = PIXI.RenderTexture.create(Graphics.width,Graphics.height);
            var renderer = new PIXI.CanvasRenderer();
            Graphics.app.renderer.render(cont,texture);
            return texture;
        }
    }
    window.Game = Game;
})(window);
