
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

        pkmnSwapChange: false,
        pkmnSwapTicker: 0,
        pkmnSwapData: null,
        pkmnSwapSpeed: 0.15,

        currentItemView: 'main',

        newMapData: null,

        requestMade: false,
        call: null,
        mapsCache: {},

        uiBoxTexture: null,

        //containers for the various UI screens
        pokedexUI: new PIXI.Container(),
        pokemonUI: new PIXI.Container(),
        inventoryUI: new PIXI.Container(),
        characterUI: new PIXI.Container(),
        settingsUI: new PIXI.Container(),

        //UI toggle buttons
        pokedexButton: null,
        pokemonButton: null,
        inventoryButton: null,
        characterButton: null,
        settingsButton: null,

        //UI element references
        pokemonUIElements: null,
        inventoryUIElements: null,

        pkmnBoxSize: [800,300],
        pkmnSelected: null,
        pkmnCurrentlyMousedOver: null,

        typeList: [
            '',
            'NORMAL',
            'FIRE',
            'WATER',
            'ELECTRIC',
            'GRASS',
            'ICE',
            'FIGHT',
            'POISON',
            'GOUND',
            'FLYING',
            'PSYCHIC',
            'BUG',
            'ROCK',
            'GHOST',
            'DRAGON',
            'DARK',
            'STEEL',
            'FAIRY'
        ],

        chatActive: false,
        uiActive: null,
        battleActive: false,

        battleChange: false,
        battleTicker: 0,

        cMusic: null,
        cMap: null,

        init: function() {
            this.initUIButtons();
            Graphics.app.renderer.backgroundColor = 0xFFFFFF;
            this.uiBoxTexture = this.getBoxTexture();
            this.initDexUI();
            this.initPkmnUI();
            this.initInventoryUI();
            this.initCharUI();
            this.initSetUI();

            //init chat UI

            this.chat = document.createElement( 'input' );
            this.chat.id = 'chat';
            this.chat.type = 'text';
            this.chat.placeholder = 'chat';
            this.chat.maxlength = 64;
            this.chat.style.cssText = 'border-width:1px;border-style:solid;width:400px;height:48px;top:100%;left:0px;background-color:#DCDCDC;font-weight:bold;font-size: 18px;font-family:Pokemon;position:absolute';
            this.chat.style.display = 'inline-block';
            this.chat.style.transform = ' translate(2%,-105%)';

           var texture = this.getTextButton('T',48);

            this.chatButton = Graphics.makeUiElement({
                texture: texture,
                anchor: [0,1],
                position: [5,Graphics.height-5],
                interactive: true,buttonMode: true,
                clickFunc: function onClick(e){
                    Graphics.uiContainer2.removeChild(Game.chatButton);
                    document.body.appendChild( Game.chat );
                    Game.chat.focus();
                    Game.chatActive = true;
                }
            });
            Graphics.uiContainer2.addChild(this.chatButton);
        },

        update: function(deltaTime){
            if (!this.ready){return;}
            if (this.chatActive){
                if (Acorn.Input.isPressed(Acorn.Input.Key.ENTER)){
                    Acorn.Net.socket_.emit('clientCommand',{cString: this.chat.value});
                    this.chat.value = '';
                    this.clearUI();
                }
                if (Acorn.Input.isPressed(Acorn.Input.Key.SPACE)){
                    this.chat.value += ' ';
                    Acorn.Input.setValue(Acorn.Input.Key.SPACE,false)
                }
                if (document.activeElement != this.chat){
                    this.clearUI();
                }
            }
            if (this.battleActive){
                Battle.update(deltaTime);
                return;
            }
            if (this.screenChange){
                this.updateScreenChange(deltaTime);
                return;
            }
            if (this.battleChange){
                this.updateBattleChange(deltaTime);
                return;
            }
            if (this.pkmnSwapChange){
                this.updatePkmnSwapChange(deltaTime);
            }
            if (!this.uiActive && !this.chatActive && !this.battleActive){
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
                if (Acorn.Input.isPressed(Acorn.Input.Key.COMMAND)){
                    this.chat.value = '/';
                    Graphics.uiContainer2.removeChild(Game.chatButton);
                    document.body.appendChild( Game.chat );
                    Game.chat.focus();
                    Game.chatActive = true;
                }
                if (Acorn.Input.isPressed(Acorn.Input.Key.TALK)){
                    this.chat.value = '';
                    Graphics.uiContainer2.removeChild(Game.chatButton);
                    document.body.appendChild( Game.chat );
                    Game.chat.focus();
                    Game.chatActive = true;
                }
            }
            if (Acorn.Input.isPressed(Acorn.Input.Key.CANCEL)){
                this.clearUI();
            }
            //update each PC
            for (var i in this.pcs){
                this.pcs[i].update(deltaTime);
            }
        },

        setBattleChange: function(){
            this.battleChange = true;
            Graphics.uiContainer.removeChild(this.pokedexButton);
            Graphics.uiContainer.removeChild(this.inventoryButton);
            Graphics.uiContainer.removeChild(this.pokemonButton);
            Graphics.uiContainer.removeChild(this.characterButton);
            Graphics.uiContainer.removeChild(this.settingsButton);
        },
        
        updateBattleChange: function(deltaTime){
            this.battleTicker += deltaTime;
            if (this.battleTicker >= 2.6){
                Graphics.uiPrimitives2.clear();
                Graphics.uiPrimitives2.alpha = 1.0;
                this.battleActive = true;
                Battle.init();
            }else{
                var sChange = 0.1625;
                var a;
                var n = Math.floor(this.battleTicker/sChange) % 2;
                if (n){
                    a = (sChange-(this.battleTicker % sChange)) / sChange;
                }else{
                    a = (this.battleTicker % sChange) / sChange;
                }
                Graphics.uiPrimitives2.alpha = a;
            }
        },

        updateScreenChange: function(deltaTime){
            this.screenTicker += deltaTime;
            if (this.screenTicker > this.SCREEN_CHANGE_TIME && this.newMapData && typeof this.mapsCache[this.newMapData.map] != 'undefined'){
                this.setNewMap(this.newMapData.map);
                Graphics.uiPrimitives2.clear();
            }else{
                Graphics.uiPrimitives2.lineStyle(1,0x000000,0.25);
                Graphics.uiPrimitives2.beginFill(0x000000,0.25);
                Graphics.uiPrimitives2.drawRect(0,0,Graphics.width,Graphics.height);
                Graphics.uiPrimitives2.endFill();
            }
        },

        updatePkmnSwapChange: function(deltaTime){
            this.pkmnSwapTicker += deltaTime;
            var first = this.pokemonUIElements[this.pkmnSwapData.first];
            var second = this.pokemonUIElements[this.pkmnSwapData.second];
            var dx1 = this.pkmnSwapData.secondStart.x - this.pkmnSwapData.firstStart.x;
            var dy1 = this.pkmnSwapData.secondStart.y - this.pkmnSwapData.firstStart.y;
            var dx2 = this.pkmnSwapData.firstStart.x - this.pkmnSwapData.secondStart.x;
            var dy2 = this.pkmnSwapData.firstStart.y - this.pkmnSwapData.secondStart.y;
            first.position.x = this.pkmnSwapData.firstStart.x + (dx1*(this.pkmnSwapTicker/this.pkmnSwapSpeed));
            first.position.y = this.pkmnSwapData.firstStart.y + (dy1*(this.pkmnSwapTicker/this.pkmnSwapSpeed));
            second.position.x = this.pkmnSwapData.secondStart.x + (dx2*(this.pkmnSwapTicker/this.pkmnSwapSpeed));
            second.position.y = this.pkmnSwapData.secondStart.y + (dy2*(this.pkmnSwapTicker/this.pkmnSwapSpeed));
            //Perform the swap
            if (this.pkmnSwapTicker >= this.pkmnSwapSpeed){
                //send swap info to server
                Acorn.Net.socket_.emit('playerUpdate',{command: 'swapPkmn',first:first.pokemonNumber,second:second.pokemonNumber});

                first.position.x = this.pkmnSwapData.secondStart.x;
                first.position.y = this.pkmnSwapData.secondStart.y;
                second.position.x = this.pkmnSwapData.firstStart.x;
                second.position.y = this.pkmnSwapData.firstStart.y;
                //swap ui containers
                this.pokemonUIElements[this.pkmnSwapData.second] = first;
                this.pokemonUIElements[this.pkmnSwapData.first] = second;
                //swap reference numbers in containers
                var num = first.pokemonNumber;
                first.pokemonNumber = second.pokemonNumber;
                second.pokemonNumber = num;
                //swap party pokemon
                var tempPoke = Party.pokemon[first.pokemonNumber];
                Party.pokemon[first.pokemonNumber] = Party.pokemon[second.pokemonNumber];
                Party.pokemon[second.pokemonNumber] = tempPoke;
                //reset data
                this.pkmnSwapChange = false;
                this.pkmnSwapData = null;
                this.pkmnSwapTicker = 0;
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

        resetTopSprites: function(){
            //make sure top layer of sprites is on top
            for (var i = 0; i < this.pcs.length;i++){
                Graphics.worldContainer.removeChild(this.pcs[i].nameTag);
                Graphics.worldContainer.addChild(this.pcs[i].nameTag);
                Graphics.worldContainer.removeChild(this.pcs[i].sprite2);
                Graphics.worldContainer.addChild(this.pcs[i].sprite2);
            }
            Graphics.worldContainer.removeChild(Player.character.sprite2);
            Graphics.worldContainer.addChild(Player.character.sprite2);
        },

        setNewMap: function(name){
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
                pc.remove = true;
            }catch(e){
                //TODO remove trycatch
            }
        },

        _removePC: function(data){
            try{
                var pc = Game.pcs[data.id];
                Graphics.worldContainer.removeChild(pc.sprite);
                Graphics.worldContainer.removeChild(pc.sprite2);
                Graphics.worldContainer.removeChild(pc.nameTag);
                Graphics.worldContainer.removeChild(pc.playerMask);
                delete Game.pcs[data.id];
            }catch(e){
                //TODO remove trycatch
            }
        },

        getSectorXY: function(string){
            //Takes an "XxY" string and returns a coordinate object
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
            var invTex = PIXI.RenderTexture.create(bSize,bSize);
            var charTex = PIXI.RenderTexture.create(bSize,bSize);
            var setTex = PIXI.RenderTexture.create(bSize,bSize);
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
            sprite.texture = Graphics.getResource('ow_pkmn_d1');
            Graphics.app.renderer.render(c1,pkmnTex);
            sprite.texture = Graphics.getResource('ow_pokeball');
            Graphics.app.renderer.render(c1,invTex);
            sprite.texture = Graphics.getResource('ow_' + Game.char.owSprite + '_d1');
            Graphics.app.renderer.render(c1,charTex);
            sprite.texture = Graphics.getResource('ow_clipboard');
            Graphics.app.renderer.render(c1,setTex);

            var padding = 20;
            this.pokedexButton = Graphics.makeUiElement({
                texture: dexTex,
                interactive: true,buttonMode: true,
                position: [(Graphics.width/2 - padding - bSize*2),bSize/2 + 10],
                anchor: [0.5,0.5],
                clickFunc: function onClick(e){
                    if (Game.uiActive){
                        Graphics.ui.removeChild(Game.uiActive);
                        Acorn.Sound.play('select');
                    }else{
                        Acorn.Sound.play('menu');
                    }
                    Graphics.ui.addChild(Game.pokedexUI);
                    Game.uiActive = Game.pokedexUI;
                }
            });
            this.pokedexButton.tooltip = new Tooltip();
            this.pokedexButton.tooltip.set({
                owner: this.pokedexButton,
                ttArray: [
                    {
                        text: "POK|DEX"
                    }
                ],
                alpha: 0.5
            });
            Graphics.uiContainer.addChild(this.pokedexButton);
            this.pokemonButton = Graphics.makeUiElement({
                texture: pkmnTex,
                interactive: true,buttonMode: true,
                position: [(Graphics.width/2 - padding/2 - bSize),bSize/2 + 10],
                anchor: [0.5,0.5],
                clickFunc: function onClick(e){
                    if (Game.uiActive){
                        Graphics.ui.removeChild(Game.uiActive);
                        Acorn.Sound.play('select');
                    }else{
                        Acorn.Sound.play('menu');
                    }
                    Graphics.ui.addChild(Game.pokemonUI);
                    Game.uiActive = Game.pokemonUI;
                }
            });
            this.pokemonButton.tooltip = new Tooltip();
            this.pokemonButton.tooltip.set({
                owner: this.pokemonButton,
                ttArray: [
                    {
                        text: "POK|MON"
                    }
                ],
                alpha: 0.5
            });
            Graphics.uiContainer.addChild(this.pokemonButton);

            this.inventoryButton = Graphics.makeUiElement({
                texture: invTex,
                interactive: true,buttonMode: true,
                position: [Graphics.width/2,bSize/2 + 10],
                anchor: [0.5,0.5],
                clickFunc: function onClick(e){
                    if (Game.uiActive){
                        Graphics.ui.removeChild(Game.uiActive);
                        Acorn.Sound.play('select');
                    }else{
                        Acorn.Sound.play('menu');
                    }
                    Graphics.ui.addChild(Game.inventoryUI);
                    Game.uiActive = Game.inventoryUI;
                }
            });
            this.inventoryButton.tooltip = new Tooltip();
            this.inventoryButton.tooltip.set({
                owner: this.inventoryButton,
                ttArray: [
                    {
                        text: "BACKPACK"
                    }
                ],
                alpha: 0.5
            });
            Graphics.uiContainer.addChild(this.inventoryButton);

            this.characterButton = Graphics.makeUiElement({
                texture: charTex,
                interactive: true,buttonMode: true,
                position: [(Graphics.width/2 + padding/2 + bSize),bSize/2 + 10],
                anchor: [0.5,0.5],
                clickFunc: function onClick(e){
                    if (Game.uiActive){
                        Graphics.ui.removeChild(Game.uiActive);
                        Acorn.Sound.play('select');
                    }else{
                        Acorn.Sound.play('menu');
                    }
                    Graphics.ui.addChild(Game.characterUI);
                    Game.uiActive = Game.characterUI;
                }
            });
            Graphics.uiContainer.addChild(this.characterButton);
            this.settingsButton = Graphics.makeUiElement({
                texture: setTex,
                interactive: true,buttonMode: true,
                position: [(Graphics.width/2 + padding + bSize*2),bSize/2 + 10],
                anchor: [0.5,0.5],
                clickFunc: function onClick(e){
                    if (Game.uiActive){
                        Graphics.ui.removeChild(Game.uiActive);
                        Acorn.Sound.play('select');
                    }else{
                        Acorn.Sound.play('menu');
                    }
                    Graphics.ui.addChild(Game.settingsUI);
                    Game.uiActive = Game.settingsUI;
                }
            });
            this.settingsButton.tooltip = new Tooltip();
            this.settingsButton.tooltip.set({
                owner: this.settingsButton,
                ttArray: [
                    {
                        text: "SETTINGS"
                    }
                ],
                alpha: 0.5
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

        initInventoryUI: function(){
            this.inventoryUI.removeChildren();

            var bg = new PIXI.Sprite(this.uiBoxTexture);
            this.inventoryUI.addChild(bg);

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
            this.inventoryUI.addChild(x);

            var fSize = 36;
            var yLoc = 120;
            var options = {
                buffer: 15,
                roundedness: 20
            }
            //active items button
            this.inventoryUI.addChild(Graphics.makeUiElement({
                text: 'ACTIVE',
                style: AcornSetup.style3,
                position: [Graphics.width*0.1,yLoc],
            }));
            //Main items button
            this.inventoryUI.addChild(Graphics.makeUiElement({
                text: 'ITEMS',
                style: AcornSetup.style3,
                position: [Graphics.width*0.3,yLoc],
            }));
            //pokeballs button
            this.inventoryUI.addChild(Graphics.makeUiElement({
                text: 'POK|BALLS',
                style: AcornSetup.style3,
                position: [Graphics.width*0.5,yLoc],
            }));
            //tms button
            this.inventoryUI.addChild(Graphics.makeUiElement({
                text: 'TMs',
                style: AcornSetup.style3,
                position: [Graphics.width*0.7,yLoc],
            }));
            //key items button
            this.inventoryUI.addChild(Graphics.makeUiElement({
                text: 'KEY ITEMS',
                style: AcornSetup.style3,
                position: [Graphics.width*0.9,yLoc],
            }));

            this.inventoryUIElements = [];
            this.inventoryUI.scale.x = this.UI_OFFSETSCALE;
            this.inventoryUI.scale.y = this.UI_OFFSETSCALE;
            this.inventoryUI.position.x = Graphics.width*((1-this.UI_OFFSETSCALE)/2);
            this.inventoryUI.position.y = Graphics.height*((1-this.UI_OFFSETSCALE)/2);
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

            this.pokemonUIElements = {};
            var x = Graphics.width/2 - this.pkmnBoxSize[0] - 15;
            var y = Graphics.height/4 - 50;
            for (var i = 0; i < 6;i++){
                //make buttons;
                var container = new PIXI.Container();
                container.position.x = x;
                container.position.y = y - this.pkmnBoxSize[1]/2;
                container.interactive = true;
                container.buttonMode = true;
                container.hitArea = new PIXI.Rectangle(0, 0, this.pkmnBoxSize[0], this.pkmnBoxSize[1]);
                container.pokemonNumber = i+1;

                var mUpFunc = function(e){
                    if (Game.pkmnSwapChange){return;}
                    if (!Game.pkmnSelected){
                        Game.pkmnSelected = e.currentTarget;
                        var outLineFilter = new PIXI.filters.GlowFilter(10, 2, 1.5, 0xFF0000, 0.5);
                        e.currentTarget.filters = [outLineFilter];
                        return;
                    }else{
                        if (Game.pkmnSelected == e.currentTarget){
                            Game.pkmnSelected.filters = [];
                            Game.pkmnSelected = null;
                            return;
                        }
                        Acorn.Sound.play('menu');
                        Game.pokemonUI.removeChild(Game.pkmnSelected);
                        Game.pokemonUI.removeChild(e.currentTarget);
                        Game.pokemonUI.addChild(Game.pkmnSelected);
                        Game.pokemonUI.addChild(e.currentTarget);
                        Game.pkmnSwapData = {
                            first: Game.pkmnSelected.pokemonNumber,
                            second: e.currentTarget.pokemonNumber,
                            firstStart: {
                                x: Game.pkmnSelected.position.x,
                                y: Game.pkmnSelected.position.y,
                            },
                            secondStart: {
                                x: e.currentTarget.position.x,
                                y: e.currentTarget.position.y,
                            }
                        };
                        Game.pkmnSwapChange = true;
                        Game.pkmnSwapTicker = 0;
                        e.currentTarget.filters = [];
                        Game.pkmnSelected.filters = [];
                        Game.pkmnSelected =  null;
                    }
                }
                container.on('pointerup', mUpFunc);
                container.on('touchend', mUpFunc);

                if (x == Graphics.width/2 - this.pkmnBoxSize[0] - 15){
                    x = Graphics.width/2 + 15;
                }else{
                    x = Graphics.width/2 - this.pkmnBoxSize[0] - 15;
                    y += (Graphics.height/4 + 50);
                }
                this.pokemonUIElements[i+1] = container;
                this.pokemonUI.addChild(container);
            }
            this.pokemonUI.scale.x = this.UI_OFFSETSCALE;
            this.pokemonUI.scale.y = this.UI_OFFSETSCALE;
            this.pokemonUI.position.x = Graphics.width*((1-this.UI_OFFSETSCALE)/2);
            this.pokemonUI.position.y = Graphics.height*((1-this.UI_OFFSETSCALE)/2);
        },

        resetItems: function(){
            for (var i = 0; i < this.inventoryUIElements.length;i++){
                this.inventoryUI.removeChild(this.inventoryUIElements[i]);
            }
            this.inventoryUIElements = [];

            var itemArr = Player.character.inventory.order[this.currentItemView];
        },

        resetPokemon: function(slot){
            var xSize = this.pkmnBoxSize[0];
            var ySize = this.pkmnBoxSize[1];
            if (typeof Party.pokemon[slot] == 'undefined'){
                return;
            }
            var pokemon = Party.pokemon[slot];
            var c = this.pokemonUIElements[slot];
            c.removeChildren();

            //get texture for button, set to interactive etc.
            var gfx = new PIXI.Graphics();
            var sprites = new PIXI.Container();
            gfx.lineStyle(5,0x000000,1);
            gfx.beginFill(0xFFFFFF,1);
            gfx.drawRoundedRect(0,0,xSize,ySize,25);
            gfx.endFill();

            c.addChild(gfx);
            c.addChild(sprites);

            c.pokeSprite = Graphics.getSprite('' + pokemon.number);
            c.pokeSprite.scale.x = 2;
            c.pokeSprite.scale.y = 2;
            c.pokeSprite.position.x = 15;
            c.pokeSprite.position.y = 15;
            sprites.addChild(c.pokeSprite);

            //Name
            c.nnText = new PIXI.Text(pokemon.nickname,AcornSetup.style2);
            c.nnText.style.fontSize = 48;
            c.nnText.anchor.x = 0.5;
            c.nnText.anchor.y = 0.5;
            c.nnText.position.x = xSize*0.6;
            c.nnText.position.y = 10 + c.nnText.height/2;
            sprites.addChild(c.nnText);
            //Level
            c.lvlText = new PIXI.Text("L: " + pokemon.level,AcornSetup.style2)
            if (pokemon.nickname != pokemon.name){
                c.lvlText.text +=  (' ' + pokemon.name);
            }
            c.lvlText.anchor.x = 0.5;
            c.lvlText.anchor.y = 0.5;
            c.lvlText.position.x = xSize*0.6;
            c.lvlText.position.y = 20 + c.nnText.height + c.lvlText.height/2;
            sprites.addChild(c.lvlText);
            //EXP Display

            //Types Display
            c.type1Text = new PIXI.Text(this.typeList[pokemon.types[0]],AcornSetup.style2);
            c.type1Text.position.x = c.pokeSprite.position.x + c.pokeSprite.width + 10;
            c.type1Text.position.y = c.pokeSprite.position.y;
            sprites.addChild(c.type1Text);
            if (pokemon.types.length > 1){
                c.type2Text = new PIXI.Text(this.typeList[pokemon.types[1]],AcornSetup.style2);
                c.type2Text.position.x = c.pokeSprite.position.x + c.pokeSprite.width + 10;
                c.type2Text.position.y = c.pokeSprite.position.y + c.type1Text.height + 5;
                sprites.addChild(c.type2Text);
            }
            //HP Display
            c.hpText = new PIXI.Text("HP: " + pokemon.currentHP + '/' + pokemon.hp,AcornSetup.style2);
            c.hpText.anchor.x = 0.0;
            c.hpText.anchor.y = 1;
            c.hpText.position.x = c.pokeSprite.position.x + c.pokeSprite.width + 10;
            c.hpText.position.y = c.pokeSprite.position.y + c.pokeSprite.height - 5;
            sprites.addChild(c.hpText);
            //set HP bar prims
            if (pokemon.currentHP != pokemon.hp){
                gfx.lineStyle(2,0x707070,1);
                gfx.beginFill(0x707070,1);
                var size = xSize/3 * (pokemon.currentHP/pokemon.hp);
                gfx.drawRoundedRect(c.pokeSprite.position.x,c.pokeSprite.position.y + c.pokeSprite.height + 5,size,15,6);
                gfx.drawRect(c.pokeSprite.position.x+10,c.pokeSprite.position.y + c.pokeSprite.height + 5,size-10,15);
                gfx.endFill();

                gfx.lineStyle(2,0x000000,1);
                gfx.beginFill(0x707070,0);
                gfx.drawRoundedRect(c.pokeSprite.position.x,c.pokeSprite.position.y + c.pokeSprite.height + 5,xSize/3,15,6);
                gfx.endFill();
            }else{
                gfx.lineStyle(2,0x000000,1);
                gfx.beginFill(0x707070,1);
                gfx.drawRoundedRect(c.pokeSprite.position.x,c.pokeSprite.position.y + c.pokeSprite.height + 5,xSize/3,15,6);
                gfx.endFill();
            }
            //Other Stats
            var atk = new PIXI.Text("ATTACK: ", AcornSetup.style2);
            atk.position.x = c.pokeSprite.position.x;
            atk.position.y = c.pokeSprite.position.y +  c.pokeSprite.height + 30;
            sprites.addChild(atk);
            c.attack = new PIXI.Text(pokemon.attack, AcornSetup.style2);
            c.attack.anchor.x = 1.0;
            c.attack.position.x = c.pokeSprite.position.x + xSize/3;
            c.attack.position.y = c.pokeSprite.position.y +  c.pokeSprite.height + 30;
            sprites.addChild(c.attack);

            var def = new PIXI.Text("DEFENSE: ", AcornSetup.style2);
            def.position.x = c.pokeSprite.position.x;
            def.position.y = atk.position.y + atk.height + 5;
            sprites.addChild(def);
            c.defense = new PIXI.Text(pokemon.defense, AcornSetup.style2);
            c.defense.anchor.x = 1.0;
            c.defense.position.x = c.pokeSprite.position.x + xSize/3;
            c.defense.position.y = atk.position.y + atk.height + 5;
            sprites.addChild(c.defense);

            var spatk = new PIXI.Text("SP. ATTACK: ", AcornSetup.style2);
            spatk.position.x = c.pokeSprite.position.x;
            spatk.position.y = def.position.y + def.height + 5;
            sprites.addChild(spatk);
            c.spattack = new PIXI.Text(pokemon.spattack, AcornSetup.style2);
            c.spattack.anchor.x = 1.0;
            c.spattack.position.x = c.pokeSprite.position.x + xSize/3;
            c.spattack.position.y = def.position.y + def.height + 5;
            sprites.addChild(c.spattack);

            var spdef = new PIXI.Text("SP. DEFENSE: ", AcornSetup.style2);
            spdef.position.x = c.pokeSprite.position.x;
            spdef.position.y = spatk.position.y + spatk.height + 5;
            sprites.addChild(spdef);
            c.spdefense = new PIXI.Text(pokemon.spdefense, AcornSetup.style2);
            c.spdefense.anchor.x = 1.0;
            c.spdefense.position.x = c.pokeSprite.position.x + xSize/3;
            c.spdefense.position.y = spatk.position.y + spatk.height + 5;
            sprites.addChild(c.spdefense);

            var spd = new PIXI.Text("SPEED: ", AcornSetup.style2);
            spd.position.x = c.pokeSprite.position.x;
            spd.position.y = spdef.position.y + spdef.height + 5;
            sprites.addChild(spd);
            c.speed = new PIXI.Text(pokemon.speed, AcornSetup.style2);
            c.speed.anchor.x = 1.0;
            c.speed.position.x = c.pokeSprite.position.x + xSize/3;
            c.speed.position.y = spdef.position.y + spdef.height + 5;
            sprites.addChild(c.speed);


            var startX = c.pokeSprite.position.x + xSize/3 + 10;
            var startY = c.pokeSprite.position.y + c.pokeSprite.height + 5;
            var mSizeX = xSize/3.3;
            var mSizeY = ySize/4;

            for (var i = 0; i < pokemon.moves.length;i++){
                var move = pokemon.moves[i];
                gfx.lineStyle(3,0x000000,1);
                gfx.beginFill(0xFFFFFF,1);
                var x = startX;
                var y = startY;
                if (i > 1){
                    y = startY + mSizeY + 5;
                }
                if (i%2 == 1){
                    x = (startX + mSizeX + 5);
                }
                gfx.drawRoundedRect(x,y,mSizeX,mSizeY,5);
                gfx.endFill();

                var name = new PIXI.Text(move.name,AcornSetup.style2);
                var pp = new PIXI.Text('PP: ' + pokemon.currentPP[i] + '/' + move.pp,AcornSetup.style2);
                var type = new PIXI.Text(this.typeList[move.type],AcornSetup.style2);
                name.anchor.x = 0.5;
                pp.anchor.x = 0.5;
                type.anchor.x = 0.5;

                name.position.x = x + mSizeX/2;
                pp.position.x = x + mSizeX/2;
                type.position.x = x + mSizeX/2;

                name.position.y = y + 5;
                pp.position.y = y + name.height + 5;
                type.position.y = y + name.height + 5 + pp.height + 5;

                sprites.addChild(name);
                sprites.addChild(pp);
                sprites.addChild(type);
            }

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
            if (this.uiActive){
                Graphics.ui.removeChild(this.uiActive);
            }
            if (this.chatActive){
                document.body.removeChild(this.chat);
                Graphics.uiContainer2.addChild(this.chatButton);
                this.chatActive = false;
                this.chat.value = '';
            }
            this.uiActive = null;
        },

        getTextButton: function(text,size,options){
            if (typeof options == 'undefined'){
                options = {};
            }
            var buffer = (typeof options.buffer == 'undefined') ? 0 : options.buffer;
            var roundedness = (typeof options.roundedness == 'undefined') ? 0 : options.roundedness;

            var text = new PIXI.Text(text,AcornSetup.style2);
            text.position.x = 5 + buffer;
            text.position.y = 5 + buffer;
            text.style.fontSize = size;
            var gfx = new PIXI.Graphics()
            var cont = new PIXI.Container();

            gfx.lineStyle(2,0xDCDCDC,0.8);
            gfx.beginFill(0xDCDCDC,0.8);
            gfx.drawRoundedRect(0,0,5 + buffer*2 + text.width,5 + buffer*2 + text.height,roundedness);
            gfx.endFill();
            cont.addChild(gfx);
            cont.addChild(text);
            var texture = PIXI.RenderTexture.create(5 + buffer*2 + text.width,5 + buffer*2 + text.height);
            var renderer = new PIXI.CanvasRenderer();
            Graphics.app.renderer.render(cont,texture);

            return texture;
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
            var sp3 = Graphics.getSprite('border_br');
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

            var texture = PIXI.RenderTexture.create(Graphics.width,Graphics.height);
            var renderer = new PIXI.CanvasRenderer();
            Graphics.app.renderer.render(cont,texture);
            return texture;
        }
    }
    window.Game = Game;
})(window);
