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
        this.overTile = null;
        this.m2Down = false;
        this.actions = [];
        this.currentOnTrigger;
        this.currentDoTrigger;
        this.doTriggerInfo;
        this.data = {};
    }
    preload ()
    {  
        var that = this;
        this.map = new TileMap();
        window.currentGameMap = this.map;
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
            if (obj.onTrigger){
                that.currentOnTrigger = obj.onTrigger;
            }else if (obj.doTrigger){
                that.currentDoTrigger = obj.doTrigger;
                if (obj.doTrigger == 'changeMap'){
                    that.triggerDoInfo.map = prompt('enter map name','');
                    that.triggerDoInfo.tile = prompt('enter tile','');
                }
                if (obj.doTrigger == 'playSound' || obj.doTrigger == 'playMusic'){
                    that.triggerDoInfo.sound = prompt('enter sound name','');
                }
                if (obj.doTrigger == 'jumpToTile'){
                    that.triggerDoInfo.tile = prompt('enter tile','');
                }
                that.triggerSelectorContainer.visible = false;
                that.setMode('applytrigger');
            }
             
        }, that);


        this.map.init(this.data);
        this.uiGFX = this.add.graphics();


        this.tileText = this.add.text(960, 50, '0,0', { fontFamily: mainObj.fonts[0], fontSize: 24, color: mainObj.palette[4][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        this.tileText.setOrigin(0,0.5);

        this.triggerText = this.add.text(1920*3/4, 1080/2, '', { fontFamily: mainObj.fonts[0], fontSize: 16, color: mainObj.palette[4][1] ,wordWrap: true,wordWrapWidth: 300}).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        this.triggerText.setOrigin(0,0.5);

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


        this.exitBtn = this.add.text(1870, 50, 'EXIT', { fontFamily: mainObj.fonts[0], fontSize: 32, color: mainObj.palette[4][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        this.exitBtn.setOrigin(0,0.5);
        this.exitBtn.x -= this.exitBtn.width;
        this.exitBtn.setInteractive({ cursor: 'pointer' });
        this.exitBtn.on('pointerdown', function () {
        }, that);
        this.uiIndex.push(this.exitBtn);
        this.savebtn = this.add.text(1870, 125, 'SAVE', { fontFamily: mainObj.fonts[0], fontSize: 32, color: mainObj.palette[4][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        this.savebtn.setOrigin(0,0.5);
        this.savebtn.x -= this.savebtn.width;
        this.savebtn.setInteractive({ cursor: 'pointer' });
        this.savebtn.on('pointerdown', function () {
        }, that);
        this.uiIndex.push(this.savebtn);


        this.drawUIBoxes();
        this.tsgfx = this.add.graphics();
        this.setupTileSelector();
        this.setupModeSelector();
        this.setupTriggerSelector();


        this.input.on('pointerdown', function(pointer, currentlyOver,what,what2){
            if (pointer.button == 2){
                that.m2Down = true;
            }
        }, that);
        this.input.on('pointerup', function(pointer, currentlyOver,what,what2){
            if (pointer.button == 2){
                that.m2Down = false;
            }
        }, that);
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
        this.tsDrawPos.x = (Math.floor((this.input.x - this.tsgfx.x)/size)*size)-(Math.floor(this.toolSize/2)*size);
        this.tsDrawPos.y = (Math.floor((this.input.y - this.tsgfx.y)/size)*size)-(Math.floor(this.toolSize/2)*size);
        let tileX = Math.round(this.tsDrawPos.x/size);
        let tileY = Math.round(this.tsDrawPos.y/size);
        this.tileText.text = tileX + ',' + tileY;
        this.tsgfx.lineStyle(4,0xFF0000,0.75);
        this.tsgfx.strokeRect(this.tsDrawPos.x,this.tsDrawPos.y,size*this.toolSize,size*this.toolSize);


        this.overTile = this.map.getTileAt(Math.floor((this.input.x - this.tsgfx.x)/size),Math.floor((this.input.y - this.tsgfx.y)/size));
        if (this.overTile){
            if (this.overTile.triggers.length > 0){
                var text = '';
                for (var t = 0; t < this.overTile.triggers.length;t++){
                    var trig = this.overTile.triggers[t];
                    text += 'ON:\n' + trig.on + '\n\n' + 'DO:\n' + trig.do +'\n';
                    for (let i in trig.data){
                        text += i + ' - ' + trig.data[i] + '\n';
                    }
                    text += '\n\n';
                } 
                this.triggerText.text = text;
            }else{
                this.triggerText.text = '';
            }
        }else{
            this.triggerText.text = '';
        }

        if (this.m2Down){
            switch(this.currentMode){
                case 'place':
                    var action = 'place_' + this.currentPlaceTile + '_' + tileX + '_' + tileY + '_' + this.toolSize;
                    if (this.actions[this.actions.length-1] != action){
                        this.actions.push(action);
                        this.place(tileX,tileY);
                    } 
                    break;
                case 'overlay':
                    var action = 'overlay_' + this.currentPlaceTile + '_' + tileX + '_' + tileY + '_' + this.toolSize;
                    if (this.actions[this.actions.length-1] != action){
                        this.actions.push(action);
                        this.overlay(tileX,tileY);
                    } 
                    break;
                case 'clear':
                    var action = 'clear' + this.currentPlaceTile + '_' + tileX + '_' + tileY + '_' + this.toolSize;
                    if (this.actions[this.actions.length-1] != action){
                        this.actions.push(action);
                        this.clear(tileX,tileY);
                    } 
                    break;
                case 'block':
                    var action = 'block' + this.currentPlaceTile + '_' + tileX + '_' + tileY + '_' + this.toolSize;
                    if (this.actions[this.actions.length-1] != action){
                        this.actions.push(action);
                        this.setBlocked(tileX,tileY,0);
                    } 
                    break;
                case 'unblock':
                    var action = 'unblock' + this.currentPlaceTile + '_' + tileX + '_' + tileY + '_' + this.toolSize;
                    if (this.actions[this.actions.length-1] != action){
                        this.actions.push(action);
                        this.setBlocked(tileX,tileY,1);
                    } 
                    break;
                case 'applytrigger':
                    var action = 'applytrigger' + this.currentPlaceTile + '_' + tileX + '_' + tileY + '_' + this.toolSize;
                    if (this.actions[this.actions.length-1] != action){
                        this.actions.push(action);
                        this.addTrigger(tileX,tileY);
                    } 
                    break;
                case 'cleartrigger':
                    var action = 'cleartrigger' + this.currentPlaceTile + '_' + tileX + '_' + tileY + '_' + this.toolSize;
                    if (this.actions[this.actions.length-1] != action){
                        this.actions.push(action);
                        this.clearTriggers(tileX,tileY);
                    } 
                    break;
            }
        }
    }
    addTrigger (tileX,tileY){
        for (let x = 0; x < this.toolSize;x++){
            for (let y = 0; y < this.toolSize;y++){
                this._addTrigger(tileX+x,tileY+y);
            }
        }
    }
    _addTrigger (x,y){
        this.overTile = this.map.getTileAt(x,y);
        if (!this.overTile){
            return
        }else{
            this.overTile.addTrigger({
                on: this.currentOnTrigger,
                do: this.currentDoTrigger,
                data: this.triggerDoInfo
            });
        }
    }
    clearTriggers (tileX,tileY){
        for (let x = 0; x < this.toolSize;x++){
            for (let y = 0; y < this.toolSize;y++){
                this._clearTriggers(tileX+x,tileY+y);
            }
        }
    }
    _clearTriggers (x,y){
        this.overTile = this.map.getTileAt(x,y);
        if (!this.overTile){
            return
        }else{
            this.overTile.clearTriggers();
        }
    }
    place (tileX,tileY){
        for (let x = 0; x < this.toolSize;x++){
            for (let y = 0; y < this.toolSize;y++){
                this._place(tileX+x,tileY+y);
            }
        }
    }
    _place (x,y){
        this.overTile = this.map.getTileAt(x,y);
        if (!this.overTile){
            var newTile = new Tile();
            newTile.init({
                sectorId: 0 + 'x' + 0,
                x: x,
                y: y,
                resource: this.currentPlaceTile,
                open: true,
                triggers: [],
                overlayResource: 0
            });
            newTile.setSprite();
        }else{
            this.overTile.setResource(this.currentPlaceTile);
        }
    }
    overlay (tileX,tileY){
        for (let x = 0; x < this.toolSize;x++){
            for (let y = 0; y < this.toolSize;y++){
                this._overlay(tileX+x,tileY+y);
            }
        }
    }
    _overlay (x,y){
        this.overTile = this.map.getTileAt(x,y);
        if (!this.overTile){
            return
        }else{
            this.overTile.setOverlayResource(this.currentPlaceTile);
        }
    }
    clear (tileX,tileY){
        for (let x = 0; x < this.toolSize;x++){
            for (let y = 0; y < this.toolSize;y++){
                this._clear(tileX+x,tileY+y);
            }
        }
    }
    _clear (x,y){
        this.overTile = this.map.getTileAt(x,y);
        if (!this.overTile){
            return
        }else{
            this.overTile.destroy();
            delete this.map.tileIndex[x][y];
        }
    }
    setBlocked (tileX,tileY,b){
        for (let x = 0; x < this.toolSize;x++){
            for (let y = 0; y < this.toolSize;y++){
                this._setBlocked(tileX+x,tileY+y,b);
            }
        }
    }
    _setBlocked (x,y,b){
        this.overTile = this.map.getTileAt(x,y);
        if (!this.overTile){
            return
        }else{
            this.overTile.setOpen(b)
        }
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
        this.triggerSelectorContainer.visible = false;
        if (this.tileSelectorContainer.visible){
            this.tileSelectorContainer.visible = false;
        }else{
            this.tileSelectorContainer.visible = true;
        }
    }
    toggleModeSelector ()
    {
        this.tileSelectorContainer.visible = false;
        this.triggerSelectorContainer.visible = false;
        if (this.modeSelectorContainer.visible){
            this.modeSelectorContainer.visible = false;
        }else{
            this.modeSelectorContainer.visible = true;
        }
    }
    toggleTriggerSelector ()
    {
        this.tileSelectorContainer.visible = false;
        this.modeSelectorContainer.visible = false;
        if (this.triggerSelectorContainer.visible){
            this.triggerSelectorContainer.visible = false;
        }else{
            this.triggerSelectorContainer.visible = true;
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
        this.currentMode = mode;
        this.currentModeText2.text = mode;
        if (mode == 'block' || mode == 'unblock'){
            if (!this.map.sb){
                this.map.sb = true;
            }
        }else{
            if (this.map.sb){
                this.map.sb = false;
            }
        }
        if (mode == 'applytrigger' || mode == 'cleartrigger' || mode == 'settrigger'){
            if (!this.map.st){
                this.map.st = true;
            }
        }else{
            if (this.map.st){
                this.map.st = false;
            }
        }
        this.map.setTint();
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
        //settrigger
        let stText = this.add.text(50, 100+spacing*5, 'SET TRIGGER', { fontFamily: mainObj.fonts[0], fontSize: 32, color: mainObj.palette[4][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        stText.setOrigin(0,0.5);
        stText.setInteractive({ cursor: 'pointer' });
        stText.sceneToStart = '';
        stText.on('pointerdown', function () {
            that.toggleTriggerSelector();
            that.setMode('settrigger');
        }, that);
        arr.push(stText);
        //applytrigger
        let atText = this.add.text(50, 100+spacing*6, 'APPLY TRIGGER', { fontFamily: mainObj.fonts[0], fontSize: 32, color: mainObj.palette[4][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        atText.setOrigin(0,0.5);
        atText.setInteractive({ cursor: 'pointer' });
        atText.sceneToStart = '';
        atText.on('pointerdown', function () {
            if (!that.currentOnTrigger || !that.currentDoTrigger){
                that.toggleModeSelector();
            }
            that.setMode('applytrigger');
        }, that);
        arr.push(atText);
        //cleartriggers
        let ctText = this.add.text(50, 100+spacing*7, 'CLEAR TRIGGER', { fontFamily: mainObj.fonts[0], fontSize: 32, color: mainObj.palette[4][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        ctText.setOrigin(0,0.5);
        ctText.setInteractive({ cursor: 'pointer' });
        ctText.sceneToStart = '';
        ctText.on('pointerdown', function () {
            that.setMode('cleartrigger');
        }, that);
        arr.push(ctText);

        this.modeSelectorContainer.add(arr);
    }
    doTriggerButton(x,y,trigger){
        var text = this.add.text(x, y, trigger, { fontFamily: mainObj.fonts[0], fontSize: 32, color: mainObj.palette[4][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        text.setOrigin(0,0.5);
        text.setInteractive({ cursor: 'pointer' });
        text.doTrigger = trigger
        return text;
    }
    onTriggerButton(x,y,trigger){
        var text = this.add.text(x, y, trigger, { fontFamily: mainObj.fonts[0], fontSize: 32, color: mainObj.palette[4][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true);
        text.setOrigin(0,0.5);
        text.setInteractive({ cursor: 'pointer' });
        text.onTrigger = trigger;
        return text;
    }
    setupTriggerSelector ()
    {
        let that = this;
        this.triggerSelectorContainer = this.add.container();
        this.triggerSelectorContainer.visible = false;
        let gfx = this.add.graphics();
        let arr = [gfx];
        gfx.fillStyle(0x000000,1);
        gfx.fillRect(0,0,1920,1080);

        var onTriggers = [
            'arrival',
            'up',
            'down',
            'left',
            'right',
            'interact'
        ];

        var doTriggers = [
            'changeMap',
            'blockMovement',
            'downwardHop',
            'leftHop',
            'rightHop',
            'jumpToTile',
            'playSound',
            'playMusic'
        ];
        let spacing = 50;

        arr.push(this.add.text(50, 100, 'ON:', { fontFamily: mainObj.fonts[0], fontSize: 32, color: mainObj.palette[4][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true));
        for (var i = 0; i < onTriggers.length;i++){
            arr.push(this.onTriggerButton(50,300+spacing*i,onTriggers[i]));
        }
        arr.push(this.add.text(960, 100, 'DO:', { fontFamily: mainObj.fonts[0], fontSize: 32, color: mainObj.palette[4][1] }).setShadow(2,2, mainObj.palette[3][1], 2, false, true));
        for (var i = 0; i < doTriggers.length;i++){
            arr.push(this.doTriggerButton(960,300+spacing*i,doTriggers[i]));
        }
        this.triggerSelectorContainer.add(arr);
    }

}