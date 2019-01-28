(function(window) {

    AcornSetup = {
        
        baseStyle: {
            font: '18px Pokemon',
            fill: Graphics.pallette.color1,
            align: 'left'
        },

        style2: {
            font: '18px Pokemon',
            fill: 'black',
            align: 'left'
        },

        style3: {
            font: '32px Pokemon',
            fill: 'black',
            align: 'left'
        },

        nameStyle: {
            font: '18px Pokemon',
            fill: 'orange',
            align: 'left',
            stroke: '#000000',
            strokeThickness: 1,
            fontWeight: 'bold'
        },

        net: function() {
            Acorn.Net.on(CENUMS.CONNINFO, function (data) {
                console.log('Connected to server: Info Received');
                console.log(data);
                mainObj.id = data[CENUMS.ID];
                var xmlhttp = new XMLHttpRequest();
                var map = 'pallet';
                xmlhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        var myObj = JSON.parse(this.responseText);
                        var sectorXStart = -1;
                        var tileXStart = 7
                        var sectorX = -1;
                        var sectorY = -4;
                        var tileX = 7;
                        var tileY = 18;
                        var bgMap = [];
                        for (var i = 0;i < 28;i++){
                            var arr = []
                            if (tileY > 20){
                                tileY = 0;
                                sectorY +=1;
                            }
                            for (var j = 0; j < 49;j++){
                                if (tileX > 20){
                                    tileX = 0;
                                    sectorX +=1;
                                }
                                arr.push({
                                    tex: myObj.mapData[sectorX + 'x' + sectorY].tiles[tileX][tileY].resource,
                                    oTex: myObj.mapData[sectorX + 'x' + sectorY].tiles[tileX][tileY].overlayResource
                                });
                                tileX += 1;
                            }
                            bgMap.push(arr);
                            tileY += 1;
                            tileX = tileXStart;
                            sectorX = sectorXStart;
                        }
                        
                        MainMenu.bgMap = bgMap;
                        console.log('Net ready!')
                        Acorn.Net.ready = true;
                        checkReady();
                    }
                };
                xmlhttp.open("GET",'./maps/' + map + '.json', true);
                xmlhttp.send();
            });

            Acorn.Net.on(CENUMS.STARTGAME, function (data) {
                console.log('Game Started!');
                console.log(data);
                Game.char = data[CENUMS.CHARACTER];
                Acorn.changeState('ingame');
                document.body.removeChild(NewChar.characterNameInput);
                document.body.removeChild(NewChar.okButton);
                var myObj = data[CENUMS.ZONEDATA];
                Game.map = new GameMap();
                Game.map.init(myObj[CENUMS.MAPDATA]);
                Player.initCharacter(data[CENUMS.CHARACTER]);
                Game.resetPos();
                for (var i = 0; i < data[CENUMS.PLAYERS].length;i++){
                    if (data[CENUMS.PLAYERS][i][CENUMS.OWNER] != mainObj.id){
                        PCS.addPC(data[CENUMS.PLAYERS][i]);
                    }
                }
                Game.ready = true;
                Acorn.Sound.play(data[CENUMS.MUSIC]);
            });

            Acorn.Net.on(CENUMS.CHANGEMAP, function (data) {
                console.log('newMap!!');
                console.log(data);
                Game.newMapData = data;
            });

            Acorn.Net.on(CENUMS.MAPDATA, function (data) {
                console.log('received map data');
                console.log(data);
                Game.mapsCache[data[CENUMS.NAME]] = data[CENUMS.ZONEDATA];
            });

            Acorn.Net.on(CENUMS.STARTBATTLE, function (data) {
                console.log(data);
                console.log('received battle data');
                
                Battle.battleData = data;
                Game.setBattleChange(true);
                Game.battleTicker = 0;
                Game.cMusic = Acorn.Sound.currentMusic;
                if (data[CENUMS.WILD]){
                    Acorn.Sound.play('battle1');
                }else{
                    Acorn.Sound.play('battle2');
                }
                Acorn.Sound.fadeTicker = Acorn.Sound.fadeOver;
                Graphics.uiPrimitives2.lineStyle(1,0xDCDCDC,1);
                Graphics.uiPrimitives2.beginFill(0xDCDCDC,1);
                Graphics.uiPrimitives2.drawRect(0,0,Graphics.width,Graphics.height);
                Graphics.uiPrimitives2.endFill();
                Graphics.uiPrimitives2.alpha = 0;
            });

            Acorn.Net.on(CENUMS.CHARGECOUNTER, function (data) {
                Battle.setChargeCounter(data[CENUMS.VALUE]);
            });

            Acorn.Net.on(CENUMS.READY, function (data) {
                Battle.ready = true;
            });

            Acorn.Net.on(CENUMS.EXECUTETURN, function (data) {
                //A battle turn has been processed
                console.log("do turn stuff");
                console.log(data);
                if (Game.battleActive){
                    Battle.executeTurn(data);
                }
            });

            Acorn.Net.on(CENUMS.ROUNDREADY, function (data) {
                //A battle turn has been processed
                console.log(data);
                if (Game.battleActive){
                    Battle.roundActive = true;
                    Battle.waitingForData = false;
                    Battle.toggleTargetSelect(false);
                    Battle.toggleTurnOptions(true);
                }
            });

            Acorn.Net.on(CENUMS.BATTLECHAT, function (data) {
                Battle.addChat(data.text);
            });

            Acorn.Net.on(CENUMS.BATTLEDATA, function (data) {
                if (data.run){
                    Battle.addChat("You got away!");
                    Battle.end = true;
                }
            });

            Acorn.Net.on(CENUMS.LOGGEDIN, function (data) {
                Player.init(data);
                document.body.removeChild(MainMenu.mainPanel);
                MainMenu.showCharacterSelection(data);
            });

            Acorn.Net.on(CENUMS.ADDPOKEMON, function (data) {
                console.log(data);
                var newpoke = new Pokemon();
                newpoke.init(data[CENUMS.POKEMON]);
                Party.setPokemon(data[CENUMS.SLOT],newpoke);
                Game.resetPokemon(data[CENUMS.SLOT]);
            });

            Acorn.Net.on(CENUMS.LOGOUT, function (data) {
                console.log(data);
                Player.userData = null;
                Acorn.changeState('mainmenu');
            });

            Acorn.Net.on(CENUMS.SAY, function (data) {
                //console.log(data);
                if (data[CENUMS.ID] == Player.character.id){
                    Player.setSayBubble(data[CENUMS.TEXT]);
                }else{
                    PCS.pcs[data[CENUMS.ID]].setSayBubble(data[CENUMS.TEXT]);
                }
            });

            

            //Player Character Functions

            Acorn.Net.on(CENUMS.ADDPC, function (data) {
                //console.log(data);
                if (data[CENUMS.OWNER] == mainObj.id){return;}
                PCS.addPC(data);
            });

            Acorn.Net.on(CENUMS.REMOVEPC, function (data) {
                console.log(data);
                if (data[CENUMS.ID] == Player.character.id){return;}
                PCS.removePC(data);
            });

            Acorn.Net.on(CENUMS.MOVEPC, function (data) {
                console.log(data);
                if (data[CENUMS.ID] == Player.character.id){return;}
                try{
                    PCS.pcs[data[CENUMS.ID]].moveQueue.push(data);
                }catch(e){
                }
            });

            Acorn.Net.on(CENUMS.PING, function (data) {
                Settings.stats.pingReturn();
            });

            Acorn.Net.on(CENUMS.SETLOGINERRORTEXT, function (data) {
                var s = 'Login Error';
                switch(data[CENUMS.TEXT]){
                    case CENUMS.PWERRORUSEREXISTS:
                        s = 'Username is already in use. Please try another!'
                        break;
                    case CENUMS.PWERRORSNLENGTH:
                        s = 'Username length must be between 3 and 16 characters';
                        break;
                    case CENUMS.PWERRORPLENGTH:
                        s = 'Password length must be at least 6 characters'
                        break;
                    case CENUMS.PWERRORWRONGPASS:
                        s = 'Incorrect username or password';
                        break;
                }
                MainMenu.setLoginErrorText(s);
            });

        },

        states: function(){
            //Set up all states
            //-----------------------------------------------------------------------------------------------|
            //                              Game States (Acorn.states)                                       |
            //-----------------------------------------------------------------------------------------------|

            Acorn.addState({
                stateId: 'mainmenu',
                init: function(){
                    document.body.style.cursor = 'default';
                    MainMenu.init();
                },
                update: function(dt){
                    MainMenu.update(dt);
                }
            });

            Acorn.addState({
                stateId: 'newchar',
                init: function(){
                    document.body.style.cursor = 'default';
                    NewChar.init();
                },
                update: function(dt){
                    NewChar.update(dt);
                }
            });

            Acorn.addState({
                stateId: 'ingame',
                init: function(){
                    document.body.style.cursor = 'default';
                    Game.init();
                },
                update: function(dt){
                    Game.update(dt);
                }
            });

            Acorn.addState({
                stateId: 'battle',
                init: function(){
                    document.body.style.cursor = 'default';
                    Battle.init();
                },
                update: function(dt){
                    Battle.update(dt);
                }
            });
            
        },

        input: function(){
            Acorn.Input.onMouseClick(function(e) {
                Acorn.Input.mouseDown = true;
            });
            Acorn.Input.onMouseUp(function(e) {
                Acorn.Input.mouseDown = false;
            });

            Acorn.Input.onScroll(function(e) {

            });

            Acorn.Input.onMouseMove(function(e) {

            });

            Acorn.Input.onTouchEvent(function(e) {

            });
        }
        
    }
    window.AcornSetup = AcornSetup;
})(window);