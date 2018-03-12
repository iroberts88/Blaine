(function(window) {

    AcornSetup = {
        
        baseStyle: {
            font: '64px Sigmar One',
            fill: Graphics.pallette.color1,
            align: 'left',
            stroke: '#000000',
            strokeThickness: 2,
        },

        net: function() {
            Acorn.Net.on('connInfo', function (data) {
                console.log('Connected to server: Info Received');
                Acorn.Net.ready = true;
                window.playerID = data.id;
                checkReady();
            });
            Acorn.Net.on('mapInfo', function(data) {
                console.log(data);

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