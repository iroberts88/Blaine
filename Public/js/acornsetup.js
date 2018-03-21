(function(window) {

    AcornSetup = {
        
        baseStyle: {
            font: '48px Permanent Marker',
            fill: Graphics.pallette.color1,
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

            Acorn.Net.on('loggedIn', function (data) {
                Player.userData = data;
                Settings.toggleCredentials(false);
                Acorn.changeState('mainMenu');
            });

            Acorn.Net.on('logout', function (data) {
                Player.userData = null;
                Acorn.changeState('loginScreen');
            });

            
            Acorn.Net.on('debug', function (data) {
                console.log('sever ERROR debug');
                console.log(data);
            });


            Acorn.Net.on('ping', function (data) {
                Settings.stats.pingReturn();
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