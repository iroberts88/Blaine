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

        net: function() {
            Acorn.Net.on('connInfo', function (data) {
                console.log('Connected to server: Info Received');
                console.log(data);
                MainMenu.bgMap = data.bgMap;
                console.log('Net ready!')
                Acorn.Net.ready = true;
                window.playerID = data.id;
                checkReady();
            });

            Acorn.Net.on('startGame', function (data) {
                console.log('Game Started!');
                console.log(data);
                Acorn.changeState('ingame')
                Game.map = new GameMap();
                Game.map.init(data.map);
                Player.initCharacter(data.character);
                Game.resetPos();
            });

            Acorn.Net.on('loggedIn', function (data) {
                Player.init(data);
                document.body.removeChild(MainMenu.mainPanel);
                MainMenu.showCharacterSelection(data);
            });

            Acorn.Net.on('logout', function (data) {
                console.log(data);
                Player.userData = null;
                Acorn.changeState('mainmenu');
            });

            
            Acorn.Net.on('debug', function (data) {
                console.log('sever ERROR debug');
                console.log(data);
            });


            Acorn.Net.on('ping', function (data) {
                Settings.stats.pingReturn();
            });

            Acorn.Net.on('setLoginErrorText', function (data) {
                var s = 'Login Error';
                switch(data.text){
                    case 'userexists':
                        s = 'Username is already in use. Please try another!'
                        break;
                    case 'snlength':
                        s = 'Username length must be between 3 and 16 characters';
                        break;
                    case 'plength':
                        s = 'Password length must be at least 6 characters'
                        break;
                    case 'wrongpass':
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