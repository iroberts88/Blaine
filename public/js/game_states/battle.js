
(function(window) {
    Battle = {
        BUTTON_BUFFER: 10,

        battleData: null,
        wild: null,
        myTeam: null,
        otherTeam: null,
        chatLog: [],

        wildStart: false,
        trainerStart: false,
        gopkmnStart: false,
        gopkmnTicker: 0,

        //container for sprites and healthbars of each team?
        pokemonContainer: {},

        myActivePokemon: {},
        activePokemonIndex: [],
        currentPokemonIndex: 0,

        pokemonButton: null,
        itemButton: null,
        fightButton: null,
        runButton: null,

        pokemonUI: null,
        itemUI: null,
        fightUI: null,

        turnData: {},

        moveButtons: [],

        init: function() {
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
                    Acorn.Net.socket_.emit('playerUpdate',{command: 'run'});
                }
            });

            //get which team you're on
            for (var i = 0; i < this.battleData.team1.length;i++){
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
                        data.tPos = data.sprite.position.x;
                        data.sprite.position.x = Graphics.width/4 + data.sprite.width/2;
                        data.mDistance = data.tPos - data.sprite.position.x;
                        data.ticker = 0;
                        data.sprite.tint = 0x000000;
                        Graphics.uiContainer2.addChild(data.sprite);
                        this.pokemonContainer[pkmn.id] = data;
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
            for (var i in this.pokemonContainer){
                this.pokemonContainer[i].ticker += dt;
                this.pokemonContainer[i].sprite.position.x = Graphics.width/4 + this.pokemonContainer[i].sprite.width/2 + (this.pokemonContainer[i].mDistance* (this.pokemonContainer[i].ticker/time));
                if (this.pokemonContainer[i].ticker >= 2.0){
                    //next phase!
                    this.addChat("& A wild " + this.battleData['team' + this.otherTeam][0].nickname.toUpperCase() + ' appeared!');
                    this.pokemonContainer[i].sprite.position.x = this.pokemonContainer[i].tPos;
                    this.pokemonContainer[i].sprite.tint = 0xFFFFFF;
                    Graphics.uiContainer2.addChild(this.pokemonContainer[i].nameDisplay);
                    Graphics.uiContainer2.addChild(this.pokemonContainer[i].levelDisplay);
                    Graphics.uiContainer2.addChild(this.pokemonContainer[i].hpBar);
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
                    this.pokemonContainer[this.myActivePokemon[i].id] = data;
                }
                this.gopkmnStart = false;
                this.toggleTurnOptions(true);
            }
        },

        toggleTurnOptions: function(bool){
            if (bool){
                Graphics.uiContainer2.addChild(this.fightButton);
                Graphics.uiContainer2.addChild(this.pokemonButton);
                Graphics.uiContainer2.addChild(this.itemButton);
                Graphics.uiContainer2.addChild(this.runButton);
            }else{
                Graphics.uiContainer2.removeChild(this.fightButton);
                Graphics.uiContainer2.removeChild(this.pokemonButton);
                Graphics.uiContainer2.removeChild(this.itemButton);
                Graphics.uiContainer2.removeChild(this.runButton);
            }
        },

        showFightUI: function(){
            this.toggleTurnOptions(false);
            this.currentPokemonIndex = 0;
            var activePokemon = this.myActivePokemon[this.activePokemonIndex[this.currentPokemonIndex]];
            //display moves
            this.displayMoves(activePokemon);
        },

        showPokemonUI: function(){
            this.toggleTurnOptions(false);
        },

        showItemUI: function(){
            this.toggleTurnOptions(false);
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
                var outLineFilter = new PIXI.filters.GlowFilter(10, 2, 1.5, 0xFF00000, 0.5);
                this.pokemonContainer[pkmn.id].sprite.filters = [outLineFilter];

                var button = Graphics.makeUiElement({
                    texture: this.getMoveTexture(move,pkmn.currentPP[i]),
                    anchor: [0,0],
                    position: [Graphics.width/4 + this.BUTTON_BUFFER,Graphics.height*0.75 + this.BUTTON_BUFFER],
                    interactive: true,buttonMode: true,
                    clickFunc: function onClick(e){
                        //set turn data
                        Battle.turnData[e.currentTarget.pkmnID] = {
                            command: 'fight',
                            moveIndex: e.currentTarget.moveIndex
                        };
                        //check if all active pokemon have Turn data
                        var ready = true;
                        for (var i = 0; i < Battle.activePokemonIndex.length;i++){
                            if (typeof Battle.turnData[Battle.activePokemonIndex[i]] == 'undefined'){
                                ready = false;
                                Battle.currentPokemonIndex = i;
                                Battle.displayMoves(Battle.myActivePokemon[Battle.activePokemonIndex[Battle.currentPokemonIndex]]);
                                break;
                            }
                        }
                        //otherwise send turn data
                        if (ready){
                            Battle.sendTurnData();
                        }
                        Battle.pokemonContainer[e.currentTarget.pkmnID].sprite.filters = [];
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
            //clear any ui buttons
            for (var i = 0; i < this.moveButtons.length;i++){
                Graphics.uiContainer2.removeChild(this.moveButtons[i]);
            }
            this.moveButtons = [];
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
