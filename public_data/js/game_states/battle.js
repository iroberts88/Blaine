
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
            this.activePokemonIndex = [];
            this.currentPokemonIndex = 0;

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
            for (var i = 0; i < this.battleData.team1.length;i++){
                this.pokemonContainer[this.battleData.team1[i].id] = this.battleData.team1[i];
                for (var j in Party.pokemon){
                    if (this.battleData.team1[i].id == Party.pokemon[j].id){
                        this.myTeam = 1;
                        this.otherTeam = 2;
                        this.myActivePokemon[Party.pokemon[j].id] = Party.pokemon[j];
                        this.activePokemonIndex.push(Party.pokemon[j].id);
                    }
                }
            }
            for (var i = 0; i < this.battleData.team2.length;i++){
                this.pokemonContainer[this.battleData.team2[i].id] = this.battleData.team2[i];
                for (var j in Party.pokemon){
                    if (this.battleData.team2[i].id == Party.pokemon[j].id){
                        this.myTeam = 2;
                        this.otherTeam = 1;
                        this.myActivePokemon[Party.pokemon[j].id] = Party.pokemon[j];
                        this.activePokemonIndex.push(Party.pokemon[j].id);
                    }
                }
            }
            if (this.battleData.wild){
                this.wild = true;
                this.wildStart = true;
            }else{
                this.wild = false;
            }
            switch(this.battleData.type){
                case '1v1':
                    if (this.wild){
                        var pkmn = this.battleData['team' + this.otherTeam][0];
                        var data = this.getPokemonData(pkmn,2,1);
                        data.sprite.pIndex = 0;
                        data.tPos = data.sprite.position.x;
                        data.sprite.position.x = Graphics.width/4 + data.sprite.width/2;
                        data.mDistance = data.tPos - data.sprite.position.x;
                        data.ticker = 0;
                        data.sprite.tint = 0x000000;
                        Graphics.uiContainer2.addChild(data.sprite);
                        this.pokemonSpriteContainer[pkmn.id] = data;
                    }
                    break;
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
        },

        getPokemonData: function(pkmn,sSlot,iSlot){
            //sSlot is the SPRITE position slot, from 1-8
            //iSlot is POKEMON INFO position slot, from 1-8
            /*_____________________________________________
            |   i1  i2                      s1      s2    |
            |   i3  i4                      s3      s4    |
            |                                             |
            |                                             |
            |                                             |
            |                                             |
            |                                             |
            |                                             |
            |  s5   s6                      i5      i6    |
            |  s7   s8                      i7      i8    |
            |_____________________________________________|*/

            var d = {}; 
            if (sSlot<5){
                d.sprite = Graphics.getSprite(pkmn.number);
                d.sprite.scale.x = 4;
                d.sprite.scale.y = 4;
            }else{
                d.sprite = Graphics.getSprite('b' + pkmn.number);
                d.sprite.scale.x = 6;
                d.sprite.scale.y = 6;
            }
            d.sprite.anchor.x = 0.5;
            d.sprite.anchor.y = 0.5;
            d.sprite.buttonMode = true;
            d.sprite.interactive = true;
            d.sprite.pkmninfo = pkmn;
            d.sprite.sSlot = sSlot;
            d.sprite.iSlot = iSlot;
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
            var spritePositions = {
                '1': [Graphics.width/4 + (Graphics.width*0.75 - (Graphics.width*0.75)/3),(Graphics.height*0.75)/6],
                '2': [Graphics.width/4 + (Graphics.width*0.75 - (Graphics.width*0.75)/8),(Graphics.height*0.75)/6],
                '3': [Graphics.width/4 + (Graphics.width*0.75 - (Graphics.width*0.75)/3),(Graphics.height*0.75)/2],
                '4': [Graphics.width/4 + (Graphics.width*0.75 - (Graphics.width*0.75)/8),(Graphics.height*0.75)/2],
                '5': [Graphics.width/4 + ((Graphics.width*0.75)/8),(Graphics.height*0.75)*0.6],
                '6': [Graphics.width/4 + ((Graphics.width*0.75)/3),(Graphics.height*0.75)*0.6],
                '7': [Graphics.width/4 + ((Graphics.width*0.75)/8),(Graphics.height*0.75)*0.9],
                '8': [Graphics.width/4 + ((Graphics.width*0.75)/3),(Graphics.height*0.75)*0.9],
            };
            d.sprite.position.x = spritePositions[sSlot][0];
            d.sprite.position.y = spritePositions[sSlot][1];
            var infoPositions = {
                '1': [Graphics.width/4 + 10,10],
                '2': [Graphics.width/4 + 20 + (Graphics.width*0.75/4),10],
                '3': [Graphics.width/4 + 10,(Graphics.height*0.75)*(0.1)],
                '4': [Graphics.width/4 + 20 + (Graphics.width*0.75/4),(Graphics.height*0.75)*(0.1)],
                '5': [Graphics.width/4 + Graphics.width*0.75/2 - 20,(Graphics.height*0.75)*0.8],
                '6': [Graphics.width/4 + (Graphics.width*0.75)*0.75 - 10,(Graphics.height*0.75)*0.8],
                '7': [Graphics.width/4 + Graphics.width*0.75/2 - 20,(Graphics.height*0.75)*0.9],
                '8': [Graphics.width/4 + (Graphics.width*0.75)*0.75 - 10,(Graphics.height*0.75)*(0.9)],
            };
            d.nameDisplay = new PIXI.Text(pkmn.nickname,AcornSetup.style2);
            d.nameDisplay.position.x = infoPositions[iSlot][0];
            d.nameDisplay.position.y = infoPositions[iSlot][1];
            d.levelDisplay = new PIXI.Text('L: ' + pkmn.level,AcornSetup.style2);
            d.levelDisplay.anchor.x = 1;
            d.levelDisplay.position.x = infoPositions[iSlot][0] + ((Graphics.width*0.75)/4)-50;
            d.levelDisplay.position.y = infoPositions[iSlot][1];
            d.hpBar = new PIXI.Graphics();
            d.hpBar.position.x = infoPositions[iSlot][0];
            d.hpBar.position.y = infoPositions[iSlot][1] + d.nameDisplay.height + 5;
            if (typeof pkmn.hpPercent != 'undefined'){
                this.drawHPBar(d.hpBar,pkmn.hpPercent);
            }else{
                this.drawHPBar(d.hpBar,pkmn.currentHP/pkmn.hp);
            }
            return d;
        },
        drawHPBar: function(gfx,percent){
            gfx.clear();
            var xSize = ((Graphics.width*0.75)/4) - 50;
            var ySize = 20;
            if (percent != 1){
                gfx.lineStyle(2,0x707070,1);
                gfx.beginFill(0x707070,1);
                var size = xSize * percent;
                gfx.drawRoundedRect(0,0,size,20,10);
                gfx.drawRect(10,0,size-10,20);
                gfx.endFill();

                gfx.lineStyle(2,0x000000,1);
                gfx.beginFill(0x707070,0);
                gfx.drawRoundedRect(0,0,xSize,20,10);
                gfx.endFill();
            }else{
                gfx.lineStyle(2,0x000000,1);
                gfx.beginFill(0x707070,1);
                gfx.drawRoundedRect(0,0,xSize,20,10);
                gfx.endFill();
            }
        },
        updateWildStart: function(dt){
            var time = 2.0;
            var stop = false;
            for (var i in this.pokemonSpriteContainer){
                this.pokemonSpriteContainer[i].ticker += dt;
                this.pokemonSpriteContainer[i].sprite.position.x = Graphics.width/4 + this.pokemonSpriteContainer[i].sprite.width/2 + (this.pokemonSpriteContainer[i].mDistance* (this.pokemonSpriteContainer[i].ticker/time));
                if (this.pokemonSpriteContainer[i].ticker >= 2.0){
                    //next phase!
                    this.addChat("& A wild " + this.battleData['team' + this.otherTeam][0].nickname.toUpperCase() + ' appeared!');
                    this.pokemonSpriteContainer[i].sprite.position.x = this.pokemonSpriteContainer[i].tPos;
                    this.pokemonSpriteContainer[i].sprite.tint = 0xFFFFFF;
                    Graphics.uiContainer2.addChild(this.pokemonSpriteContainer[i].nameDisplay);
                    Graphics.uiContainer2.addChild(this.pokemonSpriteContainer[i].levelDisplay);
                    Graphics.uiContainer2.addChild(this.pokemonSpriteContainer[i].hpBar);
                    stop = true;
                }
            }
            if (stop){
                this.wildStart = false;
                this.gopkmnStart = true;
                this.gopkmnTicker = 0;
            }
        },

        updateGopkmnStart: function(dt){
            var time = 1.5;
            this.gopkmnTicker += dt;
            if (this.gopkmnTicker >= time && this.gopkmnTicker < time*2){
                this.addChat("& Go, " + this.battleData['team' + this.myTeam][0].nickname + '!');
                this.gopkmnTicker = time*2;
            }
            if (this.gopkmnTicker >= time*3){
                //add your pkmn
                for (var i in this.myActivePokemon){
                    var pkmn = this.myActivePokemon[i];
                    var data = this.getPokemonData(pkmn,7,8); //todo for diff modes these numbers should be stored on the pokemon?
                    Graphics.uiContainer2.addChild(data.sprite);
                    Graphics.uiContainer2.addChild(data.hpBar);
                    Graphics.uiContainer2.addChild(data.nameDisplay);
                    Graphics.uiContainer2.addChild(data.levelDisplay);
                    this.pokemonSpriteContainer[this.myActivePokemon[i].id] = data;
                }
                this.gopkmnStart = false;
                Acorn.Net.socket_.emit('battleUpdate',{command: 'roundReady'});
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
