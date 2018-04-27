/*!
 * Acorn
 * A Stupid Simple Game Engine
 * 
 * Author: Eric Grotzke / Ian Roberts
 *
 */

(function(window) {

    // -------------------------------------------
    // Base Game Engine
    //--------------------------------------------

    Acorn = {
        states: {},
        currentState: null,

        addState: function(newState) {
        	console.log('Adding state: ' + newState.stateId);
        	this.states[newState.stateId] = newState;
        },
        
        changeState: function(stateId){
            try{
                this.currentState = stateId;
                Graphics.clear();
                this.states[stateId].init();
                return true;
            }catch(e){
                console.log('failed to change to state ' + stateId);
                console.log(e);
                return false;
            }
        },
        onReady: function(callback) {
            console.log('Loading state:');
        }
    };

    // -------------------------------------------
    // Input Manager
    //--------------------------------------------

    Acorn.Input = {
        // Keyboard Inputs
        Key: {
            UP: 0,
            DOWN: 1,
            LEFT: 2,
            RIGHT: 3,
            INVENTORY: 4,
            CHARSHEET: 5,
            POKEDEX: 6,
            POKEMON: 7,
            INTERACT: 8,
            CANCEL: 9,
            ENTER: 10,
            COMMAND: 11,
            SPACE: 12,
            TALK: 13
        },
        keysPressed: [],
        keyBindings: [],

        // Mouse inputs
        mouse: {
            X: null,
            Y: null,
            prevX: null,
            prevY: null,
        },
        buttons: {},
        mouseUpCallback: null,
        mouseClickCallback: null,
        mouseMoveCallback: null,
        touchEventCallback: null,
        scrollCallback: null,


        init: function() {
            this.bind();

            //Mouse
            window.onmousemove = Acorn.Input.handleMouseMove;
            window.onmousedown = Acorn.Input.handleMouseClick;
            window.onmouseup = Acorn.Input.handleMouseUp;
            window.onwheel = Acorn.Input.handleScroll;
        },
        bind: function() {
            this.keyBindings[87] = Acorn.Input.Key.UP; //W
            this.keyBindings[83] = Acorn.Input.Key.DOWN; //S
            this.keyBindings[65] = Acorn.Input.Key.LEFT; //A
            this.keyBindings[68] = Acorn.Input.Key.RIGHT; //D
            this.keyBindings[73] = Acorn.Input.Key.INVENTORY; //I
            this.keyBindings[67] = Acorn.Input.Key.CHARSHEET; //C
            this.keyBindings[80] = Acorn.Input.Key.POKEDEX; //P
            this.keyBindings[81] = Acorn.Input.Key.POKEMON; //Q
            this.keyBindings[69] = Acorn.Input.Key.INTERACT; //E
            this.keyBindings[27] = Acorn.Input.Key.CANCEL; //ESC
            this.keyBindings[13] = Acorn.Input.Key.ENTER; //RETURN
            this.keyBindings[191] = Acorn.Input.Key.COMMAND; //F SLASH
            this.keyBindings[32] = Acorn.Input.Key.SPACE; //SPACE
            this.keyBindings[84] = Acorn.Input.Key.TALK; //T
        },
        getBinding: function(keyCode) {
            return this.keyBindings[keyCode];
        },
        keyDown: function(keyCode) {
            console.log(keyCode);
            this.keysPressed[this.getBinding(keyCode)] = true;
        },
        keyUp: function(keyCode) {
            this.keysPressed[this.getBinding(keyCode)] = false;
        },
        setValue: function(binding, value) {
            this.keysPressed[binding] = value;
        },
        isPressed: function(binding) {
            return this.keysPressed[binding];
        },

        // Mouse Functions
        handleMouseMove: function(e) {
            Acorn.Input.mouse.prevX = Acorn.Input.mouse.X;
            Acorn.Input.mouse.prevY = Acorn.Input.mouse.Y;
            Acorn.Input.mouse.X = e.layerX;
            Acorn.Input.mouse.Y = e.layerY;
            if(Acorn.Input.mouseMoveCallback && typeof Acorn.Input.mouseMoveCallback === 'function') {
                Acorn.Input.mouseMoveCallback(e);
            }
        },
        handleScroll: function(e) {
            if(Acorn.Input.scrollCallback && typeof Acorn.Input.scrollCallback === 'function') {
                Acorn.Input.scrollCallback(e);
            }
        },
        handleTouchEvent: function(e) {
            if(Acorn.Input.touchEventCallback && typeof Acorn.Input.touchEventCallback === 'function') {
                Acorn.Input.touchEventCallback(e);
            }
        },
        handleMouseClick: function(e){
            Acorn.Input.buttons[e.button] = true;
            if(Acorn.Input.mouseClickCallback && typeof Acorn.Input.mouseClickCallback === 'function') {
                Acorn.Input.mouseClickCallback(e);
            }
        },
        handleMouseUp: function(e){
            Acorn.Input.buttons[e.button] = false;
            if(Acorn.Input.mouseUpCallback && typeof Acorn.Input.mouseUpCallback === 'function') {
                Acorn.Input.mouseUpCallback(e);
            }
        },
        onMouseClick: function(callback){
            this.mouseClickCallback = callback;
        },
        onMouseUp: function(callback){
            this.mouseUpCallback = callback;
        },
        onScroll: function(callback){
            this.scrollCallback = callback;
        },
        onMouseMove: function(callback) {
            this.mouseMoveCallback = callback;
        },
        onTouchEvent: function(callback) {
            this.touchEventCallback = callback;
        }

    };
    
    //--------------------------------------------
    // Sound Manager
    //--------------------------------------------
    
    Acorn.Sound= {
        _sounds: [],
        ready: false,
        required: null, //number of sounds that need to be pre-loaded
        requiredCurrent: null,
        currentMusic: null,
        fadeOver: 2.0,
        fadeTicker: 0,
        next: null,

        init: function() {
            this.required = 0;
            this.requiredCurrent = 0;
            this.fadeOver = 2.2;
            this.fadeTicker = 0;
        },
        getSound: function(id) {
            for(var i = 0; i < this._sounds.length; i++) {
                if(this._sounds[i].id == id) {
                    return this._sounds[i];
                }
            }
            return null;
        },
        addSound: function(sound) {
            // url + id
            var newSound = {};
            newSound.url = sound.url;
            newSound.id = sound.id;
            newSound.volume = sound.volume;
            //Set optional property multi
            //will create an array of sounds to play more than 1 at the same time
            if (typeof sound.multi == 'undefined'){
                newSound.multi = false;
            }else{
                newSound.multi = sound.multi;
            }
            if(newSound.multi) {
                newSound._sound = [];
                newSound._sound.push(new Audio(newSound.url));
            } else {
                newSound._sound = new Audio(newSound.url);
            }
            //set optional property volume
            if (typeof sound.volume == 'undefined'){
                newSound.volumeBase = 1.0;
                newSound.volume = 1.0;
            }else{
                newSound.volume = sound.volume;
                newSound.volumeBase = sound.volume;
            }
            //set optional property type
            if (typeof sound.type == 'undefined'){
                newSound.type = 'sfx';
            }else{
                newSound.type = sound.type;
                if (sound.type == 'music'){
                }
            }
            this._sounds.push(newSound);

        },
        stop: function(id){
            var snd = this.getSound(id);
            if(snd.multi) {
                //TODO
            } else {
                snd._sound.pause();
                snd._sound.currentTime = 0;
            }
        },
        play: function(id) {
            var snd = this.getSound(id);

            if (snd.type == 'music'){
                Acorn.Sound.next = id;
            }else if(snd.multi) {
                var addSound = true;
                for(var j = 0; j < snd._sound.length; j++) {
                    if(snd._sound[j].paused) {
                        snd._sound[j].volume = snd.volume*vMod;
                        snd._sound[j].play();
                        addSound = false;
                        break;
                    }
                }
                if(addSound) {
                    snd._sound.push(new Audio(snd.url));
                    snd._sound[snd._sound.length - 1].volume = snd.volume*vMod;
                    snd._sound[snd._sound.length - 1].play();
                }
            } else {
                if (snd._sound.paused) {
                    snd._sound.volume = snd.volume;
                    snd._sound.play();
                } else {
                    snd._sound.currentTime = 0;
                }
            }
        },
        update: function(dt){
            try{
                if (Acorn.Sound.currentMusic == null){
                    Acorn.Sound.currentMusic = Acorn.Sound.next;
                    Acorn.Sound.fadeTicker = Acorn.Sound.fadeOver;
                }
                if (Acorn.Sound.next != null){
                    Acorn.Sound.fadeTicker += dt;
                    var current = Acorn.Sound.getSound(Acorn.Sound.currentMusic);
                    if (Acorn.Sound.fadeTicker >= Acorn.Sound.fadeOver){
                        //play new music
                        Acorn.Sound.stop(Acorn.Sound.currentMusic);
                        var newMusic = Acorn.Sound.getSound(Acorn.Sound.next);
                        newMusic._sound.currentTime = 0;
                        Acorn.Sound.loopSound(newMusic._sound);
                        newMusic._sound.volume = newMusic.volume;
                        Acorn.Sound.currentMusic = Acorn.Sound.next;
                        Acorn.Sound.next = null;
                        Acorn.Sound.fadeTicker = 0;
                    }
                    var val = current.volume*((Acorn.Sound.fadeOver-Acorn.Sound.fadeTicker)/Acorn.Sound.fadeOver);
                    current._sound.volume = val;
                }
            }catch(e){
                alert(e);
            }
        },
        loopSound: function(sound){
            sound.onended = function(s) {
                //TODO this needs to loop at the corrent time for each song....
                s.currentTarget.play()
            };
            sound.play();
        }

    };

    // -------------------------------------------
    // Network Manager
    //--------------------------------------------
    Acorn.Net = {
        socket_: null,
        ready: false,
        callbacks_: [],

        init: function() {
            // Start network connection
            console.log("Acorn.Net: Trying to set up socket....");
            this.socket_ = io.connect();
            this.socket_.on('serverUpdate', function(data) {
                for (var i = 0; i < data.length;i++){   
                    if(Acorn.Net.callbacks_[data[i].call]) {
                        Acorn.Net.callbacks_[data[i].call](data[i].data);
                    }
                }
            });
        },
        on: function(key, callback) {
            if(callback && typeof callback === 'function') {
                this.callbacks_[key] = callback;
            }
            //console.log(this.callbacks_);
        }
    };

    // -------------------------------------------
    // Initialize 
    //--------------------------------------------
    Acorn.Input.init();

    window.Acorn = Acorn;
})(window);