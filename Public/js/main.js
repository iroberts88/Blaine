var mouseX, mouseY;

var now, dt, lastTime;

var requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000/60);
        };
})();


var mainObj = this;
mainObj.playerId = 'none';

mainObj.GAME_SCALE = 4;
mainObj.TILE_SIZE = 16*mainObj.GAME_SCALE;

$(function() {

    //Configure fonts
    WebFontConfig = {
      google: {
        families: ['Lato','Open Sans', 'Permanent Marker','Orbitron']
      },

      active: function() {
        // do something
      }

    };
    (function() {
        var wf = document.createElement('script');
        wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
            '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
        wf.type = 'text/javascript';
        wf.async = 'true';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(wf, s);
      })();

    // initialize Graphics
    document.body.style.margin = "0px 0px 0px 0px";
    Graphics.init(1920, 1080);
    Graphics.onReady(function() {
        Graphics.resourcesReady = true;
        console.log('Graphics ready!');
        setupSocket();
        checkReady();
        document.body.appendChild(Graphics.app.renderer.view);
    });
    Graphics.resize();
    window.onresize = function(event) {
        Graphics.resize();
    };
    Graphics.startLoad();

    // Set up keyboard bindings

    $(document).keypress(function(e) {
        if(e.keyCode === 32) {
            e.preventDefault();
        }
    });
    $(document).keydown(function(e) {
        var key = e.which;

        if (key == 13){
            var tmp = document.createElement("input");
            document.body.appendChild(tmp);
            tmp.focus();
            document.body.removeChild(tmp);
        }

        Acorn.Input.keyDown(key);

        // Prevent system wide stops
        /*if (
                key === 8 || // Backspace
                key === 16// Delete
            ){
            e.preventDefault();
        }*/

        if ((key === 32 || key === 38 || key === 37 || key === 39 || key === 40 || key === 127) ){
            e.preventDefault();
        }
    });

    $(document).keyup(function(e) {
        Acorn.Input.keyUp(e.which)
    });

    window.addEventListener("contextmenu", function(e) {
        e.preventDefault();
        return false;
    });

    // Load Sounds
    Acorn.Sound.init();
    
});

function setupSocket() {
    Acorn.Net.init();
    //set up acorn.Net
    AcornSetup.net();
}

function checkReady() {
    if(Graphics.resourcesReady && Acorn.Net.ready && Acorn.Sound.ready) {
        console.log('Graphics/Net/Sound READY');
        init();
    } else {
        console.log('Waiting on load...');
    }
}

function init() {
    //do some stuff after Graphics and network are initialized
    lastTime = Date.now();
    Settings.init();
    Player.init();
    //Init Touch Events
    Graphics.app.stage.on('touchstart', Acorn.Input.handleTouchEvent).on('touchmove', Acorn.Input.handleTouchEvent);

    Graphics.showLoadingMessage(false);
    console.log('Loading Complete');
    Acorn.changeState('mainmenu');

    Graphics.app.ticker.add(function update(){
        Settings.stats.begin();
        Acorn.states[Acorn.currentState].update(Graphics.app.ticker.elapsedMS/1000); //update the current state
        Acorn.Sound.update(Graphics.app.ticker.elapsedMS/1000)
        Graphics.app.renderer.render(Graphics.app.stage);

        //TODO Put this stuff in the correct state!
        Settings.stats.end();
    })
}

//set up acorn game states
AcornSetup.states();
//set up acorn game states
AcornSetup.input();
