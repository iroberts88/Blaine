
(function(window) {
    Game = {
        UI_OFFSETSCALE: 0.8,
        SCREEN_CHANGE_TIME: 0.75,
        BORDER_SCALE: 3,

        map: null,

        ready: false,

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

        inventoryUIButtons: [],
        inventoryUIElements: null,
        inventoryUseButton: null,
        currentSelectedItem: null,
        currentSelectedItemIndex: null,
        selectedItem: null,
        itemUITooltip: null,

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

            Acorn.Input.onDown(Acorn.Input.Key.CANCEL, function(){
                Game.clearUI();
                if (Game.chatActive){
                    Game.chat.value = '';
                    document.body.removeChild(Game.chat);
                    Graphics.uiContainer2.addChild(Game.chatButton);
                    Game.chatActive = false;
                }
                if (Game.battleActive && Battle.ready){
                    Battle.turnData = {};
                    Game.clearUI();
                    Battle.clear();
                    Graphics.ui.removeChild(Battle.confirmTurnWindow);
                    Battle.checkBattleCommand();
                }
            });

            Acorn.Input.onDown(Acorn.Input.Key.INTERACT, function(){
                if (Game.battleActive){
                    if (Battle.confirmTurnWindow){
                        Battle.sendTurnData();
                    }
                }
            });
        },

        update: function(deltaTime){
            if (!this.ready){return;}
            if (this.chatActive){
                if (Acorn.Input.isPressed(Acorn.Input.Key.ENTER)){
                    var sData = {}
                    sData[CENUMS.TEXT] = this.chat.value;
                    Acorn.Net.socket_.emit(CENUMS.CLIENTCOMMAND,sData);
                    this.chat.value = '';
                    document.body.removeChild(this.chat);
                    Graphics.uiContainer2.addChild(this.chatButton);
                    this.chatActive = false;
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
                    document.body.appendChild(Game.chat);
                    Game.chat.focus();
                    Game.chatActive = true;
                }
                if (Acorn.Input.isPressed(Acorn.Input.Key.TALK)){
                    this.chat.value = '';
                    Graphics.uiContainer2.removeChild(Game.chatButton);
                    document.body.appendChild(Game.chat);
                    Game.chat.focus();
                    Game.chatActive = true;
                }
            }


            //update each PC
            PCS.update(deltaTime);
            NPCS.update(deltaTime);
            if (this.currentSelectedItem && this.itemUITooltip == null){
               /* //INIT itemUITooltip
                this.itemUITooltip = new Tooltip();
                var arr = [
                    {
                        text: "<" + this.currentSelectedItem.itemInfo.name + '>',
                        align: 'center'
                    },
                    {
                        text: this.currentSelectedItem.itemInfo.description
                    },
                    {
                        text: ''
                    }
                ]
                this.itemUITooltip.set({
                    owner: this,
                    noInputEvents: true,
                    ttArray: arr,
                    alpha: 0.5
                });
                this.itemUITooltip.sprite.anchor.x = 1.0;
                this.itemUITooltip.sprite.anchor.y = 1.0;
                this.itemUITooltip.sprite.position.x = Graphics.width - 5;
                this.itemUITooltip.sprite.position.y = Graphics.height - 5;
                Graphics.ui.addChild(this.itemUITooltip.sprite);*/
            }
        },

        setBattleChange: function(bool){
            if (bool){
                this.battleChange = true;
                this.battleTicker = 0;
                Graphics.uiContainer.removeChild(this.pokedexButton);
                Graphics.uiContainer.removeChild(this.inventoryButton);
                Graphics.uiContainer.removeChild(this.pokemonButton);
                Graphics.uiContainer.removeChild(this.characterButton);
                Graphics.uiContainer.removeChild(this.settingsButton);
            }else{
                this.battleChange = false;
                this.battleActive = false;
                Graphics.uiContainer.addChild(this.pokedexButton);
                Graphics.uiContainer.addChild(this.inventoryButton);
                Graphics.uiContainer.addChild(this.pokemonButton);
                Graphics.uiContainer.addChild(this.characterButton);
                Graphics.uiContainer.addChild(this.settingsButton);
                Graphics.uiPrimitives2.clear();
                Graphics.uiPrimitives1.clear();
            }
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
            if (this.screenTicker > this.SCREEN_CHANGE_TIME && this.newMapData && typeof this.mapsCache[this.newMapData[CENUMS.MAP]] != 'undefined'){
                this.setNewMap(this.newMapData[CENUMS.MAP]);
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
            //Perform the swapPkmn
            if (this.pkmnSwapTicker >= this.pkmnSwapSpeed){
                //send swap info to server
                var sData = {};
                sData[CENUMS.COMMAND] = CENUMS.SWAPPKMN;
                sData[CENUMS.POKEMON1] = first.pokemonNumber;
                sData[CENUMS.POKEMON2] = second.pokemonNumber;
                Acorn.Net.socket_.emit(CENUMS.PLAYERUPDATE,sData);

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
            Graphics.world.position.x = Graphics.width/2-mainObj.TILE_SIZE/2;
            Graphics.world.position.y = Graphics.height/2-mainObj.TILE_SIZE/2;
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
            Graphics.world.position.x -= sector.pos.x*sector.fullSectorSize;
            Graphics.world.position.y -= sector.pos.y*sector.fullSectorSize;
            Graphics.world.position.x -= Player.character.tile[0]*mainObj.TILE_SIZE;
            Graphics.world.position.y -= Player.character.tile[1]*mainObj.TILE_SIZE;

            Player.resetPos();
        },

        

        setNewMap: function(name){
            try{
                var myObj = this.mapsCache[name];
                Graphics.worldContainer.removeChildren();
                Graphics.worldContainer2.removeChildren();
                Graphics.charContainer1.removeChildren();
                Graphics.charContainer2.removeChildren();
                Graphics.uiPrimitives2.clear();
                Game.map = new GameMap();
                Game.map.init(myObj[CENUMS.MAPDATA]);
                Player.character.tile = Game.newMapData[CENUMS.TILE];
                Player.character.sector = Game.newMapData[CENUMS.SECTOR];
                Player.character.map = Game.newMapData[CENUMS.MAP];
                Game.resetPos();
                Game.screenChange = false;
                Game.screenTicker = 0;
                Graphics.uiPrimitives2.clear();
                for (var i = 0; i < Game.newMapData[CENUMS.PLAYERS].length;i++){
                    if (Game.newMapData[CENUMS.PLAYERS][i][CENUMS.OWNER] != mainObj.id){
                        PCS.addPC(Game.newMapData[CENUMS.PLAYERS][i]);
                    }
                }
                Game.newMapData = null;
                Game.requestMade = false;
            }catch(e){
                console.log(e);
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
            sprite.texture = Graphics.getResource('ow_' + Game.char[CENUMS.RESOURCE] + '_d1');
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
                    Game.switchUI(Game.pokedexUI);
                }
            });
            Graphics.uiContainer.addChild(this.pokedexButton);
            this.pokemonButton = Graphics.makeUiElement({
                texture: pkmnTex,
                interactive: true,buttonMode: true,
                position: [(Graphics.width/2 - padding/2 - bSize),bSize/2 + 10],
                anchor: [0.5,0.5],
                clickFunc: function onClick(e){
                   Game.switchUI(Game.pokemonUI);
                }
            });
            Graphics.uiContainer.addChild(this.pokemonButton);

            this.inventoryButton = Graphics.makeUiElement({
                texture: invTex,
                interactive: true,buttonMode: true,
                position: [Graphics.width/2,bSize/2 + 10],
                anchor: [0.5,0.5],
                clickFunc: function onClick(e){
                    Game.switchUI(Game.inventoryUI);
                    Game.currentItemView = 'main';
                    Game.resetItems();
                }
            });
            Graphics.uiContainer.addChild(this.inventoryButton);
            this.characterButton = Graphics.makeUiElement({
                texture: charTex,
                interactive: true,buttonMode: true,
                position: [(Graphics.width/2 + padding/2 + bSize),bSize/2 + 10],
                anchor: [0.5,0.5],
                clickFunc: function onClick(e){
                    Game.switchUI(Game.characterUI);
                }
            });
            Graphics.uiContainer.addChild(this.characterButton);
            this.settingsButton = Graphics.makeUiElement({
                texture: setTex,
                interactive: true,buttonMode: true,
                position: [(Graphics.width/2 + padding + bSize*2),bSize/2 + 10],
                anchor: [0.5,0.5],
                clickFunc: function onClick(e){
                    Game.switchUI(Game.settingsUI);
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

            var fSize = 24;
            var yLoc = 200;
            var options = {
                buffer: 15,
                roundedness: 20
            }
            //Main items button
            this.inventoryUIButtons.push(this.inventoryUI.addChild(Graphics.makeUiElement({
                text: 'ITEMS',
                style: AcornSetup.style3,
                position: [Graphics.width*0.2,yLoc],
            })));
            //pokeballs button
            this.inventoryUIButtons.push(this.inventoryUI.addChild(Graphics.makeUiElement({
                text: 'POK|BALLS',
                style: AcornSetup.style3,
                position: [Graphics.width*0.4,yLoc],
            })));
            //tms button
            this.inventoryUIButtons.push(this.inventoryUI.addChild(Graphics.makeUiElement({
                text: 'TMs',
                style: AcornSetup.style3,
                position: [Graphics.width*0.6,yLoc],
            })));
            //key items button
            this.inventoryUIButtons.push(this.inventoryUI.addChild(Graphics.makeUiElement({
                text: 'KEY ITEMS',
                style: AcornSetup.style3,
                position: [Graphics.width*0.8,yLoc],
            })));

            this.inventoryUseButton = this.inventoryUI.addChild(Graphics.makeUiElement({
                texture: this.getTextButton("USE",48,options),
                style: AcornSetup.style3,
                anchor: [0.5,1],
                position: [Graphics.width/2,Graphics.height - 25],
                interactive: true,buttonMode: true,
                clickFunc: function onClick(e){
                    var item = Game.currentSelectedItem.itemInfo;
                    var tt = item[CENUMS.TARGETTYPE];
                    if (Game.battleActive){
                        //use item in battle
                        Battle.currentSelectedItem = Game.currentSelectedItem;
                        if (tt == CENUMS.ALL || tt == CENUMS.BATTLE){
                            Battle.turnData = {};
                            Battle.turnData[CENUMS.COMMAND] = CENUMS.ITEM;
                            Battle.turnData[CENUMS.POKEMON] = Battle.currentPokemon.id;
                            Battle.turnData[CENUMS.ID] = item[CNUMS.ID];
                            Battle.currentSelectedItem = item;
                            Battle.hideTurnOptions();
                            Battle.getConfirmTurnWindow();
                        }else if (tt == CENUMS.ALLPKMN || tt == CENUMS.BATTLEPKMN){
                            Battle.currentSelectedItem = item;
                            Game.switchUI(Game.pokemonUI);
                        }else if (t == CENUMS.ENEMY){
                            Battle.currentSelectedItem = item;
                            Game.clearUI();
                            Battle.hideTurnOptions();
                            Battle.showTargetSelect('item');
                        }
                    }else{
                        //normal use the item here.
                        if (tt == CENUMS.ALL || tt == CENUMS.FIELD){
                        }else if (tt == CENUMS.ALLPKMN || tt == CENUMS.FIELDPKMN ){
                            Game.switchUI(Game.pokemonUI);
                            Game.currentSelectedItem = item;
                        }
                    }
                }
            }));
            this.inventoryUseButton.visible = false;
            this.inventoryUIButtons.push(this.inventoryUseButton);

            this.inventoryUIElements = [];
            this.inventoryUI.scale.x = this.UI_OFFSETSCALE;
            this.inventoryUI.scale.y = this.UI_OFFSETSCALE;
            this.inventoryUI.position.x = Graphics.width*((1-this.UI_OFFSETSCALE)/2);
            this.inventoryUI.position.y = Graphics.height*((1-this.UI_OFFSETSCALE)/2);
        },

        initPkmnUI: function(){
            this.pokemonUI.removeChildren();
            this.pokemonUI.alpha = 0.8;
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
            for (var i = 1; i < 7;i++){
                //make buttons;
                var container = new PIXI.Container();
                container.position.x = x;
                container.position.y = y - this.pkmnBoxSize[1]/2;
                container.interactive = true;
                container.buttonMode = true;
                container.hitArea = new PIXI.Rectangle(0, 0, this.pkmnBoxSize[0], this.pkmnBoxSize[1]);
                container.pokemonNumber = i;

                var mUpFunc = function(e){
                    if (Game.pkmnSwapChange){return;}
                    if (Game.battleActive){
                        //swap pokemon here??
                        //make sure it isnt active pokemon
                        if (Battle.currentSelectedItem){
                            Battle.turnData = {};
                            Battle.turnData[CENUMS.COMMAND] = CENUMS.ITEM;
                            Battle.turnData[CENUMS.POKEMON] = Battle.currentPokemon.id;
                            Battle.turnData[CENUMS.ID] = Battle.currentSelectedItem[CENUMS.ID];
                            Battle.turnData[CENUMS.TARGET] = Party.pokemon[e.currentTarget.pokemonNumber].id;
                            Game.clearUI();
                            Battle.getConfirmTurnWindow();
                            return;
                        }
                        console.log(e.currentTarget);
                        if (e.currentTarget.pokemonActive){
                            Battle.addChat('& That pokemon is already in battle!');
                            return;
                        }
                        if (!Party.getPokemon(Party.pokemon[e.currentTarget.pokemonNumber].id)){
                            return;
                        }
                        if (e.currentTarget.fainted){
                            Battle.addChat('& That Pokemon is fainted!');
                            return;
                        }
                        if (Battle.selectingNewPokemon){
                            var cData = {};
                            cData[CENUMS.COMMAND] = CENUMS.NEWPKMN;
                            cData[CENUMS.NUMBER] = Battle.newPokemonPos;
                            cData[CENUMS.POKEMON] = Party.pokemon[e.currentTarget.pokemonNumber].id;
                            Acorn.Net.socket_.emit(CENUMS.BATTLEUPDATE,cData);
                            Battle.selectingNewPokemon = false;
                            Battle.newPokemonButtons[Battle.newPokemonPos].visible = false;
                            aGame.clearUI();
                            return;
                        }
                        Battle.turnData = {};
                        Battle.turnData[CENUMS.COMMAND] = CENUMS.SWAPPKMN;
                        Battle.turnData[CENUMS.POKEMON] = Battle.currentPokemon.id;
                        Battle.turnData[CENUMS.TARGET] = Party.pokemon[e.currentTarget.pokemonNumber].id;
                        Game.clearUI();
                        Battle.getConfirmTurnWindow();
                        return;
                    }
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
                this.pokemonUIElements[i] = container;
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

            var itemTypes = [CENUMS.MAIN, CENUMS.BALL,CENUMS.TM,CENUMS.KEY];
            var yStart = 275;
            var xStart = Graphics.width*0.2;
            var options = {
                buffer: 15,
                roundedness: 20
            };

            for (var j = 0; j < itemTypes.length;j++){
                var itemArr = Player.character.inventory[CENUMS.ORDER][itemTypes[j]];
                for (var i = 0; i < itemArr.length;i++){
                    var item = Player.character.inventory[CENUMS.ITEMS][itemArr[i]];
                    var newButton = Graphics.makeUiElement({
                        texture: this.getTextButton(item[CENUMS.NAME],24,options),
                        style: AcornSetup.style3,
                        position: [xStart,yStart],
                        interactive: true,buttonMode: true,
                        clickFunc: function onClick(e){
                            if (Game.currentSelectedItem){
                                Game.currentSelectedItem.filters = []
                                Game.itemUITooltip = null;
                            }
                            Game.currentSelectedItem = e.currentTarget;
                            var filter = new PIXI.filters.GlowFilter(10, 2, 1.5, 0xFF00000, 0.5);
                            Game.currentSelectedItem.filters = [filter];
                            if (Game.canUse(e.currentTarget.itemInfo[CENUMS.TARGETTYPE])){
                                Game.inventoryUseButton.visible = true;
                            }else{
                                Game.inventoryUseButton.visible = false;
                            }
                        }
                    });
                    yStart += newButton.height + 5;
                    newButton.orderIndex = i;
                    newButton.itemInfo = item;
                    this.inventoryUIElements.push(this.inventoryUI.addChild(newButton));
                }
                yStart = 275;
                xStart += Graphics.width*0.2;
            }
        },
        canUse(itemTT){
            if (Game.battleActive){
                switch(itemTT){
                    case CENUMS.BATTLE:
                        return true;
                        break;
                    case CENUMS.BATTLEPKMN:
                        return true;
                        break;
                    case CENUMS.ALL:
                        return true;
                        break;
                    case CENUMS.ALLPKMN:
                        return true;
                        break;
                    case CENUMS.ENEMY:
                        return true;
                        break;
                    case CENUMS.BALL:
                        if (Battle.wild){
                            return true;
                        }
                        break;
                }
            }else{
                switch(itemTT){
                    case CENUMS.FIELD:
                        return true;
                        break;
                    case CENUMS.ALL:
                        return true;
                        break;
                    case CENUMS.FIELDPKMN:
                        return true;
                        break;
                    case CENUMS.ALLPKMN:
                        return true;
                        break;
                }
            }
            return false;
        },
        updatePokemonBox: function(c){
            var xSize = this.pkmnBoxSize[0];
            var ySize = this.pkmnBoxSize[1];
            var pokemon = c.pokemon;
            if (c.pokemon == ''){
                return;
            }
            c.pokeSprite.texture = Graphics.getResource('' + pokemon.number);
            c.nnText.text = pokemon.nickname;
            c.lvlText.text = "L: " + pokemon.level;
            //HP Display
            c.hpText.text = "HP: " + pokemon.currentHP + '/' + pokemon.hp;
            c.gfx.clear();
            c.gfx.lineStyle(5,0x000000,1);
            c.gfx.beginFill(0xFFFFFF,1);
            c.gfx.drawRoundedRect(0,0,xSize,ySize,25);
            c.gfx.endFill();
            if (pokemon.currentHP != pokemon.hp){
                c.gfx.lineStyle(2,0x707070,1);
                c.gfx.beginFill(0x707070,1);
                var size = xSize/3 * (pokemon.currentHP/pokemon.hp);
                c.gfx.drawRoundedRect(c.pokeSprite.position.x,c.pokeSprite.position.y + c.pokeSprite.height + 5,size,15,6);
                c.gfx.drawRect(c.pokeSprite.position.x+10,c.pokeSprite.position.y + c.pokeSprite.height + 5,size-10,15);
                c.gfx.endFill();

                c.gfx.lineStyle(2,0x000000,1);
                c.gfx.beginFill(0x707070,0);
                c.gfx.drawRoundedRect(c.pokeSprite.position.x,c.pokeSprite.position.y + c.pokeSprite.height + 5,xSize/3,15,6);
                c.gfx.endFill();
            }else{
                c.gfx.lineStyle(2,0x000000,1);
                c.gfx.beginFill(0x707070,1);
                c.gfx.drawRoundedRect(c.pokeSprite.position.x,c.pokeSprite.position.y + c.pokeSprite.height + 5,xSize/3,15,6);
                c.gfx.endFill();
            }

            c.attack.text = pokemon.attack;
            c.defense.text = pokemon.defense;
            c.spattack.text = pokemon.specialAttack;
            c.spdefense.text = pokemon.specialDefense;
            c.speed.text = pokemon.speed;
            
            c.overlayText.visible = false;
            c.fainted = false;
            c.pkmnActive = false;            
            if (pokemon.currentHP == 0){
                c.overlayText.text = 'Fainted';
                c.overlayText.visible = true;
                c.fainted = true;
            }
            if (this.battleActive){
                if (Battle.pokemonContainer[pokemon.id]){
                    c.overlayText.text = 'Active';
                    c.overlayText.visible = true;
                    c.pokemonActive = true;
                }
            }
        },
        resetPokemon: function(slot){
            var xSize = this.pkmnBoxSize[0];
            var ySize = this.pkmnBoxSize[1];
            var pokemon = Party.pokemon[slot];
            var c = this.pokemonUIElements[slot];
            c.removeChildren();
            c.pokemon = pokemon;
            if (typeof Party.pokemon[slot] == 'undefined' || Party.pokemon[slot] == '' ){
                this.pokemonUI.removeChild(c);
                return;
            }

            //get texture for button, set to interactive etc.
            var gfx = new PIXI.Graphics();
            var sprites = new PIXI.Container();
            gfx.lineStyle(5,0x000000,1);
            gfx.beginFill(0xFFFFFF,1);
            gfx.drawRoundedRect(0,0,xSize,ySize,25);
            gfx.endFill();
            c.gfx = gfx;
            c.spr = sprites;
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
                if (pokemon.currentHP == 0){size = 0;}
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
            c.spattack = new PIXI.Text(pokemon.specialAttack, AcornSetup.style2);
            c.spattack.anchor.x = 1.0;
            c.spattack.position.x = c.pokeSprite.position.x + xSize/3;
            c.spattack.position.y = def.position.y + def.height + 5;
            sprites.addChild(c.spattack);

            var spdef = new PIXI.Text("SP. DEFENSE: ", AcornSetup.style2);
            spdef.position.x = c.pokeSprite.position.x;
            spdef.position.y = spatk.position.y + spatk.height + 5;
            sprites.addChild(spdef);
            c.spdefense = new PIXI.Text(pokemon.specialDefense, AcornSetup.style2);
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

                var name = new PIXI.Text(move[CENUMS.NAME],AcornSetup.style2);
                var pp = new PIXI.Text('PP: ' + pokemon.currentPP[i] + '/' + move[CENUMS.PP],AcornSetup.style2);
                var type = new PIXI.Text(this.typeList[move[CENUMS.TYPE]],AcornSetup.style2);
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
            c.overlayText = new PIXI.Text('',AcornSetup.style2);
            c.overlayText.visible = false;
            c.overlayText.position.x = xSize/2;
            c.overlayText.position.y = ySize/2;
            c.overlayText.anchor.x = 0.5;
            c.overlayText.anchor.y = 0.5;
            c.overlayText.style.fontSize = 64;
            c.overlayText.style.fill = 'red';
            c.fainted = false;
            c.pkmnActive = false;
            sprites.addChild(c.overlayText);
            if (pokemon.hpPercent == 0){
                c.overlayText.text = 'Fainted';
                c.overlayText.visible = true;
                c.fainted = true;
            }
            if (this.battleActive){
                if (Battle.pokemonContainer[pokemon.id]){
                    c.overlayText.text = Active;
                    c.overlayText.visible = true;
                    c.pokemonActive = true;
                }
            }

            this.pokemonUI.addChild(c);
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

        switchUI: function(ui){
            if (Game.uiActive){
                Graphics.ui.removeChild(Game.uiActive);
                Acorn.Sound.play('select');
            }else{
                Acorn.Sound.play('menu');
            }
            this.clearUI();
            Graphics.ui.addChild(ui);
            if (this.battleActive){
                Battle.hideTurnOptions();
            }
            Game.uiActive = ui;
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
            if (this.battleActive){
                Battle.showTurnOptions();
                Battle.hideTargetSelect();
            }
            this.uiActive = null;
            this.currentSelectedItem = null;
            this.currentSelectedItemIndex = null;
            this.inventoryUseButton.visible = false;
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
