class MapGen extends Phaser.Scene {

    constructor ()
    {
        super('MapGen');
        this.ZOOM_SETTINGS = [0.2,0.4,0.6,0.8,1,1.2,1.4,1.6,1.8];
        this.currentZoomSetting = 4;

        this.tileSelectorOn = false;
        this.triggerSelectorOn = false;

        this.currentOnTrigger = 'arrival';
        this.currentDoTrigger = 'changeMap';
        this.triggerDoInfo = {};

        this.changesMade = false;

        this.keyW;
        this.keyA;
        this.keyS;
        this.keyD;

        this.mapName = '';
        this.animations = {
            'deep_water': true,
            'water': true,
            'tl_flower_': true,
            'br_flower_': true
        }
        //Modes:
            //place - change tile textures and place new sectors
            //overlay - add/change overlay textures
            //blocked - apply blocked status to tiles
            //settrigger - choose the current trigger
            //applytrigger - apply the current trigger to tiles
            //deleteblocked - remove blocked status from tiles
            //deleteoverlay - remove overlay textures from tiles
            //deletetriggers - remove all triggers from tiles
            //deletesectors - delete sectors

            //addNPC - add an NPC to the map
            //editNPC - edit an NPC's properties
            //deleteNPC - remove the NPC

            //setPKMN - set wild pokemon chances on a tile
            //deletePKMN - delete wild pokemon chances on a tile

        //TODO>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        //NPCS
        //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        this.currentMode = 'place';
        this.currentPlaceTile = '1x1';

        this.linesOn = true;
        this.uiIndex = [];
        this.toolSize = 1;
        this.TOOL_SIZE_MIN = 1;
        this.TOOL_SIZE_MAX = 10;
    }
    preload ()
    {  
        var that = this;
        this.map = new TileMap();
        window.currentGameMap = this.map;
        console.log(this.map);
        this.changesMade = false;

        this.map.defaultTile = '1x1';

        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        this.keyW.onDown = function(){
            that.keyW.isDown = true;
        }
        this.keyA.onDown = function(){
            that.keyA.isDown = true;
        }
        this.keyS.onDown = function(){
            that.keyS.isDown = true;
        }
        this.keyD.onDown = function(){
            that.keyD.isDown = true;
        }
        this.keyW.onUp = function(){
            that.keyW.isDown = false;
        }
        this.keyA.onUp = function(){
            that.keyA.isDown = false;
        }
        this.keyS.onUp = function(){
            that.keyS.isDown = false;
        }
        this.keyD.onUp = function(){
            that.keyD.isDown = false;
        }
        this.keySpace.onDown = function(){
            that.toggleTileSelector();
        }
        this.keyShift.onDown = function(){
            that.toggleModeSelector();
        }
        this.keyLeft.onDown = function(){
            that.setToolSize(that.toolSize-1);
        }
        this.keyRight.onDown = function(){
            that.setToolSize(that.toolSize+1);
        }


        this.input.on('gameobjectdown', function (event,obj) {
            if (!game.scene.isActive('MapGen')){
                return;
            }
            if (obj._resource){
                that.setCurrentPlaceTile(obj._resource);
            }
             
        }, that);

        this.uiGFX = this.add.graphics();

        //create tool buttons
        this.tileSelector = this.add.text(50, 50, 'TILE SELECTOR', { fontFamily: mainObj.fonts[0], fontSize: 32, color: mainObj.palette[4][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        this.tileSelector.setOrigin(0,0.5);
        this.tileSelector.setInteractive({ cursor: 'pointer' });
        this.tileSelector.sceneToStart = '';
        this.tileSelector.on('pointerdown', function () {
            that.toggleTileSelector();
        }, that);
        this.uiIndex.push(this.tileSelector);

        let xp = 475;
        this.currentTileSprite = this.add.sprite(xp,50,'sprites','1x1.png');
        this.currentTileSprite.setOrigin(0,0.5);
        this.currentTileSprite.setScale(2,2);

        //create tool buttons
        this.modeSelector = this.add.text(50, 125, 'MODE SELECTOR', { fontFamily: mainObj.fonts[0], fontSize: 32, color: mainObj.palette[4][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        this.modeSelector.setOrigin(0,0.5);
        this.modeSelector.setInteractive({ cursor: 'pointer' });
        this.modeSelector.sceneToStart = '';
        this.modeSelector.on('pointerdown', function () {
            that.toggleModeSelector();
        }, that);
        this.uiIndex.push(this.modeSelector);


        this.currentModeText2 = this.add.text(xp, 125, 'place', { fontFamily: mainObj.fonts[0], fontSize: 24, color: mainObj.palette[3][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        this.currentModeText2.setOrigin(0,0.5);

        this.toolSizeText = this.add.text(50, 200, 'TOOL SIZE', { fontFamily: mainObj.fonts[0], fontSize: 32, color: mainObj.palette[4][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        this.toolSizeText.setOrigin(0,0.5);
        this.uiIndex.push(this.toolSizeText);


        this.tsLeft = this.add.text(xp, 200, '<', { fontFamily: mainObj.fonts[0], fontSize: 24, color: mainObj.palette[3][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        this.tsLeft.setInteractive({ cursor: 'pointer' });
        this.tsLeft.on('pointerdown', function () {
            that.setToolSize(that.toolSize-1);
        }, that);
        this.tsLeft.setOrigin(0,0.5);
        this.tsText = this.add.text(this.tsLeft.x+this.tsLeft.width + 50, 200, '1', { fontFamily: mainObj.fonts[0], fontSize: 24, color: mainObj.palette[3][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        this.tsText.setOrigin(0.5,0.5);

        this.tsRight = this.add.text(0, 200, '>', { fontFamily: mainObj.fonts[0], fontSize: 24, color: mainObj.palette[3][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        this.tsRight.x = this.tsText.x+50+this.tsRight.width;
        this.tsRight.setInteractive({ cursor: 'pointer' });
        this.tsRight.on('pointerdown', function () {
            that.setToolSize(that.toolSize+1);
        }, that);
        this.tsRight.setOrigin(1,0.5);
        this.tsDrawPos = {
            x: 0,
            y: 0
        }

        /*
        var tt = new PIXI.Text('Current - ', style);
        tt.position.y = this.tileSelector.position.y;
        tt.anchor.y = 0.5;
        tt.position.x = 10 + this.tileSelector.width + 5;
        Graphics.uiContainer.addChild(tt);

        this.currentTileSprite = Graphics.makeUiElement({
            sprite: this.map.defaultTile,
            style: style
        });
        this.currentTileSprite.scale.x = 2;
        this.currentTileSprite.scale.y = 2;
        this.currentTileSprite.position.y = tt.position.y;
        this.currentTileSprite.position.x = tt.position.x + tt.width + this.currentTileSprite.width/2;
        Graphics.uiContainer.addChild(this.currentTileSprite);

        //Tool Selector

        this.modeText = Graphics.makeUiElement({
            text: 'Mode Select - Current: place',
            style: style,
            anchor: [0,1]
        });
        this.modeText.position.x = 5;
        this.modeText.position.y = 150;
        Graphics.uiContainer.addChild(this.modeText);

        this.placeButton = Graphics.makeUiElement({
            text: 'place',
            style: style,
            position: [5, this.modeText.position.y+35],
            anchor: [0,0],
            interactive: true,buttonMode: true,buttonGlow: true,
            clickFunc: function onClick(){
                MapGen.changeMode('place');
            }
        });
        Graphics.uiContainer.addChild(this.placeButton);

        this.overlayButton = Graphics.makeUiElement({
            text: 'overlay',
            style: style,
            position: [5, this.placeButton.position.y + 5 + this.placeButton.height],
            anchor: [0,0],
            interactive: true,buttonMode: true,buttonGlow: true,
            clickFunc: function onClick(){
                MapGen.changeMode('overlay');
            }
        });
        Graphics.uiContainer.addChild(this.overlayButton);

        this.blockedButton = Graphics.makeUiElement({
            text: 'blocked',
            style: style,
            position: [5, this.overlayButton.position.y + 5 + this.overlayButton.height],
            anchor: [0,0],
            interactive: true,buttonMode: true,buttonGlow: true,
            clickFunc: function onClick(){
               MapGen.changeMode('blocked');
            }
        });
        Graphics.uiContainer.addChild(this.blockedButton);

        this.triggersButton = Graphics.makeUiElement({
            text: 'set trigger',
            style: style,
            position: [5, this.blockedButton.position.y + 5 + this.blockedButton.height],
            anchor: [0,0],
            interactive: true,buttonMode: true,buttonGlow: true,
            clickFunc: function onClick(){
                MapGen.changeMode('settrigger');
                MapGen.showTriggerSelector();
            }
        });
        Graphics.uiContainer.addChild(this.triggersButton);

        this.triggers2Button = Graphics.makeUiElement({
            text: 'apply trigger',
            style: style,
            position: [5, this.triggersButton.position.y + 5 + this.triggersButton.height],
            anchor: [0,0],
            interactive: true,buttonMode: true,buttonGlow: true,
            clickFunc: function onClick(){
                MapGen.changeMode('applytrigger');
            }
        });
        Graphics.uiContainer.addChild(this.triggers2Button);

        this.deleteSectorsButton = Graphics.makeUiElement({
            text: 'remove sectors',
            style: style,
            position: [5, this.triggers2Button.position.y + 5 + this.triggers2Button.height],
            anchor: [0,0],
            interactive: true,buttonMode: true,buttonGlow: true,
            clickFunc: function onClick(){
                MapGen.changeMode('deleteSectors');
            }
        });
        Graphics.uiContainer.addChild(this.deleteSectorsButton);

        this.deleteOverlayButton = Graphics.makeUiElement({
            text: 'remove overlay',
            style: style,
            position: [5, this.deleteSectorsButton.position.y + 5 + this.deleteSectorsButton.height],
            anchor: [0,0],
            interactive: true,buttonMode: true,buttonGlow: true,
            clickFunc: function onClick(){
                MapGen.changeMode('deleteoverlay');
            }
        });
        Graphics.uiContainer.addChild(this.deleteOverlayButton);

        this.deleteBlockedButton = Graphics.makeUiElement({
            text: 'remove blocked',
            style: style,
            position: [5, this.deleteOverlayButton.position.y + 5 + this.deleteOverlayButton.height],
            anchor: [0,0],
            interactive: true,buttonMode: true,buttonGlow: true,
            clickFunc: function onClick(){
                MapGen.changeMode('deleteblocked');
            }
        });
        Graphics.uiContainer.addChild(this.deleteBlockedButton);

        this.deleteTriggersButton = Graphics.makeUiElement({
            text: 'remove triggers',
            style: style,
            position: [5, this.deleteBlockedButton.position.y + 5 + this.deleteBlockedButton.height],
            anchor: [0,0],
            interactive: true,buttonMode: true,buttonGlow: true,
            clickFunc: function onClick(){
                MapGen.changeMode('deletetriggers');
            }
        });
        Graphics.uiContainer.addChild(this.deleteTriggersButton);

        //back button
        this.exitButton = Graphics.makeUiElement({
            text: 'Exit',
            style: style,
            interactive: true,buttonMode: true,buttonGlow: true,
            clickFunc: function onClick(){
                if (MapGen.changesMade){
                    if (confirm('Exit and lose unsaved data?') == true) {
                        MapGen.data = null;
                        MapGen.mapName = '';
                        Acorn.changeState('mainmenu');
                    }
                }else{
                    MapGen.data = null;
                    MapGen.mapName = '';
                    Acorn.changeState('mainmenu');
                }
            }
        });
        this.exitButton.position.x = Graphics.width - 25 - this.exitButton.width/2;
        this.exitButton.position.y = 25 + this.exitButton.height/2;
        Graphics.uiContainer.addChild(this.exitButton);

        this.lineButton = Graphics.makeUiElement({
            text: 'Toggle Lines',
            style: style,
            interactive: true,buttonMode: true,buttonGlow: true,
            clickFunc: function onClick(){
                if (MapGen.linesOn){
                    MapGen.linesOn = false;
                    Graphics.worldPrimitives.visible = false;
                }else{
                    MapGen.linesOn = true;
                    Graphics.worldPrimitives.visible = true;
                }
            }
        });
        this.lineButton.position.x = Graphics.width/2;
        this.lineButton.position.y = 25 + this.lineButton.height/2;
        Graphics.uiContainer.addChild(this.lineButton);

         this.zoomText = Graphics.makeUiElement({
            text: 'Zoom (Current: 1)',
            style: style,
        });
        this.zoomText.style.fontSize = 20;
        this.zoomText.position.x = Graphics.width/1.5;
        this.zoomText.position.y = this.zoomText.height/2;
        Graphics.uiContainer.addChild(this.zoomText);

        this.zoomUp = Graphics.makeUiElement({
            text: '+',
            style: style,
            interactive: true,
            buttonMode: true,
            clickFunc: function onClick(){
                Settings.zoom('in');
            }
        });
        this.zoomUp.style.fontSize = 40;
        this.zoomUp.position.x = Graphics.width/1.5 - this.zoomUp.width/2 - 20;
        this.zoomUp.position.y = this.zoomUp.height/2 + this.zoomText.height/2+5;
        Graphics.uiContainer.addChild(this.zoomUp);
        this.zoomDown = Graphics.makeUiElement({
            text: '-',
            style: style,
            interactive: true,
            buttonMode: true,
            clickFunc: function onClick(){
                Settings.zoom('out');
            }
        });
        this.zoomDown.style.fontSize = 40;
        this.zoomDown.position.x = Graphics.width/1.5 + this.zoomDown.width/2 + 20;
        this.zoomDown.position.y = this.zoomDown.height/2 + this.zoomText.height/2+5;
        Graphics.uiContainer.addChild(this.zoomDown);
        

        this.saveButton = Graphics.makeUiElement({
            text: "Save",
            style: style,
            interactive: true,
            buttonMode: true,buttonGlow: true,
            clickFunc: function onClick(){
                var name = prompt("Please enter a name for the map", MapGen.mapName);
                if (!name || name == ''){
                    alert('Map not saved.');
                }else{
                    var mapData = {};
                    for (var i in MapGen.map.sectors){
                        mapData[i] = {tiles: [],x: MapGen.map.sectors[i].x,y: MapGen.map.sectors[i].y};
                        for (var j = 0; j < MapGen.map.sectors[i].tiles.length;j++){
                            var arr = [];
                            for (var k = 0; k < MapGen.map.sectors[i].tiles[j].length;k++){
                                var tile = MapGen.map.sectors[i].tiles[j][k];
                                arr.push(tile.getTileData());
                            }
                            mapData[i].tiles.push(arr);
                        }
                    }
                    MapGen.changesMade = false;
                    MapGen.mapName = name;
                    Acorn.Net.socket_.emit('createMap',{name:name,mapData: mapData});
                }
            }
        });
        this.saveButton.position.x = this.exitButton.position.x - this.exitButton.width/2 - 25- this.saveButton.width/2;
        this.saveButton.position.y = this.exitButton.position.y;
        Graphics.uiContainer.addChild(this.saveButton);

        this.deleteButton = Graphics.makeUiElement({
            text: "Delete",
            style: style,
            interactive: true,
            buttonMode: true,buttonGlow: true,
            clickFunc: function onClick(){
                if (confirm('Delete map "' + MapGen.mapName + '"?') == true) {
                    Acorn.Net.socket_.emit('deleteMap',{name:MapGen.mapName});
                    Acorn.changeState('mainmenu');
                }
            }
        });
        this.deleteButton.position.x = this.saveButton.position.x - this.saveButton.width/2 - 25- this.deleteButton.width/2;
        this.deleteButton.position.y = this.exitButton.position.y;
        this.deleteButton.visible = false;
        Graphics.uiContainer.addChild(this.deleteButton);

        this.triggerInfo = new PIXI.Text('',{
            font: '20px Sigmar One',
            fill: Graphics.pallette.color1,
            align: 'left',
            stroke: '#000000',
            strokeThickness: 2,
            wordWrap: true,
            wordWrapWidth: 500
        });
        this.triggerInfo.anchor.x = 0.5;
        this.triggerInfo.anchor.y = 0;
        this.triggerInfo.position.x = Graphics.width*0.75;
        this.triggerInfo.position.y = 200;
        this.triggerInfo.visible = false;
        this.sectorInfo = new PIXI.Text("Sector: ",style);
        this.tileInfo = new PIXI.Text('',style);
        this.tileInfo.anchor.x = 0.5;
        this.tileInfo.anchor.y = 1;
        this.sectorInfo.anchor.x = 0.5;
        this.sectorInfo.anchor.y = 1;
        this.tileInfo.position.x = Graphics.width - 100;
        this.tileInfo.position.y = Graphics.height - 20;
        this.sectorInfo.visible = false;
        this.tileInfo.visible = false;
        Graphics.uiContainer.addChild(this.triggerInfo);
        Graphics.uiContainer.addChild(this.sectorInfo);
        Graphics.uiContainer.addChild(this.tileInfo);

        Graphics.showLoadingMessage(false);
        */

        this.drawUIBoxes();

        this.map.init(this.data);
        this.tsgfx = this.add.graphics();
        this.setupTileSelector();
        this.setupModeSelector();
    }
    setToolSize (n){
        this.toolSize = Math.max(this.TOOL_SIZE_MIN,Math.min(n,this.TOOL_SIZE_MAX));
        this.tsText.text = this.toolSize;
    }
    update (time,delta)
    {   
        let deltaTime = (delta/1000);
        this.map.moveVector.x = 0;
        this.map.moveVector.y = 0;
        if (this.keyA.isDown){
            this.map.moveVector.x += 1;
        }
        if (this.keyD.isDown){
            this.map.moveVector.x -= 1;
        }
        if (this.keyW.isDown){
            this.map.moveVector.y += 1;
        }
        if (this.keyS.isDown){
            this.map.moveVector.y -= 1;
        }
        this.map.update(deltaTime);
        this.tsgfx.clear();
        this.tsgfx.x = this.map.worldContainer.x;
        this.tsgfx.y = this.map.worldContainer.y;
        let size = this.map.TILE_SIZE;
        this.tsDrawPos.x = this.input.x - this.tsgfx.x;
        this.tsDrawPos.x -= this.tsDrawPos.x%size;
        //this.tsDrawPos.x -= size*Math.floor(this.toolSize/2);
        this.tsDrawPos.y = this.input.y - this.tsgfx.y;
        this.tsDrawPos.y -= this.tsDrawPos.y%size;
        //this.tsDrawPos.y -= size*Math.floor(this.toolSize/2);
        this.tsgfx.lineStyle(4,0xFF0000,0.75);
        this.tsgfx.strokeRect(this.tsDrawPos.x,this.tsDrawPos.y,size*(this.toolSize*2-1),size*(this.toolSize*2-1));
    }

    drawUIBoxes ()
    {
        this.uiGFX.clear();
        this.uiGFX.fillStyle(0x000000,0.5);
        this.uiGFX.lineStyle(2,mainObj.palette[2][0],0.5);
        let b = 12;
        let r = 16;
        let c = null;
        for (var i = 0; i < this.uiIndex.length;i++){
            c = this.uiIndex[i];
            this.uiGFX.fillRoundedRect(c.x-b,c.y-c.height/2-b,c.width+b*2,c.height+b*2,r);
            this.uiGFX.strokeRoundedRect(c.x-b,c.y-c.height/2-b,c.width+b*2,c.height+b*2,r);
        }
        let s = 38;
        this.uiGFX.fillStyle(mainObj.palette[2][0],1);
        this.uiGFX.fillRect(this.currentTileSprite.x-((s-32)/2),this.currentTileSprite.y-s/2,s,s);

    }
    create ()
    {   

    }

    toggleTileSelector ()
    {
        this.modeSelectorContainer.visible = false;
        if (this.tileSelectorContainer.visible){
            this.tileSelectorContainer.visible = false;
        }else{
            this.tileSelectorContainer.visible = true;
        }
    }
    toggleModeSelector ()
    {
        this.tileSelectorContainer.visible = false;
        if (this.modeSelectorContainer.visible){
            this.modeSelectorContainer.visible = false;
        }else{
            this.modeSelectorContainer.visible = true;
        }
    }

    setCurrentPlaceTile (tile)
    {
        this.currentPlaceTile = tile;
        this.tileSelectorContainer.visible = false;
        this.currentTileSprite.stop();
        if (this.animations[tile]){
            this.currentTileSprite.play(tile);
        }else{
            this.currentTileSprite.setTexture('sprites',tile + '.png');
        }
    }
    setupTileSelector ()
    {
        this.tileSelectorContainer = this.add.container();
        this.tileSelectorContainer.visible = false;
        let gfx = this.add.graphics();
        let arr = [gfx];
        gfx.fillStyle(0x000000,1);
        gfx.fillRect(0,0,1920,1080);

        let ypos = 55;
        let xpos = 55;
        for(let i = 0; i < 38; i++) {
            for (let j = 0; j < 41;j++){
                if (!this.cache.game.textures.list['sprites'].frames[i + 'x' + j + '.png']){continue;}
                var s = this.add.sprite(0,0,'sprites',i + 'x' + j + '.png');
                s.scaleX = 1.5;
                s.scaleY = 1.5;
                s.x = xpos + 25 * i;
                s.y = ypos + 25 * j;
                s._resource = i + 'x' + j;
                s.setInteractive({ cursor: 'pointer' });
                arr.push(s);
            }
        }

        ypos = 55;
        xpos = 960;
        let iterator = 0;
        for (var anim in this.animations){
            var s = this.add.sprite(0,0,'sprites','1x1.png').play(anim);
            s.scaleX = 1.5;
            s.scaleY = 1.5;
            s.x = xpos + 25 * iterator;
            s.y = ypos + 25;
            s._resource = anim;
            s.setInteractive({ cursor: 'pointer' });
            arr.push(s);
            iterator += 1;
        }
        this.tileSelectorContainer.add(arr);
    }
    setMode (mode)
    {
        this.tileSelectorContainer.visible = false;
        this.modeSelectorContainer.visible = false;
        this.mode = mode;
        this.currentModeText2.text = mode;
    }
    setupModeSelector ()
    {
        let that = this;
        this.modeSelectorContainer = this.add.container();
        this.modeSelectorContainer.visible = false;
        let gfx = this.add.graphics();
        let arr = [gfx];
        gfx.fillStyle(0x000000,1);
        gfx.fillRect(0,0,1920,1080);
        let spacing = 50;
        let placeText = this.add.text(50, 100, 'PLACE', { fontFamily: mainObj.fonts[0], fontSize: 32, color: mainObj.palette[4][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        placeText.setOrigin(0,0.5);
        placeText.setInteractive({ cursor: 'pointer' });
        placeText.sceneToStart = '';
        placeText.on('pointerdown', function () {
            that.toggleModeSelector();
            that.setMode('place');
        }, that);
        arr.push(placeText);
        //overlay
        let olText = this.add.text(50, 100+spacing, 'OVERLAY', { fontFamily: mainObj.fonts[0], fontSize: 32, color: mainObj.palette[4][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        olText.setOrigin(0,0.5);
        olText.setInteractive({ cursor: 'pointer' });
        olText.sceneToStart = '';
        olText.on('pointerdown', function () {
            that.toggleModeSelector();
            that.setMode('overlay');
        }, that);
        arr.push(olText);
        //clear
        let clText = this.add.text(50, 100+spacing*2, 'CLEAR', { fontFamily: mainObj.fonts[0], fontSize: 32, color: mainObj.palette[4][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        clText.setOrigin(0,0.5);
        clText.setInteractive({ cursor: 'pointer' });
        clText.sceneToStart = '';
        clText.on('pointerdown', function () {
            that.setMode('clear');
        }, that);
        arr.push(clText);
        //setblocked
        let blText = this.add.text(50, 100+spacing*3, 'BLOCKED', { fontFamily: mainObj.fonts[0], fontSize: 32, color: mainObj.palette[4][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        blText.setOrigin(0,0.5);
        blText.setInteractive({ cursor: 'pointer' });
        blText.sceneToStart = '';
        blText.on('pointerdown', function () {
            that.setMode('block');
        }, that);
        arr.push(blText);
        //removeblocked
        let ubText = this.add.text(50, 100+spacing*4, 'UNBLOCK', { fontFamily: mainObj.fonts[0], fontSize: 32, color: mainObj.palette[4][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        ubText.setOrigin(0,0.5);
        ubText.setInteractive({ cursor: 'pointer' });
        ubText.sceneToStart = '';
        ubText.on('pointerdown', function () {
            that.setMode('unblock');
        }, that);
        arr.push(ubText);
        //applytrigger
        let atText = this.add.text(50, 100+spacing*5, 'APPLY TRIGGER', { fontFamily: mainObj.fonts[0], fontSize: 32, color: mainObj.palette[4][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        atText.setOrigin(0,0.5);
        atText.setInteractive({ cursor: 'pointer' });
        atText.sceneToStart = '';
        atText.on('pointerdown', function () {
            that.setMode('trigger');
        }, that);
        arr.push(atText);
        //cleartriggers
        let ctText = this.add.text(50, 100+spacing*6, 'CLEAR TRIGGER', { fontFamily: mainObj.fonts[0], fontSize: 32, color: mainObj.palette[4][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        ctText.setOrigin(0,0.5);
        ctText.setInteractive({ cursor: 'pointer' });
        ctText.sceneToStart = '';
        ctText.on('pointerdown', function () {
            that.setMode('cleartrigger');
        }, that);
        arr.push(ctText);

        this.modeSelectorContainer.add(arr);
    }

}