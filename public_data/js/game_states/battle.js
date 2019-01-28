
(function(window) {
    Battle = {
        BUTTON_BUFFER: 10,
        battleData: null,

        init: function() { 
            this.wild = null;
            this.myTeam = null;
            this.otherTeam = null;
            this.chatLog = [];

            this.roundActive = false;
            this.turn = null; //turn animations/etc are playing
            this.wildStart = false;

            this.trainerStart = false;

            this.gopkmnStart = false;
            this.gopkmnTicker = 0;

            //container for sprites and healthbars of each team
            this.pokemonSpriteContainer = {};

            //container for all pokemon info
            this.pokemonContainer = {};

            //The player's currently active pokemon
            this.myActivePokemon = {};
            this.activePokemon = {};
            this.currentPokemonIndex = 0;

            //trainerInfo
            this.trainers = {};

            this.pokemonButton = null;
            this.itemButton = null;
            this.fightButton = null;
            this.runButton = null;

            this.pokemonUI = null;
            this.itemUI = null;
            this.fightUI = null;

            this.confirmTurnWindow = null;
            this.turnData = {};
            this.currentSelectedItem = null;
            this.currentSelectedAttack = null;
            this.moveButtons = [];

            this.targetSelectMode = '';
            this.targetSelectText = null;
            this.waitingForData = false;

            this.end = false;
            this.endTicker = 0;
            this.ticker = 0;

            this.ready = false;

            this.chargeCounter = this.battleData[CENUMS.CHARGECOUNTER];

            Graphics.uiPrimitives1.clear();
            Graphics.uiPrimitives1.lineStyle(3,0x000000,1);
            Graphics.uiPrimitives1.beginFill(0xFFFFFF,1);
            Graphics.uiPrimitives1.drawRect(0,0,Graphics.width/4,Graphics.height);
            Graphics.uiPrimitives1.drawRect(Graphics.width/4,0,Graphics.width*0.75,Graphics.height*0.75);
            Graphics.uiPrimitives1.drawRect(Graphics.width/4,Graphics.height*0.75,Graphics.width*0.75,Graphics.height/4);
            Graphics.uiPrimitives1.endFill();
            console.log("init!");
            console.log(this.battleData);

            this.fightButton = Graphics.makeUiElement({
                texture: this.getButtonTexture('FIGHT!'),
                anchor: [0,0],
                position: [Graphics.width/4 + this.BUTTON_BUFFER,Graphics.height*0.75 + this.BUTTON_BUFFER],
                interactive: true,buttonMode: true,
                clickFunc: function onClick(e){
                    console.log("fight menu");
                    //SHOW Fight Menu
                    Battle.showFightUI();
                }
            });

            this.pokemonButton = Graphics.makeUiElement({
                texture: this.getButtonTexture('POK|MON'),
                anchor: [0,0],
                position: [Graphics.width/4 + (Graphics.width*0.75/2) + this.BUTTON_BUFFER,Graphics.height*0.75 + this.BUTTON_BUFFER],
                interactive: true,buttonMode: true,
                clickFunc: function onClick(e){
                    console.log("pokemon menu");
                    //SHOW Pokemon Menu
                    this.currentlySelectedItem = null;
                    Battle.showPokemonUI();
                }
            });

            this.itemButton = Graphics.makeUiElement({
                texture: this.getButtonTexture('ITEM'),
                anchor: [0,0],
                position: [Graphics.width/4 + this.BUTTON_BUFFER,Graphics.height*0.75 + Graphics.height/8 + this.BUTTON_BUFFER],
                interactive: true,buttonMode: true,
                clickFunc: function onClick(e){
                    console.log("item menu");
                    //SHOW Item Menu
                    Battle.showItemUI();
                }
            });

            this.runButton = Graphics.makeUiElement({
                texture: this.getButtonTexture('RUN'),
                anchor: [0,0],
                position: [Graphics.width/4 + (Graphics.width*0.75/2) + this.BUTTON_BUFFER,Graphics.height*0.75 + Graphics.height/8 + this.BUTTON_BUFFER],
                interactive: true,buttonMode: true,
                clickFunc: function onClick(e){
                    if (Battle.wild){
                        Battle.turnData['run'] = true;
                        Battle.toggleTurnOptions(false);
                        Battle.getConfirmTurnWindow();
                    }
                }
            });

            this.targetSelectText = new PIXI.Text('',AcornSetup.style2);
            this.targetSelectText.anchor.x = 0.5;
            this.targetSelectText.anchor.y = 0.5;
            this.targetSelectText.position.x = Graphics.width/4 + (Graphics.width*0.75/2);
            this.targetSelectText.position.y = Graphics.height*0.75 + Graphics.height/8;
            //get which team you're on
            var myT = null; //my team
            var oT = null; //other team;
            var myTP = null; //my team pokemon
            var oTP = null; //otherteam pokemon
            for (var i = 0; i < this.battleData[CENUMS.TEAM1POKEMON].length;i++){
                var pokemon = new Pokemon();
                pokemon.init(this.battleData[CENUMS.TEAM1POKEMON][i]);
                this.pokemonContainer[pokemon.id] = pokemon;
                this.pokemonContainer[pokemon.id].n = i;
                for (var j in Party.pokemon){
                    if (pokemon.id == Party.pokemon[j].id){
                        myTP = this.battleData[CENUMS.TEAM1POKEMON];
                        oTP = this.battleData[CENUMS.TEAM2POKEMON];
                        myT = this.battleData[CENUMS.TEAM1];
                        oT = this.battleData[CENUMS.TEAM2];
                        this.myActivePokemon[Party.pokemon[j].id] = Party.pokemon[j];
                        this.pokemonContainer[pokemon.id] = Party.pokemon[j];
                    }
                }
            }
            for (var i = 0; i < this.battleData[CENUMS.TEAM2POKEMON].length;i++){
                var pokemon = new Pokemon();
                pokemon.init(this.battleData[CENUMS.TEAM2POKEMON][i]);
                this.pokemonContainer[pokemon.id] = pokemon;
                this.pokemonContainer[pokemon.id].n = i;
                for (var j in Party.pokemon){
                    if (pokemon.id == Party.pokemon[j].id){
                        myTP = this.battleData[CENUMS.TEAM2POKEMON];
                        oTP = this.battleData[CENUMS.TEAM1POKEMON];
                        myT = this.battleData[CENUMS.TEAM2];
                        oT = this.battleData[CENUMS.TEAM1];
                        this.myActivePokemon[Party.pokemon[j].id] = Party.pokemon[j];
                        this.pokemonContainer[pokemon.id] = Party.pokemon[j];
                    }
                }
            }
            this.myTeam = {};
            this.otherTeam = {};
            for (var i = 0; i < myTP.length;i++){
                this.myTeam[myTP[i][CENUMS.ID]] = this.pokemonContainer[myTP[i][CENUMS.ID]];
            }
            for (var i = 0; i < oTP.length;i++){
                this.otherTeam[oTP[i][CENUMS.ID]] = this.pokemonContainer[oTP[i][CENUMS.ID]];
            }

            for (var i = 0; i < myT.length;i++){
                if (typeof myT[i][CENUMS.NUMBER] != 'undefined'){continue;}
                this.trainers[myT[i][CENUMS.ID]] = {
                    id: myT[i][CENUMS.ID],
                    name: myT[i][CENUMS.NAME],
                    sprite: Graphics.getSprite(myT[i][CENUMS.RESOURCE]),
                    moveVector: null,
                    ticker: 0,
                    team: 1
                };
                this.trainers[myT[i][CENUMS.ID]].sprite.scale.x = -3;
                this.trainers[myT[i][CENUMS.ID]].sprite.scale.y = 3;
                this.trainers[myT[i][CENUMS.ID]].sprite.anchor.x = 0.5;
                this.trainers[myT[i][CENUMS.ID]].sprite.anchor.y = 0.5;
                this.trainers[myT[i][CENUMS.ID]].sprite.position.x = Graphics.width/4 + (Graphics.width*0.75 - (Graphics.width*0.75)*(3/4));
                this.trainers[myT[i][CENUMS.ID]].sprite.position.y = (Graphics.height*0.75)/(myT.length+1)*(i+1);
                Graphics.uiContainer2.addChild(this.trainers[myT[i][CENUMS.ID]].sprite);
            }

            for (var i = 0; i < oT.length;i++){
                if (typeof oT[i][CENUMS.NUMBER] != 'undefined'){continue;}
                this.trainers[oT[i][CENUMS.ID]] = {
                    id: oT[i][CENUMS.ID],
                    name: oT[i][CENUMS.NAME],
                    sprite: Graphics.getSprite(oT[i][CENUMS.RESOURCE]),
                    moveVector: null,
                    ticker: 0,
                    team: 2
                };
                this.trainers[oT[i][CENUMS.ID]].sprite.scale.x = 3;
                this.trainers[oT[i][CENUMS.ID]].sprite.scale.y = 3;
                this.trainers[oT[i][CENUMS.ID]].sprite.anchor.x = 0.5;
                this.trainers[oT[i][CENUMS.ID]].sprite.anchor.y = 0.5;
                this.trainers[oT[i][CENUMS.ID]].sprite.position.x = Graphics.width/4 + (Graphics.width*0.75 - (Graphics.width*0.75)/4);
                this.trainers[oT[i][CENUMS.ID]].sprite.position.y = (Graphics.height*0.75)/(oT.length+1)*(i+1);
                Graphics.uiContainer2.addChild(this.trainers[oT[i][CENUMS.ID]].sprite);
            }

            //TODO if myTeam or otherteam = null, you are a spectator
            var c = 1;
            for (var i in this.myTeam){
                this.pokemonSpriteContainer[this.myTeam[i].id] = this.getPokemonData(this.pokemonContainer[this.myTeam[i].id],c,myTP.length,1)
                c += 1;
            }
            c = 1;
            for (var i in this.otherTeam){
                this.pokemonSpriteContainer[this.otherTeam[i].id] =  this.getPokemonData(this.pokemonContainer[this.otherTeam[i].id],c,oTP.length,2)
                c += 1;
            }
            if (this.battleData[CENUMS.WILD]){
                this.wild = true;
                this.wildStart = true;
            }else{
                this.wild = false;
                this.trainerStart = true;
            }

        },
        
        update: function(dt){ 
            
            if (this.wildStart){
                //wild pokemon start battle cutscene
                this.updateWildStart(dt);
            }
            if (this.gopkmnStart){
                //sending out your pokemon cutscene
                this.updateGopkmnStart(dt);
            }
            if (this.trainerStart){
                //sending out your pokemon cutscene
                this.updateTrainerStart(dt);
            }
            if (!this.ready){
                return;
            }

            for (var i in this.pokemonContainer){
                this.pokemonContainer[i].update(dt);
            }
            /*
            if (this.end){
                this.endTicker += dt;
                if (this.endTicker >= 3.0){
                    Acorn.Sound.play(Game.cMusic);
                    Graphics.uiContainer2.removeChildren();
                    Game.setBattleChange(false);
                }
            }
            if (this.turn != null){
                this.turn.update(dt);
                if (this.turn.end){
                    Acorn.Net.socket_.emit('battleUpdate',{command: 'roundReady'});
                    this.turn = null;
                }
            }
            if (!Game.chatActive){
                if (Acorn.Input.isPressed(Acorn.Input.Key.COMMAND)){
                    Game.chat.value = '/';
                    Graphics.uiContainer2.removeChild(Game.chatButton);
                    document.body.appendChild( Game.chat );
                    Game.chat.focus();
                    Game.chatActive = true;
                }
                if (Acorn.Input.isPressed(Acorn.Input.Key.TALK)){
                    Game.chat.value = '';
                    Graphics.uiContainer2.removeChild(Game.chatButton);
                    document.body.appendChild( Game.chat );
                    Game.chat.focus();
                    Game.chatActive = true;
                }
            }
            */
        },

        setChargeCounter: function(v){
            this.chargeCounter = v;
        },

        getPokemonData: function(pkmn,n,teamSize,team){
            
            var d = {}; 
            d.pokemon = pkmn;
            d.sprite = Graphics.getSprite(pkmn.number);
            d.sprite.scale.x = 3;
            d.sprite.scale.y = 3;
            d.sprite.anchor.x = 0.5;
            d.sprite.anchor.y = 0.5;
            d.sprite.buttonMode = true;
            d.sprite.interactive = true;
            d.sprite.pkmninfo = pkmn;
            if (team == 1){
                d.sprite.scale.x = -3;
                d.sprite.position.x = Graphics.width/4 + (Graphics.width*0.75 - (Graphics.width*0.75)*(3/4));
                d.sprite.position.y = ((Graphics.height*0.75)/(teamSize+1))*n;
            }else if (team == 2){
                d.sprite.position.x = Graphics.width/4 + (Graphics.width*0.75 - (Graphics.width*0.75)/4);
                d.sprite.position.y = ((Graphics.height*0.75)/(teamSize+1))*n;
            }
            var onClick = function(e){
                switch(Battle.targetSelectMode){
                    case 'item':
                        if (Battle.wild == false || e.currentTarget.pkmninfo.id == Battle.activePokemonIndex[Battle.currentPokemonIndex].id){
                            return;
                        }
                        Battle.turnData[Battle.myActivePokemon[Battle.activePokemonIndex[Battle.currentPokemonIndex]].id] = {
                            command: 'item',
                            type: Battle.currentSelectedItem.itemInfo.type,
                            oIndex: Battle.currentSelectedItem.orderIndex,
                            pID: e.currentTarget.pkmninfo.id,
                            pIndex: e.currentTarget.pIndex
                        };
                        Game.clearUI();
                        Battle.checkTurnReady();
                        break;
                    case 'pkmn':
                        //TODO make sure its not the active pokemon
                        if (e.currentTarget.pkmninfo.id == Battle.activePokemonIndex[Battle.currentPokemonIndex].id){
                            return;
                        }
                        Battle.turnData[Battle.myActivePokemon[Battle.activePokemonIndex[Battle.currentPokemonIndex]].id] = {
                            command: 'fight',
                            moveIndex: Battle.currentSelectedAttack,
                            pID: e.currentTarget.pkmninfo.id,
                            pIndex: e.currentTarget.pIndex
                        };
                        Game.clearUI();
                        Battle.checkTurnReady();
                        break;
                    default:
                        break;
                }
            }
            d.sprite.on('tap', onClick);
            d.sprite.on('click', onClick);
            Graphics.uiContainer2.addChild(d.sprite);
            d.sprite.visible = false;
            
            d.nameDisplay = new PIXI.Text(pkmn.nickname,AcornSetup.style2);
            d.nameDisplay.anchor.y = 0.5;
            if (team == 1){
                d.nameDisplay.anchor.x = 0;
                d.nameDisplay.position.x = Graphics.width/4 + 10;
                d.nameDisplay.position.y = d.sprite.position.y;
            }else if (team == 2){
                d.nameDisplay.anchor.x = 0;
                d.nameDisplay.position.x = Graphics.width - (Graphics.width*(1/8)+10);
                d.nameDisplay.position.y = d.sprite.position.y;
            }
            d.levelDisplay = new PIXI.Text('L: ' + pkmn.level,AcornSetup.style2);
            d.levelDisplay.anchor.y = 0.5;
            if (team == 1){
                d.levelDisplay.anchor.x = 1;
                d.levelDisplay.position.x = Graphics.width/4 + (Graphics.width*(1/8)-10);
                d.levelDisplay.position.y = d.sprite.position.y;
            }else if (team == 2){
                d.levelDisplay.anchor.x = 1;
                d.levelDisplay.position.x = Graphics.width-10;
                d.levelDisplay.position.y = d.sprite.position.y;
            }
            d.hpBar = new PIXI.Graphics();
            d.hpBar.position.x = d.nameDisplay.position.x;
            d.hpBar.position.y = d.sprite.position.y + d.levelDisplay.height/2 + 5;
            d.chargeBar = new PIXI.Graphics();
            d.chargeBar.position.x = d.nameDisplay.position.x;
            d.chargeBar.position.y = d.sprite.position.y + d.levelDisplay.height/2 + 30;
            if (!pkmn.currentHP){
                this.drawHPBar(d.hpBar,pkmn.hpPercent/100);
            }else{
                this.drawHPBar(d.hpBar,pkmn.currentHP/pkmn.hp);
            }
            console.log(pkmn.charge);
            console.log(this.chargeCounter)
            this.drawChargeBar(d.chargeBar,pkmn.charge/this.chargeCounter);
            return d;
        },
        drawHPBar: function(gfx,percent){
            gfx.clear();
            var xSize = ((Graphics.width)/8);
            var ySize = 20;
            if (percent != 1){
                gfx.lineStyle(2,0x707070,1);
                gfx.beginFill(0x707070,1);
                var size = xSize * percent;
                gfx.drawRoundedRect(0,0,size,ySize,10);
                gfx.drawRect(10,0,Math.min(0,size-10),ySize);
                gfx.endFill();

                gfx.lineStyle(2,0x000000,1);
                gfx.beginFill(0x707070,0);
                gfx.drawRoundedRect(0,0,xSize,ySize,10);
                gfx.endFill();
            }else{
                gfx.lineStyle(2,0x000000,1);
                gfx.beginFill(0x707070,1);
                gfx.drawRoundedRect(0,0,xSize,ySize,10);
                gfx.endFill();
            }
        },
        drawChargeBar: function(gfx,percent){
            gfx.clear();
            var xSize = ((Graphics.width)/8);
            var ySize = 10;
            if (percent != 1){
                gfx.lineStyle(2,0xff8484,1);
                gfx.beginFill(0xff8484,1);
                var size = xSize * percent;
                gfx.drawRect(0,0,size,ySize);
                gfx.endFill();

                gfx.lineStyle(2,0x000000,1);
                gfx.beginFill(0x707070,0);
                gfx.drawRect(0,0,xSize,ySize);
                gfx.endFill();
            }else{
                gfx.lineStyle(2,0x000000,1);
                gfx.beginFill(0xff8484,1);
                gfx.drawRect(0,0,xSize,ySize);
                gfx.endFill();
            }
        },
        updateWildStart: function(dt){
            this.ticker += dt;
            var stop = false;
            for (var i in this.otherTeam){
                this.pokemonSpriteContainer[i].sprite.tint = 0x000000;
                this.pokemonSpriteContainer[i].sprite.visible = true;
            }
            for (var i in this.otherTeam){
                if (this.ticker >= 2.0){
                    //next phase!
                    this.addChat("& A wild " + this.otherTeam[i].nickname.toUpperCase() + ' appeared!');
                    this.pokemonSpriteContainer[i].sprite.tint = 0xFFFFFF;
                    Graphics.uiContainer2.addChild(this.pokemonSpriteContainer[i].nameDisplay);
                    Graphics.uiContainer2.addChild(this.pokemonSpriteContainer[i].levelDisplay);
                    Graphics.uiContainer2.addChild(this.pokemonSpriteContainer[i].hpBar);
                    Graphics.uiContainer2.addChild(this.pokemonSpriteContainer[i].chargeBar);
                    stop = true;
                }
            }
            if (stop){
                this.wildStart = false;
                this.gopkmnStart = true;
                this.gopkmnTicker = 0;
            }
        },
        updateTrainerStart: function(dt){
            var out = false;
            for (var i in this.trainers){
                var trainer = this.trainers[i];
                if (trainer.team == 1){continue;}
                trainer.ticker += dt;
                if (trainer.ticker >= 2.0){
                    this.addChat("& " + trainer.name.toUpperCase() + ' wants to battle!');
                    trainer.moveVector = [1,0];
                    trainer.ticker = -Infinity;
                }
                if (trainer.moveVector){
                    trainer.sprite.position.x += trainer.moveVector[0]*dt*15;
                    trainer.moveVector[0] *= 1.05;
                    if (trainer.sprite.position.x >= Graphics.width*1.1){
                        out = true;
                        Graphics.uiContainer2.removeChild(trainer.sprite);
                    }
                }
            }
            if (out){
                for (var i in this.otherTeam){
                    this.pokemonSpriteContainer[i].sprite.visible = true;
                    this.addChat("& " + trainer.name.toUpperCase() + ' sends out ' + this.otherTeam[i].nickname.toUpperCase() + '!');
                    Graphics.uiContainer2.addChild(this.pokemonSpriteContainer[i].hpBar);
                    Graphics.uiContainer2.addChild(this.pokemonSpriteContainer[i].chargeBar);
                    Graphics.uiContainer2.addChild(this.pokemonSpriteContainer[i].nameDisplay);
                    Graphics.uiContainer2.addChild(this.pokemonSpriteContainer[i].levelDisplay);
                }
                this.trainerStart = false;
                this.gopkmnStart = true;
                this.gopkmnTicker = 0;
            }
        },

        updateGopkmnStart: function(dt){
            var out = false;
            for (var i in this.trainers){
                var trainer = this.trainers[i];
                if (trainer.team == 2){continue;}
                trainer.ticker += dt;
                if (trainer.ticker >= 2.0){
                    if (trainer.id != Player.character.id){
                        this.addChat("& " + trainer.name.toUpperCase() + ': lets do this!');
                    }
                    trainer.moveVector = [-1,0];
                    trainer.ticker = -Infinity;
                }
                if (trainer.moveVector){
                    trainer.sprite.position.x += trainer.moveVector[0]*dt*15;
                    trainer.moveVector[0] *= 1.05;
                    if (trainer.sprite.position.x <= Graphics.width/4){
                        out = true;
                        Graphics.uiContainer2.removeChild(trainer.sprite);
                    }
                }
            }
            if (out){
                for (var i in this.myTeam){

                    if (this.myTeam[i].owner == Player.character.id){
                        this.addChat("& " + ' Go, ' + this.myTeam[i].nickname.toUpperCase() + '!');
                    }else{
                        this.addChat("& " + trainer.name.toUpperCase() + ' sends out ' + this.myTeam[i].nickname.toUpperCase() + '!');
                    }
                    this.pokemonSpriteContainer[i].sprite.visible = true;
                    Graphics.uiContainer2.addChild(this.pokemonSpriteContainer[i].hpBar);
                    Graphics.uiContainer2.addChild(this.pokemonSpriteContainer[i].chargeBar);
                    Graphics.uiContainer2.addChild(this.pokemonSpriteContainer[i].nameDisplay);
                    Graphics.uiContainer2.addChild(this.pokemonSpriteContainer[i].levelDisplay);
                }
                this.gopkmnStart = false
            }
            if (!this.gopkmnStart){
                this.ticker = 0;
                var sData = {};
                sData[CENUMS.COMMAND] = CENUMS.READY;
                Acorn.Net.socket_.emit(CENUMS.BATTLEUPDATE,sData);
            }
        },

        toggleTurnOptions: function(bool){
            if (this.waitingForData){
                this.targetSelectText.text = 'Waiting...'
                Graphics.uiContainer2.addChild(this.targetSelectText);
                return;
            }
            if (bool && this.roundActive){
                //remove previous highlights
                for (var i in this.myActivePokemon){
                    Battle.pokemonSpriteContainer[Battle.myActivePokemon[i].id].sprite.filters = [];
                }
                Graphics.uiContainer2.addChild(this.fightButton);
                Graphics.uiContainer2.addChild(this.pokemonButton);
                Graphics.uiContainer2.addChild(this.itemButton);
                Graphics.uiContainer2.addChild(this.runButton);
                //highlight the active pokemon
                var outLineFilter = new PIXI.filters.GlowFilter(10, 2, 1.5, 0xFF00000, 0.5);
                this.pokemonSpriteContainer[Battle.myActivePokemon[Battle.activePokemonIndex[Battle.currentPokemonIndex]].id].sprite.filters = [outLineFilter];
            }else{
                for (var i in this.myActivePokemon){
                    Battle.pokemonSpriteContainer[Battle.myActivePokemon[i].id].sprite.filters = [];
                }
                Graphics.uiContainer2.removeChild(this.fightButton);
                Graphics.uiContainer2.removeChild(this.pokemonButton);
                Graphics.uiContainer2.removeChild(this.itemButton);
                Graphics.uiContainer2.removeChild(this.runButton);
                for (var i = 0; i < this.moveButtons.length;i++){
                    Graphics.uiContainer2.removeChild(this.moveButtons[i]);
                }
                this.moveButtons = [];
            }
        },

        toggleTargetSelect: function(bool,type){
            if (this.waitingForData){
                this.targetSelectText.text = 'Waiting...'
                Graphics.uiContainer2.addChild(this.targetSelectText);
                return;
            }
            if (bool){
                //remove previous highlights
                for (var i in this.myActivePokemon){
                    Battle.pokemonSpriteContainer[Battle.myActivePokemon[i].id].sprite.filters = [];
                }
                type = (typeof type != 'undefined')? type : '';
                if (type == 'item'){
                    this.targetSelectText.text = "Pick a pokemon to use " + this.currentSelectedItem.itemInfo.name + ' on!';
                    this.targetSelectMode = 'item';
                }else if (type == 'pkmn'){
                    this.targetSelectText.text = "Pick a pokemon to use " + Battle.myActivePokemon[i].moves[this.currentSelectedAttack].name + ' on!';
                    this.targetSelectMode = 'pkmn';
                }
                Graphics.uiContainer2.addChild(this.targetSelectText);
            }else{
                for (var i in this.myActivePokemon){
                    Battle.pokemonSpriteContainer[Battle.myActivePokemon[i].id].sprite.filters = [];
                }
                Graphics.uiContainer2.removeChild(this.targetSelectText);
            }
        },

        showFightUI: function(){
            this.toggleTurnOptions(false);
            this.currentPokemonIndex = 0;
            var activePokemon = this.myActivePokemon[this.activePokemonIndex[this.currentPokemonIndex]];
            //display moves
            //TODO ADD BACK BUTTON
            this.displayMoves(activePokemon);
        },

        showPokemonUI: function(){
            Game.switchUI(Game.pokemonUI);
            this.toggleTurnOptions(false);
        },

        showItemUI: function(){
            Game.switchUI(Game.inventoryUI);
            Game.resetItems();
            this.toggleTurnOptions(false);
        },

        checkTurnReady: function(){
            //check if all active pokemon have Turn data
            var ready = true;
            for (var i = 0; i < Battle.activePokemonIndex.length;i++){
                if (typeof Battle.turnData[Battle.activePokemonIndex[i]] == 'undefined'){
                    ready = false;
                    Battle.currentPokemonIndex = i;
                    Battle.toggleTurnOptions(true);
                    break;
                }
            }
            //otherwise send turn data
            if (ready){
                Battle.toggleTurnOptions(false);
                Battle.sendTurnData();
            }
        },

        //Display the move buttons for a given pokemon
        displayMoves: function(pkmn){
            //Remove any existing move buttons from UI container and reset
            for (var i = 0; i < this.moveButtons.length;i++){
                Graphics.uiContainer2.removeChild(this.moveButtons[i]);
            }
            this.moveButtons = [];

            for (var i = 0; i < pkmn.moves.length;i++){
                var move = pkmn.moves[i];
                var button = Graphics.makeUiElement({
                    texture: this.getMoveTexture(move,pkmn.currentPP[i]),
                    anchor: [0,0],
                    position: [Graphics.width/4 + this.BUTTON_BUFFER,Graphics.height*0.75 + this.BUTTON_BUFFER],
                    interactive: true,buttonMode: true,
                    clickFunc: function onClick(e){
                        //set turn data
                        //TODO for 'all' and 'self' type attacks, skip target selection
                        Battle.currentSelectedAttack = e.currentTarget.moveIndex;
                        Battle.toggleTurnOptions(false);
                        Battle.toggleTargetSelect(true,'pkmn');
                    }
                });

                button.pkmnID = pkmn.id;
                button.moveIndex = i;

                if (i == 1){
                    button.position.x = Graphics.width/4 + (Graphics.width*0.75/2) + this.BUTTON_BUFFER;
                }else if (i == 2){
                    button.position.y = Graphics.height*0.75 + Graphics.height/8 + this.BUTTON_BUFFER;
                }else if (i == 3){
                    button.position.x = Graphics.width/4 + (Graphics.width*0.75/2) + this.BUTTON_BUFFER;
                    button.position.y = Graphics.height*0.75 + Graphics.height/8 + this.BUTTON_BUFFER;
                }

                this.moveButtons.push(button);
                Graphics.uiContainer2.addChild(button);
            }
        },

        sendTurnData: function(){
            console.log("Sending Turn Data!!!!!");
            //show confirm dialogue box
            this.getConfirmTurnWindow();
            //clear any ui buttons
            for (var i = 0; i < this.moveButtons.length;i++){
                Graphics.uiContainer2.removeChild(this.moveButtons[i]);
            }
            this.moveButtons = [];
        },

        executeTurn: function(data){
            this.turn = new Turn();
            this.turn.init(data.turnData);
        },

        getConfirmTurnWindow: function(){

            this.confirmTurnWindow = new PIXI.Container();

            var c = new PIXI.Container();
            var g = new PIXI.Graphics();
            var t = new PIXI.Container();
            var buttonSize = 35;
            var h = 20;
            var w = 20;
            var minheight = 200
            var minwidth = 550;
            var num = 1;
            textArr = [];
            for (var i in this.turnData){
                if (i == 'run'){
                    textArr = ['Run away?']
                    break;
                }
                var pkmn = Party.getPokemon(i);
                var text = this.pokemonContainer[i].nickname + ' ';
                if (this.turnData[i].command == 'fight'){
                    text += ('will use ' + pkmn.moves[this.turnData[i].moveIndex].name + ' on ' + this.pokemonContainer[this.turnData[i].pID].nickname);  
                }else if (this.turnData[i].command == 'swap'){
                    text += ('will swap with ' + Party.pokemon[this.turnData[i].index].nickname);  
                }else if (this.turnData[i].command == 'item'){
                    var item = Player.character.inventory.items[Player.character.inventory.order[this.turnData[i].type][this.turnData[i].oIndex]];
                    if (item.targetType == 'allpkmn' || item.targetType == 'battlepkmn' ){
                        text += ('will forgo its turn so you can use '+ item.name + ' on ' + Party.pokemon[this.turnData[i].pIndex].nickname);  
                    }else if (item.targetType == 'all' || item.targetType == 'battle' ){
                        text += ('will forgo its turn so you can use '+ item.name);
                    }else if (item.targetType == 'battleenemy'){
                        text += ('will forgo its turn so you can use '+ item.name + ' on ' + this.pokemonContainer[this.turnData[i].pID].nickname);
                    }
                }
                textArr.push(text);
                num += 1;
            }
            for (var j = 0; j < textArr.length;j++){
                var newtext = new PIXI.Text(textArr[j],AcornSetup.style2);
                newtext.anchor.x = 0.5;
                newtext.anchor.y = 0;
                newtext.position.y = h;
                if (newtext.width + 40 > w){
                    w = newtext.width + 40;
                }
                h += newtext.height;
                h += 20;
                t.addChild(newtext)
            }
            h += buttonSize;
            if (h < minheight){h = minheight;}
            if (w < minwidth){w = minwidth;}
            for (var i = 0; i < t.children.length;i++){
                t.children[i].position.x = w/2;
            }
            g.lineStyle(1,0xFFFFFF,1);
            g.beginFill(0x999999,1);
            g.drawRoundedRect(0,0,w,h,20);
            g.endFill();
            c.addChild(g);
            c.addChild(t);
            var texture = PIXI.RenderTexture.create(w,h);
            var renderer = new PIXI.CanvasRenderer();
            Graphics.app.renderer.render(c,texture);
            this.confirmTurnWindow.addChild(Graphics.makeUiElement({
                texture: texture,
                anchor: [0.5,0.5],
                position: [Graphics.width/2,Graphics.height/2],
            }));
            this.confirmTurnWindow.addChild(Graphics.makeUiElement({
                texture: Game.getTextButton('CONFIRM',32,{buffer: 10,roundedness: 10}),
                anchor: [1,1],
                position: [Graphics.width/2-5,Graphics.height/2 + h/2-5], 
                interactive: true,buttonMode: true,
                clickFunc: function onClick(e){
                    //CONFIRM turn, clear turn data and send it to server
                    Acorn.Net.socket_.emit('battleUpdate',{command: 'turn',turnData: Battle.turnData});
                    console.log(Battle.turnData);
                    Battle.turnData = {};
                    Game.clearUI();
                    Battle.roundActive = false;
                    Battle.toggleTurnOptions(false);
                    Battle.currentPokemonIndex = 0;
                    Graphics.ui.removeChild(Battle.confirmTurnWindow);
                    Battle.targetSelectText.text = "Waiting...";
                    Battle.waitingForData = true;
                    Battle.toggleTargetSelect(true);
                }
            }));
            this.confirmTurnWindow.addChild(Graphics.makeUiElement({
                texture: Game.getTextButton('CANCEL',32,{buffer: 10,roundedness: 10}),
                anchor: [0,1],
                position: [Graphics.width/2+5,Graphics.height/2 + h/2-5],
                interactive: true,buttonMode: true,
                clickFunc: function onClick(e){
                    //CANCEL turn, clear turn data
                    Battle.turnData = {};
                    Game.clearUI();
                    Battle.currentPokemonIndex = 0;
                    Graphics.ui.removeChild(Battle.confirmTurnWindow);
                }
            }));
            Graphics.ui.addChild(Battle.confirmTurnWindow);
        },

        addChat: function(text){
            var newChat = new PIXI.Text(text,{
                font: '18px Pokemon',
                fill: 'black',
                align: 'left',
                wordWrap: true,
                wordWrapWidth: Graphics.width/4 - 20,
                breakWords: true
            });
            newChat.anchor.x = 0;
            newChat.anchor.y = 1;
            newChat.position.x = 10
            newChat.position.y = Graphics.height - 100;
            Graphics.uiContainer2.addChild(newChat);
            for (var i = 0;i < this.chatLog.length;i++){
                this.chatLog[i].position.y -= (newChat.height+10);
            }
            this.chatLog.push(newChat);
        },
        getButtonTexture: function(text){
            var c = new PIXI.Container();
            var g = new PIXI.Graphics();
            var t = new PIXI.Container();

            var xSize = (Graphics.width*0.75)/2 - (this.BUTTON_BUFFER*2);
            var ySize = (Graphics.height/8) - (this.BUTTON_BUFFER*2);
            g.lineStyle(1,0xFFFFFF,1);
            g.beginFill(0xDCDCDC,1);
            g.drawRoundedRect(0,0,xSize,ySize,20);
            g.endFill();

            var text = new PIXI.Text(text,AcornSetup.style2);
            text.style.fontSize = 64;
            text.anchor.x = 0.5;
            text.anchor.y = 0.5;
            text.position.x = xSize/2;
            text.position.y = ySize/2;
            t.addChild(text);

            c.addChild(g);
            c.addChild(t);

            var texture = PIXI.RenderTexture.create(Graphics.width,Graphics.height);
            var renderer = new PIXI.CanvasRenderer();
            Graphics.app.renderer.render(c,texture);
            return texture;
        },
        getMoveTexture: function(move,pp){
            var c = new PIXI.Container();
            var g = new PIXI.Graphics();
            var t = new PIXI.Container();

            var xSize = (Graphics.width*0.75)/2 - (this.BUTTON_BUFFER*2);
            var ySize = (Graphics.height/8) - (this.BUTTON_BUFFER*2);
            g.lineStyle(1,0xFFFFFF,1);
            g.beginFill(0xDCDCDC,1);
            g.drawRoundedRect(0,0,xSize,ySize,20);
            g.endFill();

            var nameText = new PIXI.Text(move.name,AcornSetup.style2);
            nameText.style.fontSize = 48;
            nameText.anchor.x = 0.5;
            nameText.anchor.y = 0.5;
            nameText.position.x = xSize/2;
            nameText.position.y = ySize/3;
            t.addChild(nameText);

            var typeText = new PIXI.Text(Game.typeList[move.type],AcornSetup.style2);
            typeText.style.fontSize = 24;
            typeText.anchor.x = 0.5;
            typeText.anchor.y = 0.5;
            typeText.position.x = xSize/3;
            typeText.position.y = ySize*0.75;
            t.addChild(typeText);

            var ppText = new PIXI.Text(pp+ ' / ' + move.pp,AcornSetup.style2);
            ppText.style.fontSize = 24;
            ppText.anchor.x = 0.5;
            ppText.anchor.y = 0.5;
            ppText.position.x = xSize*0.66;
            ppText.position.y = ySize*0.75;
            t.addChild(ppText);

            c.addChild(g);
            c.addChild(t);

            var texture = PIXI.RenderTexture.create(Graphics.width,Graphics.height);
            var renderer = new PIXI.CanvasRenderer();
            Graphics.app.renderer.render(c,texture);
            return texture;
        }

    }
    window.Battle = Battle;
})(window);
