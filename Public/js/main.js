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

$(function() {

    //Configure fonts
    WebFontConfig = {
      google: {
        families: ['Lato','Open Sans', 'Permanent Marker']
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
        /*
        if (Settings.credentialsOn && key == 13){
            if (Settings.credentials.getType() == 'login'){
                Acorn.Net.socket_.emit('loginAttempt',{sn: document.getElementById('usrInput').value,pw:document.getElementById('pwInput').value});
            }else if (Settings.credentials.getType() == 'new'){
                Acorn.Net.socket_.emit('createUser',{sn: document.getElementById('usrInput').value,pw:document.getElementById('pwInput').value});
            }
        }else{
            ChatConsole.keyDown(key);
        }*/

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
    //Music
    Acorn.Sound.addSound({url: 'sounds/music/1_opening.mp3', id: 'opening', volume: 0.7, preload: true,type:'music'});
    Acorn.Sound.addSound({url: 'sounds/music/3_newChar.mp3', id: 'newChar', volume: 0.7, preload: true,type:'music'});
    Acorn.Sound.addSound({url: 'sounds/music/4_pallet.mp3', id: 'pallet', volume: 0.7, preload: true,type:'music'});
    Acorn.Sound.addSound({url: 'sounds/music/5_road_to_veridian.mp3', id: 'roadToVeridian', volume: 0.7, preload: true,type:'music'});
    //sfx
    Acorn.Sound.addSound({url: 'sounds/sfx/select.mp3', id: 'select', volume: 1.0, preload: true});
    Acorn.Sound.addSound({url: 'sounds/sfx/bump.mp3', id: 'bump', volume: 1.0, preload: true});
    Acorn.Sound.addSound({url: 'sounds/sfx/exit.mp3', id: 'exit', volume: 1.0, preload: true});
    Acorn.Sound.addSound({url: 'sounds/sfx/enter.mp3', id: 'enter', volume: 1.0, preload: true});
});

function setupSocket() {
    Acorn.Net.init();
    //set up acorn.Net
    AcornSetup.net();
}

function checkReady() {
    if(Graphics.resourcesReady && Acorn.Net.ready) {
        console.log('Graphics/Net/Sound READY');
        init();
    } else {
        console.log('Waiting on load...');
    }
}

function init() {
    //do some stuff after Graphics and network are initialized
    lastTime = Date.now();

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
