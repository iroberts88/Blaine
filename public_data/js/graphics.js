(function(window) {

    Graphics = {
        app: null,
        width: null,
        height: null,
        loader: null,
        resources: null,
        resourcesReady: null,
        resourceList: null,

        elements: [],
        pallette: {
            color1:'#D2D2D2', // Font color
            color2:'#484848', // BG color 
            color3: 0x79A1F2, //outline color
            color4: '#BDBDBD', //button glow color
            color5: '#D2D2D2', //button clicked color
            color6: "#505050",
            color7: 0x232C2D
        },

        blankTexture: null,

        init: function(w,h) {
            PIXI.settings.SCALE_MODE = 1;
            this.width = w;
            this.height = h;
            this.diameter = Math.sqrt(w*w+h*h);

            this.buttonCD = 0;
            //create the PIXI stage
            this.app = new PIXI.Application(this.width, this.height, {backgroundColor: 0xD2D2D2});
            this.app.renderer.plugins.interaction.moveWhenInside = true;
            this.filtersToApply = [];

            this.resourceList = [];

            this.ratio = this.width/this.height;
            this.baseWidth = this.width;
            this.baseHeight = this.height;
            this.actualRatio = [1,1]; //for screen scaling

            this.world = new PIXI.Container();
            this.world.interactive = true;
            this.world.position.x = 0;
            this.world.position.y = 0;
            this.ui = new PIXI.Container();
            this.bgContainer = new PIXI.Graphics();
            this.bgContainer.position.x = 0;
            this.bgContainer.position.y = 0;
            this.drawBG();
            this.app.stage.addChild(this.bgContainer);
            this.app.stage.addChild(this.world);
            this.app.stage.addChild(this.ui);

            // Show loading message while waiting
            this.showLoadingMessage(true);

            this.worldContainer = new PIXI.Container();
            this.worldContainer.position.x = Graphics.width/2;
            this.worldContainer.position.y = Graphics.width/2;
            this.worldContainer.interactive = true;
            this.world.addChild(this.worldContainer); // ADD WORLD CONTAINER

            this.charContainer1 = new PIXI.Container();
            this.charContainer1.position.x = Graphics.width/2;
            this.charContainer1.position.y = Graphics.width/2;
            this.charContainer1.interactive = true;
            this.world.addChild(this.charContainer1); // ADD WORLD CONTAINER2

            this.worldContainer2 = new PIXI.Container();
            this.worldContainer2.position.x = Graphics.width/2;
            this.worldContainer2.position.y = Graphics.width/2;
            this.worldContainer2.interactive = true;
            this.world.addChild(this.worldContainer2); // ADD WORLD CONTAINER2

            this.charContainer2 = new PIXI.Container();
            this.charContainer2.position.x = Graphics.width/2;
            this.charContainer2.position.y = Graphics.width/2;
            this.charContainer2.interactive = true;
            this.world.addChild(this.charContainer2); // ADD WORLD CONTAINER2

            this.worldPrimitives = new PIXI.Graphics();
            this.worldPrimitives.position.x = Graphics.width/2;
            this.worldPrimitives.position.y = Graphics.width/2;
            this.world.addChild(this.worldPrimitives); //ADD WORLD PRIMS (Cleared on update);
            this.uiPrimitives = new PIXI.Graphics();
            this.ui.addChild(this.uiPrimitives); // ADD UI PRIMS
            this.uiContainer = new PIXI.Container();
            this.uiContainer.position.x = 0;
            this.uiContainer.position.y = 0;
            this.ui.addChild(this.uiContainer); //ADD UI CONTAINER
            this.uiPrimitives1 = new PIXI.Graphics();
            this.ui.addChild(this.uiPrimitives1)
            this.uiContainer2 = new PIXI.Container();
            this.uiContainer2.position.x = 0;
            this.uiContainer2.position.y = 0;
            this.ui.addChild(this.uiContainer2); //ADD UI CONTAINER
            this.uiPrimitives2 = new PIXI.Graphics();
            this.ui.addChild(this.uiPrimitives2); // ADD UI PRIMS
            this.consoleContainer = new PIXI.Container();
            this.consoleContainer.position.x = 0;
            this.consoleContainer.position.y = 0;
            this.ui.addChild(this.consoleContainer); //ADD CONSOLE CONTAINER

            this.resources = {};
            this.resourcesReady = false;
            this.animationSpeeds = {};

            //make blank texture;
            this.blankTexture = PIXI.RenderTexture.create(8,8);
            var g = new PIXI.Graphics();
            Graphics.app.renderer.render(g,this.blankTexture);

        },

        drawBG: function(color1,color2){
            this.bgContainer.removeChildren();
            if (typeof color1 == 'undefined'){
                color1 = 'white';
            }
            if (typeof color2 == 'undefined'){
                color2 = 'white';
            }
            var canvas = document.createElement('canvas');
            canvas.width  = this.width;
            canvas.height = this.height;
            var ctx = canvas.getContext('2d');
            var gradient = ctx.createLinearGradient(0, 0, 0, this.height*0.75);
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);
            ctx.fillStyle = gradient;
            ctx.fillRect(0,0,this.width,this.height);
            var sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));
            
            this.bgContainer.addChild(sprite);
        },
        clear: function(){
            this.bgContainer.clear();
            this.bgContainer.alpha = 1.0;
            this.bgContainer.position.x = 0;
            this.bgContainer.position.y = 0;
            this.worldContainer.removeChildren();
            this.worldContainer.position.x = 0;
            this.worldContainer.position.y = 0;
            this.worldContainer2.removeChildren();
            this.worldContainer2.position.x = 0;
            this.worldContainer2.position.y = 0;
            this.charContainer1.removeChildren();
            this.charContainer1.position.x = 0;
            this.charContainer1.position.y = 0;
            this.charContainer2.removeChildren();
            this.charContainer2.position.x = 0;
            this.charContainer2.position.y = 0;
            this.worldPrimitives.clear();
            this.worldPrimitives.position.x = 0;
            this.worldPrimitives.position.y = 0;
            this.uiContainer.removeChildren();
            this.uiContainer.position.x = 0;
            this.uiContainer.position.y = 0;
            this.uiContainer2.removeChildren();
            this.uiContainer2.position.x = 0;
            this.uiContainer2.position.y = 0;
            this.uiPrimitives.clear();
            this.uiPrimitives.position.x = 0;
            this.uiPrimitives.position.y = 0;
            this.uiPrimitives1.clear();
            this.uiPrimitives1.position.x = 0;
            this.uiPrimitives1.position.y = 0;
            this.uiPrimitives2.clear();
            this.uiPrimitives2.position.x = 0;
            this.uiPrimitives2.position.y = 0;
            this.consoleContainer.removeChildren();
            this.drawBG();
        },

        resize: function(offset){
            if (typeof offset == 'undefined'){
                offset = 0;
            }
            var w;
            var h;
            if (Settings.scaleToFit){
                h = window.innerHeight - offset;
                w = window.innerWidth - offset;
            }else{
                if (window.innerWidth/window.innerHeight > this.width/this.height){
                    h = window.innerHeight - offset;
                    w = window.innerHeight * (this.width/this.height) - offset;
                }else{
                    w = window.innerWidth - offset;
                    h = window.innerWidth * (this.height/this.width) - offset;
                }
            }
            this.app.renderer.view.style.width = w + 'px';
            this.app.renderer.view.style.height = h + 'px';
            var previous = [this.actualRatio[0],this.actualRatio[1]];
            this.actualRatio = [w/this.baseWidth,h/this.baseHeight];
            var change = [this.actualRatio[0] - previous[0],this.actualRatio[1] - previous[1]];
            for (var e = 0; e < this.elements.length;e++){
                try{
                    var element = document.getElementById(this.elements[e]);
                    element.style.transform = ' translate(-50%,-50%)';
                }catch(e){
                    console.log("error resizing html elements");
                    console.log(e);
                }
            }
        },
        startLoad: function(){
            Graphics.app.loader
                .add('img/sprite.json')
                .add('img/sprite2.json')
                .load(Graphics.loadResources);
            
        },
        showLoadingMessage: function(display, message) {
            try{
                if(display) {
                    this.loadingMessage = new PIXI.Text((message ? message : 'Loading...' ), {font: '35px Arial', fill: 'white', align: 'left'});
                    this.loadingMessage.position.x = (this.width / 2) - 100;
                    this.loadingMessage.position.y = (this.height / 2);
                    this.app.stage.addChild(this.loadingMessage);
                } else {
                    this.app.stage.removeChild(this.loadingMessage)
                    this.loadingMessage = null;
                }
                this.app.renderer.render(this.app.stage);
            }catch(e){}
        },

        loadResources: function() {
            console.log("loading resources....");

            //Load all movie clips
            var animations = [
                'water', 6,
                'deep_water', 6,
                'br_flower_', 4,
                'tl_flower_', 4
            ];
            Graphics.animationSpeeds = {
                'water': .05,
                'deep_water': .05,
                'br_flower_': .05,
                'tl_flower_': .05
            };

            //add all movie clips to resources
            for (var j = 0; j < animations.length; j += 2){
                Graphics.resourceList.push(animations[j]);
                var animTextures = [];
                for (var i=0; i < animations[j+1]; i++){
                    var texture = PIXI.Texture.fromFrame(animations[j] + (i+1) + ".png");
                    animTextures.push(texture);
                };
                Graphics.resources[animations[j]] = animTextures;

            }

            var r = Graphics.app._loader.resources['img/sprite2.json']

            for (var i in r.textures){

                var texture = PIXI.Texture.fromFrame(i);
                var name = i.slice(0,i.length-4);
                if (typeof Graphics.animationSpeeds[name] == 'undefined'){
                    Graphics.resources[name] = texture;
                }
            }

            var r = Graphics.app._loader.resources['img/sprite.json']

            for (var i in r.textures){
                var texture = PIXI.Texture.fromFrame(i);
                var name = i.slice(0,i.length-4);
                if (typeof Graphics.animationSpeeds[name] == 'undefined'){
                    Graphics.resources[name] = texture;
                }
            }

            //add all textures to resources
            /*for(var i = 0; i < 38; i++) {
                for (var j = 0; j < 41;j++){
                    try{
                        var texture = PIXI.Texture.fromFrame(i + 'x' + j + ".png");
                        Graphics.resources[i + 'x' + j] = texture;
                    }catch(e){
                        
                    }
                }
            }
            for(var i = 1; i < 152; i++) {
                try{
                    var texture = PIXI.Texture.fromFrame(i + ".png");
                    Graphics.resources[i] = texture;
                    var texture2 = PIXI.Texture.fromFrame('b' + i + ".png");
                    Graphics.resources['b' + i] = texture2;
                }catch(e){
                    
                }
            }*/
            
            Graphics.onReady();
        },
        getResource: function(id){
            //returns a PIXI extras.MovieClip or a PIXI Texture from the Graphics.resources array

            //TODO (REMOVE) for debugging item ID's, log item id errors
            if (typeof Graphics.resources[id] === 'undefined'){
                console.log(id);
                console.log('-- Graphics resource not found' )
                return Graphics.resources['ow_ash_d1'];
            }else{
                return Graphics.resources[id];
            }
        },
        onReady: function(callback) {
            Graphics.onReady = callback;
        },
        getSprite: function(id){
            try{
                var t = this.getResource(id);
                if (t.constructor === Array){
                    var s = new PIXI.extras.MovieClip(t);
                    s.animationSpeed = Graphics.animationSpeeds[id];
                    s.gotoAndPlay(1);
                }else{
                    var s = new PIXI.Sprite(t);
                }
                return s;
            }catch(e){
                console.log(e);
                console.log('-- Graphics resource not found' )
            }
        },
        drawBoxAround: function(sprite,g,options){
            //draws a box around sprite in
            //g = graphics container
            if (typeof options.ybuffer == 'undefined'){
                options.ybuffer = 0;
            }
            if (typeof options.xbuffer == 'undefined'){
                options.xbuffer = 0;
            }
            if (typeof options.color == 'undefined'){
                options.color = Graphics.pallette.color3;
            }
            if (typeof options.size == 'undefined'){
                options.size = 2;
            }
            var pos = {x: sprite.position.x,y: sprite.position.y};
            if (typeof options.pos != 'undefined'){
                pos = {
                    x: options.pos[0],
                    y: options.pos[1]
                }
            }
            g.lineStyle(options.size,options.color,1);
            g.moveTo(pos.x - sprite.width/2 + options.xbuffer,pos.y - sprite.height/2 + options.ybuffer);
            g.lineTo(pos.x + sprite.width/2 - options.xbuffer,pos.y - sprite.height/2 + options.ybuffer);
            g.lineTo(pos.x + sprite.width/2 - options.xbuffer,pos.y + sprite.height/2 - options.ybuffer);
            g.lineTo(pos.x - sprite.width/2 + options.xbuffer,pos.y + sprite.height/2 - options.ybuffer);
            g.lineTo(pos.x - sprite.width/2 + options.xbuffer,pos.y - sprite.height/2 + options.ybuffer);
        },
        makeUiElement: function(data){
            // OPTIONAL data.text - the text on the button
            if (typeof data.text == 'undefined'){
                data.text = ' ';
            }
            // OPTIONAL data.style style property for PIXI Text
            if (typeof data.style == 'undefined'){
                data.style  = {
                    font: '48px Orbitron', 
                    fill: Graphics.pallette.color1, 
                    align: 'left',
                    dropShadow: true,
                    dropShadowColor: '#000000',
                    stroke: '#000000',
                    strokeThickness: 5,
                    dropShadow: true,
                    dropShadowColor: '#000000',
                    dropShadowBlur: 4,
                    dropShadowAngle: Math.PI / 6,
                    dropShadowDistance: 6
                }
            }
            // OPTIONAL data.position
            if (typeof data.position == 'undefined'){
                data.position = [0,0];
            }
            // OPTIONAL data.anchor
            if (typeof data.anchor == 'undefined'){
                data.anchor = [0.5,0.5];
            }
            // OPTIONAL data.padding
            if (typeof data.padding == 'undefined'){
                data.padding = [0,0];
            }
            if (typeof data.sprite != 'undefined'){
                var button = Graphics.getSprite(data.sprite);
                button.position.x = data.position[0];
                button.position.y = data.position[1];
                button.anchor.x = data.anchor[0];
                button.anchor.y = data.anchor[1];
            }else if (typeof data.texture != 'undefined'){
                var button = new PIXI.Sprite(data.texture);
                button.position.x = data.position[0];
                button.position.y = data.position[1];
                button.anchor.x = data.anchor[0];
                button.anchor.y = data.anchor[1];
            }else{
                var button = new PIXI.Text(data.text,data.style)
                button.position.x = data.position[0];
                button.position.y = data.position[1];
                button.anchor.x = data.anchor[0];
                button.anchor.y = data.anchor[1];
            }

            // OPTIONAL data.interactive
            if (typeof data.interactive != 'undefined'){
                button.interactive = data.interactive;
            }
            
            // OPTIONAL click/mouse over-down-out functions
            if (typeof data.clickFunc != 'undefined'){
                button.clickFunc = data.clickFunc;
            }
            if (typeof data.mOverFunc != 'undefined'){
                button.mOverFunc = data.mOverFunc;
            }
            if (typeof data.mDownFunc != 'undefined'){
                button.mDownFunc = data.mDownFunc;
            }
            if (typeof data.mOutFunc != 'undefined'){
                button.mOutFunc = data.mOutFunc;
            }
            // OPTIONAL data.buttonMode (glow)
            if (typeof data.buttonMode != 'undefined'){
                button.buttonMode = data.buttonMode;
            }
            if (typeof data.buttonGlow != 'undefined'){
                var onClick = function(e){
                    try{
                        e.currentTarget.clickFunc(e);
                    }catch(e){
                        console.log(e);
                    }
                    Graphics.removeGlow(e.currentTarget);
                }
                button.on('tap', onClick);
                button.on('click', onClick);
                var mOverFunc = function(e){
                    try{
                        e.currentTarget.mOverFunc(e);
                    }catch(e){
                        //console.log(e);
                    }
                    Graphics.buttonGlow(e.currentTarget);
                }
                button.on('pointerover', mOverFunc);
                button.on('touchmove', mOverFunc);
                var mDownFunc = function(e){
                    try{
                        e.currentTarget.mDownFunc(e);
                    }catch(e){}
                    Graphics.changeGlow(e.currentTarget);
                }
                button.on('pointerdown', mDownFunc);
                button.on('touchstart', mDownFunc);
                var mOutFunc = function(e){
                    try{
                        e.currentTarget.mOutFunc(e);
                    }catch(e){}
                    Graphics.removeGlow(e.currentTarget);
                }
                button.on('touchend', mOutFunc);
                button.on('touchendoutside', mOutFunc);
                button.on('pointerout', mOutFunc);
            }else{
                if (typeof data.clickFunc != 'undefined'){
                    button.on('tap', button.clickFunc);
                    button.on('click', button.clickFunc);
                }
                if (typeof data.mOverFunc != 'undefined'){
                    button.on('pointerover', button.mOverFunc);
                    button.on('touchmove', button.mOverFunc);
                }
                if (typeof data.mDownFunc != 'undefined'){
                    button.on('pointerdown', button.mDownFunc);
                    button.on('touchstart', button.mDownFunc);
                }
                if (typeof data.mOutFunc != 'undefined'){
                    button.on('touchend', button.mOutFunc);
                    button.on('touchendoutside', button.mOutFunc);
                    button.on('pointerout', button.mOutFunc);
                }
            }
            return button
        },
        buttonGlow: function(element){
            try{
                element.defaultFill = element.style.fill;
                element.style.fill = Graphics.pallette.color4;
            }catch(e){
                if(!element.glowSprite){
                    var canvas = document.createElement('canvas');
                    canvas.width  = element.width;
                    canvas.height = element.height;
                    var ctx = canvas.getContext('2d');
                    var gradient = ctx.createLinearGradient(0, 0, element.width, 0);
                    gradient.addColorStop(0, Graphics.pallette.color4);
                    gradient.addColorStop(1, Graphics.pallette.color4);
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0,0,element.width,element.height);
                    element.glowSprite1 = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));
                    element.glowSprite1.position.x = element.position.x;
                    element.glowSprite1.position.y = element.position.y;
                    element.glowSprite1.anchor.x = element.anchor.x;
                    element.glowSprite1.anchor.y = element.anchor.y;
                    var canvas2 = document.createElement('canvas');
                    canvas2.width  = element.width;
                    canvas2.height = element.height;
                    var ctx2 = canvas2.getContext('2d');
                    var gradient2 = ctx2.createLinearGradient(0, 0, element.width, 0);
                    gradient2.addColorStop(0, Graphics.pallette.color5);
                    gradient2.addColorStop(1, Graphics.pallette.color5);
                    ctx2.fillStyle = gradient2;
                    ctx2.fillRect(0,0,element.width,element.height);
                    element.glowSprite2 = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas2));
                    element.glowSprite2.position.x = element.position.x;
                    element.glowSprite2.position.y = element.position.y;
                    element.glowSprite2.anchor.x = element.anchor.x;
                    element.glowSprite2.anchor.y = element.anchor.y;
                }
                element.parent.addChildAt(element.glowSprite1,0);
            }
        },
        removeGlow: function(element){
            try{
                element.style.fill = element.defaultFill;
            }catch(e){
                try{
                    element.parent.removeChild(element.glowSprite1);
                    element.parent.removeChild(element.glowSprite2);
                }catch(e){}
            }
        },
        changeGlow: function(element){
            try{
                element.style.fill = Graphics.pallette.color5;
            }catch(e){
                element.parent.removeChild(element.glowSprite1);
                element.parent.addChildAt(element.glowSprite2,0);
            }
        },
        fitText: function(text,size){
            //resize a text object to the given size
            while(text.width > size){
                var s = parseInt(text.style.fontSize);
                text.style.fontSize = (s-1) + 'px';
            }
            return text;
        },
        setSlideBar: function(bar,func){
            bar.clicked = false;
            bar.percent = 0;
            bar.on('mousedown', function onClick(){
                bar.clicked = true;
            });
            bar.on('mouseup', function onClick(e){
                if (bar.clicked){
                    var position = e.data.getLocalPosition(e.target);
                    var start =  -1 * bar.width/2;
                    var percent = (position.x - start) / bar.width;
                    if (percent < 0){percent = 0;}
                    if (percent > 1){percent = 1;}
                    func(percent);
                }
                bar.clicked = false;
            });
            bar.on('mouseupoutside', function onClick(){
                bar.clicked = false;
            });
            bar.on('touchstart', function onClick(){
                bar.clicked = true;
            });
            bar.on('touchend', function onClick(e){
                if (bar.clicked){
                    var position = e.data.getLocalPosition(e.target);
                    var start =  -1 * bar.width/2;
                    var percent = (position.x - start) / bar.width;
                    if (percent < 0){percent = 0;}
                    if (percent > 1){percent = 1;}
                    func(percent);
                }
                bar.clicked = false;
            });
            bar.on('touchendoutside', function onClick(){
                bar.clicked = false;
            });
            bar.on('mousemove', function onMove(e){
                if (bar.clicked){
                    var position = e.data.global.x - Graphics.width/2;
                    var start =  -1 * bar.width/2;
                    var percent = (position - start) / bar.width;
                    if (percent < 0){percent = 0;}
                    if (percent > 1){percent = 1;}
                    func(percent);
                }
            });
            bar.on('touchmove', function onMove(e){
                if (bar.clicked){
                    var position = e.data.global.x - Graphics.width/2;
                    var start =  -1 * bar.width/2;
                    var percent = (position - start) / bar.width;
                    if (percent < 0){percent = 0;}
                    if (percent > 1){percent = 1;}
                    func(percent);
                }
            });
        },
    }

    window.Graphics = Graphics;
})(window);
