
(function(window) {
    MapGen = {
        
        ZOOM_SETTINGS: [0.2,0.4,0.6,0.8,1,1.2,1.4,1.6,1.8],
        currentZoomSetting: 4,

        tileSelectorOn: false,
        triggerSelectorOn: false,

        currentOnTrigger: 'arrival',
        currentDoTrigger: 'changeMap',
        triggerDoInfo: {},

        changesMade: false,

        mapName: '',
        data: {},
        //Modes:
            //place
            //overlay
            //blocked
            //directions
            //triggers

        //TODO>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        //delete Sectors
        //overlay
        //blocked
        //directions
        //triggers
        //save map
        //edit map
        //delete map
        //exit
        //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        currentMode: 'place',
        currentPlaceTile: '1x1',

        linesOn: true,


        init: function() {
            this.drawBG();
            //initialize the map
            window.currentMapState = 'mapgen';
            this.map = new TileMap();
            window.currentGameMap = this.map;
            this.changesMade = false;

            //prompt for the default tile
            var gotTile = false;
            var tile;
            while(!gotTile){
                this.data.tile = prompt("Please enter a default tile for this map", '1x1');
                try{
                    var sprite = Graphics.resources[this.data.tile];
                    this.map.defaultTile = this.data.tile;
                    gotTile = true;
                    console.log('Got Default Tile!!!');
                }catch(e){
                    console.log('fail');
                    this.data.tile = '1x1';
                }
            }


            this.map.init(this.data);

            //create tool buttons
            var style = AcornSetup.baseStyle;
            style.fontSize = 24;

            //Select Tile text
            this.tileSelector = Graphics.makeUiElement({
                text: 'Tile Selector',
                style: style,
                interactive: true,
                buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    MapGen.showTileSelector();
                }
            });
            this.tileSelector.position.x = 5 + this.tileSelector.width/2;
            this.tileSelector.position.y = 5 + this.tileSelector.height/2;
            Graphics.uiContainer.addChild(this.tileSelector);

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
                    MapGen.changeMode('deleteOverlay');
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
                                    arr.push({
                                        x: tile.x,
                                        y: tile.y,
                                        resource: tile.resource,
                                        open: tile.open,
                                        overlayResource: tile.overlayResource,
                                        triggers: tile.triggers
                                    })
                                }
                                mapData[i].tiles.push(arr);
                            }
                        }
                        MapGen.changesMade = false;
                        MapGen.mapName = name;
                        Acorn.Net.socket_.emit('createMap',{name: name,mapData: mapData});
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
        },

        changeMode: function(mode){
            this.currentMode = mode;
            if (mode == 'blocked' || mode == 'deleteblocked'){
                for (var k in this.map.sectors){
                    for (var i = 0; i < this.map.sectors[k].tiles.length;i++){
                        for (var j = 0; j < this.map.sectors[k].tiles[i].length;j++){
                            var tile = this.map.sectors[k].tiles[i][j];
                            if (!tile.open){
                                tile.sprite.tint =  0xfcd9d9;
                                if (tile.overlaySprite){
                                    tile.overlaySprite.tint = 0xfcd9d9;
                                }
                            }else{
                                tile.sprite.tint =  0xFFFFFF;
                                if (tile.overlaySprite){
                                    tile.overlaySprite.tint = 0xFFFFFF;
                                }
                            }
                        }
                    }
                }
            }else if (mode == 'applytrigger' || mode == 'deletetriggers'){
                for (var k in this.map.sectors){
                    for (var i = 0; i < this.map.sectors[k].tiles.length;i++){
                        for (var j = 0; j < this.map.sectors[k].tiles[i].length;j++){
                            var tile = this.map.sectors[k].tiles[i][j];
                            if (tile.triggers.length > 0){
                                tile.sprite.tint =  0xc0d5f7;
                                if (tile.overlaySprite){
                                    tile.overlaySprite.tint = 0xc0d5f7;
                                }
                            }else{
                                tile.sprite.tint =  0xFFFFFF;
                                if (tile.overlaySprite){
                                    tile.overlaySprite.tint = 0xFFFFFF;
                                }
                            }
                        }
                    }
                }
            }else{
                for (var k in this.map.sectors){
                    for (var i = 0; i < this.map.sectors[k].tiles.length;i++){
                        for (var j = 0; j < this.map.sectors[k].tiles[i].length;j++){
                            var tile = this.map.sectors[k].tiles[i][j];
                            tile.sprite.tint =  0xFFFFFF;
                            if (tile.overlaySprite){
                                tile.overlaySprite.tint = 0xFFFFFF;
                            }     
                        }
                    }
                }
            }

        },

        clearSelectors: function(){
            Graphics.uiPrimitives1.clear();
            Graphics.uiContainer2.removeChildren();
            MapGen.tileSelectorOn = false;
            MapGen.triggerSelectorOn = false;
            if (this.currentMode == 'settrigger'){
                this.changeMode('applytrigger');
            }
        },

        showTriggerSelector: function(){
            if (this.triggerSelectorOn){return;}
            this.clearSelectors();
            this.currentMode = 'settrigger';
            this.triggerSelectorOn = true;
            Graphics.uiPrimitives1.lineStyle(1,0x000000,0.9);
            Graphics.uiPrimitives1.beginFill(0x000000,0.9)
            Graphics.uiPrimitives1.drawRect(50,50,Graphics.width-100,Graphics.height-100);
            Graphics.uiPrimitives1.endFill()

            var style = AcornSetup.baseStyle;
            style.fontSize = 24;

            var onText = new PIXI.Text("On:",style);
            onText.position.x = 55;
            onText.position.y = 55;
            Graphics.uiContainer2.addChild(onText);

            var onCommands = [
                'arrival',
                'up',
                'down',
                'left',
                'right',
                'interact'
            ];

            var start = [150,150];
            for (var i = 0; i < onCommands.length;i++){
                var onButton = Graphics.makeUiElement({
                    text: onCommands[i],
                    style: style,
                    interactive: true,
                    buttonMode: true,buttonGlow: true,
                    position: [start[0],start[1] + i*30],
                    clickFunc: function onClick(e){
                        MapGen.currentOnTrigger = e.currentTarget.onCommand;
                    }
                })
                onButton.onCommand = onCommands[i];
                Graphics.uiContainer2.addChild(onButton);
            }

            var doText = new PIXI.Text("Do:",style);
            doText.position.x = Graphics.width/2 + 5;
            doText.position.y = 55;
            Graphics.uiContainer2.addChild(doText);

            var doCommands = [
                'changeMap',
                'blockMovement',
                'downwardHop',
                'jumpToTile'
            ];

            var start = [Graphics.width/2 + 150,150];
            for (var i = 0; i < doCommands.length;i++){
                var doButton = Graphics.makeUiElement({
                    text: doCommands[i],
                    style: style,
                    interactive: true,
                    buttonMode: true,buttonGlow: true,
                    position: [start[0],start[1] + i*30],
                    clickFunc: function onClick(e){
                        MapGen.triggerDoInfo = {};
                        if (e.currentTarget.doCommand == 'changeMap'){
                            MapGen.triggerDoInfo.map = prompt('enter map name','');
                            MapGen.triggerDoInfo.sector = prompt('enter sector','');
                            MapGen.triggerDoInfo.tile = prompt('enter tile','');
                        }
                        if (e.currentTarget.doCommand == 'jumpToTile'){
                            MapGen.triggerDoInfo.sector = prompt('enter sector','');
                            MapGen.triggerDoInfo.tile = prompt('enter tile','');
                        }
                        MapGen.currentDoTrigger = e.currentTarget.doCommand;
                    }
                })
                doButton.doCommand = doCommands[i];
                Graphics.uiContainer2.addChild(doButton);
            }

            this.currentTriggerText = new PIXI.Text('',style);
            this.currentTriggerText.anchor.x = 0.5;
            this.currentTriggerText.anchor.y = 1;
            this.currentTriggerText.position.x = Graphics.width/2;
            this.currentTriggerText.position.y = Graphics.height - 55;
            Graphics.uiContainer2.addChild(this.currentTriggerText);

            var okButton = Graphics.makeUiElement({
                text: 'Ok',
                style: style,
                anchor: [1,1],
                position: [Graphics.width - 55,Graphics.height - 55],
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    MapGen.clearSelectors();
                }
            });
            Graphics.uiContainer2.addChild(okButton);
        },

        showTileSelector: function(){
            if (this.tileSelectorOn){return;}
            this.clearSelectors();
            this.tileSelectorOn = true;
            Graphics.uiPrimitives1.lineStyle(1,0x000000,0.5);
            Graphics.uiPrimitives1.beginFill(0x000000,0.5)
            Graphics.uiPrimitives1.drawRect(50,50,Graphics.width-100,Graphics.height-100);
            Graphics.uiPrimitives1.endFill()

            var ypos = 55;
            var xpos = 55;

            for(var i = 0; i < 38; i++) {
                for (var j = 0; j < 41;j++){
                    try{
                        var texture = PIXI.Texture.fromFrame(i + 'x' + j + ".png"); //this should filter out empty positions
                        var s = Graphics.makeUiElement({
                            sprite: i + 'x' + j,
                            interactive: true,
                            buttonMode: true,
                            anchor: [0,0],
                            clickFunc: function onClick(e){
                                MapGen.currentPlaceTile = e.currentTarget.resource;
                                MapGen.clearSelectors();
                                var sprite = Graphics.makeUiElement({
                                    sprite: e.currentTarget.resource,
                                    position: [MapGen.currentTileSprite.position.x,MapGen.currentTileSprite.position.y]
                                })
                                sprite.scale.x = 2;
                                sprite.scale.y = 2;
                                Graphics.uiContainer.removeChild(MapGen.currentTileSprite);
                                MapGen.currentTileSprite = sprite;
                                Graphics.uiContainer.addChild(MapGen.currentTileSprite);
                            }
                        });
                        s.scale.x = 1;
                        s.scale.y = 1;
                        s.position.x = xpos + 21 * i;
                        s.position.y = ypos + 21 * j;
                        s.resource = i + 'x' + j;
                        Graphics.uiContainer2.addChild(s);
                    }catch(e){

                    }
                }
            }
            for (var i = 0; i < Graphics.resourceList.length;i++){
                var s = Graphics.makeUiElement({
                    sprite: Graphics.resourceList[i],
                    interactive: true,
                    buttonMode: true,
                    anchor: [0,0],
                    clickFunc: function onClick(e){
                        MapGen.currentPlaceTile = e.currentTarget.resource;
                        MapGen.clearSelectors();
                        var sprite = Graphics.makeUiElement({
                            sprite: e.currentTarget.resource,
                            position: [MapGen.currentTileSprite.position.x,MapGen.currentTileSprite.position.y]
                        })
                        sprite.scale.x = 2;
                        sprite.scale.y = 2;
                        Graphics.uiContainer.removeChild(MapGen.currentTileSprite);
                        MapGen.currentTileSprite = sprite;
                        Graphics.uiContainer.addChild(MapGen.currentTileSprite);
                    }
                });
                s.scale.x = 1;
                s.scale.y = 1;
                s.position.x = xpos + 21 * i;
                s.position.y = ypos + 21 * 41;
                s.resource = Graphics.resourceList[i];
                Graphics.uiContainer2.addChild(s);
            }
        },

        update: function(deltaTime){
            this.map.update(deltaTime);
            this.setInfoTexts();


            if (this.currentMode == 'settrigger'){
                var str = 'Current Trigger: ON <' + this.currentOnTrigger + '> DO <' + this.currentDoTrigger + '>';
                for (var i in this.triggerDoInfo){
                    str += '(' + i + ' = ' + this.triggerDoInfo[i] + ')';
                }
                this.currentTriggerText.text = str;
            }

            if (this.mapName != ''){this.deleteButton.visible = true}
            var zoom = this.ZOOM_SETTINGS[this.currentZoomSetting];
            if (Acorn.Input.isPressed(Acorn.Input.Key.UP)){
                Graphics.worldContainer.position.y += this.map.fullSectorSize;
                Graphics.worldPrimitives.position.y += this.map.fullSectorSize;
                Acorn.Input.setValue(Acorn.Input.Key.UP, false);
            }
            if (Acorn.Input.isPressed(Acorn.Input.Key.DOWN)){
                Graphics.worldContainer.position.y -= this.map.fullSectorSize;
                Graphics.worldPrimitives.position.y -= this.map.fullSectorSize;
                Acorn.Input.setValue(Acorn.Input.Key.DOWN, false);
            }
            if (Acorn.Input.isPressed(Acorn.Input.Key.LEFT)){
                Graphics.worldContainer.position.x += this.map.fullSectorSize;
                Graphics.worldPrimitives.position.x += this.map.fullSectorSize;
                Acorn.Input.setValue(Acorn.Input.Key.LEFT, false);
            }
            if (Acorn.Input.isPressed(Acorn.Input.Key.RIGHT)){
                Graphics.worldContainer.position.x -= this.map.fullSectorSize;
                Graphics.worldPrimitives.position.x -= this.map.fullSectorSize;
                Acorn.Input.setValue(Acorn.Input.Key.RIGHT, false);
            }
            if (Acorn.Input.isPressed(Acorn.Input.Key.HOME)){
                Graphics.worldContainer.position.y = Graphics.height/2;
                Graphics.worldPrimitives.position.y = Graphics.height/2;
                Graphics.worldContainer.position.x = Graphics.width/2;
                Graphics.worldPrimitives.position.x = Graphics.width/2;
                Acorn.Input.setValue(Acorn.Input.Key.HOME, false);
            }
            if (Acorn.Input.isPressed(Acorn.Input.Key.TILESELECT)){
                MapGen.showTileSelector();
                Acorn.Input.setValue(Acorn.Input.Key.TILESELECT, false);
            }
            if (Acorn.Input.isPressed(Acorn.Input.Key.ESCAPE)){
                MapGen.clearSelectors();
            }
            if (Acorn.Input.mouseDown && Acorn.Input.buttons[2]){
                Acorn.Input.mouseDown = false;
                switch(this.currentMode){
                    case 'place':
                        //get sector and tile
                        var tile = this.map.getTile();
                        if (tile == 'none'){
                            var sectorX = Math.floor(((Acorn.Input.mouse.X / Graphics.actualRatio[0]) - Graphics.worldContainer.position.x)/(this.map.SECTOR_TILES*this.map.TILE_SIZE*zoom));
                            var sectorY = Math.floor(((Acorn.Input.mouse.Y / Graphics.actualRatio[1]) - Graphics.worldContainer.position.y)/(this.map.SECTOR_TILES*this.map.TILE_SIZE*zoom));
                            if (confirm('Add sector at ' + sectorX + 'x' + sectorY + '?')){
                                this.map.createSector(sectorX,sectorY);
                                this.changesMade = true;
                            }
                            Acorn.Input.buttons = {};
                        }else{
                            Acorn.Input.buttons = {2:true}
                            Acorn.Input.mouseDown = true;
                            if (tile.resource != this.currentPlaceTile){
                                tile.setSprite(this.currentPlaceTile);
                                this.changesMade = true;
                                if (tile.sprite instanceof PIXI.extras.MovieClip){
                                    for (var k in this.map.sectors){
                                        for (var i = 0; i < this.map.sectors[k].tiles.length;i++){
                                            for (var j = 0; j < this.map.sectors[k].tiles[i].length;j++){
                                                if (this.map.sectors[k].tiles[i][j].sprite instanceof PIXI.extras.MovieClip){
                                                    this.map.sectors[k].tiles[i][j].sprite.gotoAndPlay(1);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        break;
                    case 'deleteSectors':
                        var sectorX = Math.floor(((Acorn.Input.mouse.X / Graphics.actualRatio[0]) - Graphics.worldContainer.position.x)/(this.map.SECTOR_TILES*this.map.TILE_SIZE*zoom));
                        var sectorY = Math.floor(((Acorn.Input.mouse.Y / Graphics.actualRatio[1]) - Graphics.worldContainer.position.y)/(this.map.SECTOR_TILES*this.map.TILE_SIZE*zoom));
                        //clicked on a sector?
                        if (typeof this.map.sectors[sectorX + 'x' + sectorY] == 'undefined'){
                            break;
                        }else{
                            if (confirm('Remove sector at ' + sectorX + 'x' + sectorY + '?')){
                                this.changesMade = true;
                                this.map.deleteSector(sectorX,sectorY);
                            }
                        }
                        this.map.reDraw();
                        Acorn.Input.buttons = {}
                        break;
                    case 'overlay':
                        //set overlay sprite
                        var tile = this.map.getTile();
                        var sectorX = Math.floor(((Acorn.Input.mouse.X / Graphics.actualRatio[0]) - Graphics.worldContainer.position.x)/(this.map.SECTOR_TILES*this.map.TILE_SIZE*zoom));
                        var sectorY = Math.floor(((Acorn.Input.mouse.Y / Graphics.actualRatio[1]) - Graphics.worldContainer.position.y)/(this.map.SECTOR_TILES*this.map.TILE_SIZE*zoom));
                        //clicked on a sector?
                        if (typeof this.map.sectors[sectorX + 'x' + sectorY] == 'undefined'){
                            break;
                        }else{
                            Acorn.Input.buttons = {2:true}
                            Acorn.Input.mouseDown = true;
                            if (tile.resource != this.currentPlaceTile){
                                tile.setOverlaySprite(this.currentPlaceTile);
                                this.changesMade = true;
                            }
                        }
                        break;
                    case 'deleteOverlay':
                        //set overlay sprite
                        var tile = this.map.getTile();
                        var sectorX = Math.floor(((Acorn.Input.mouse.X / Graphics.actualRatio[0]) - Graphics.worldContainer.position.x)/(this.map.SECTOR_TILES*this.map.TILE_SIZE*zoom));
                        var sectorY = Math.floor(((Acorn.Input.mouse.Y / Graphics.actualRatio[1]) - Graphics.worldContainer.position.y)/(this.map.SECTOR_TILES*this.map.TILE_SIZE*zoom));
                        //clicked on a sector?
                        if (typeof this.map.sectors[sectorX + 'x' + sectorY] == 'undefined'){
                            break;
                        }else{
                            Acorn.Input.buttons = {2:true}
                            Acorn.Input.mouseDown = true;
                            if (tile.overlaySprite){
                                this.changesMade = true;
                                Graphics.worldContainer.removeChild(tile.overlaySprite);
                                tile.overlaySprite = null;
                                tile.overlayResource = null;
                            }
                        }
                        break;
                    case 'blocked':
                        //toggle blocked on a node
                        var tile = this.map.getTile();
                        var sectorX = Math.floor(((Acorn.Input.mouse.X / Graphics.actualRatio[0]) - Graphics.worldContainer.position.x)/(this.map.SECTOR_TILES*this.map.TILE_SIZE*zoom));
                        var sectorY = Math.floor(((Acorn.Input.mouse.Y / Graphics.actualRatio[1]) - Graphics.worldContainer.position.y)/(this.map.SECTOR_TILES*this.map.TILE_SIZE*zoom));
                        //clicked on a sector?
                        if (typeof this.map.sectors[sectorX + 'x' + sectorY] == 'undefined'){
                            break;
                        }else{
                            Acorn.Input.buttons = {2:true}
                            Acorn.Input.mouseDown = true;
                            if (tile.open){
                                this.changesMade = true;
                                tile.open = false;
                                tile.sprite.tint = 0xfcd9d9;
                                if (tile.overlaySprite){
                                    tile.overlaySprite.tint = 0xfcd9d9;
                                }
                            }
                        }
                        break;
                    case 'deleteblocked':
                        //toggle blocked on a node
                        var tile = this.map.getTile();
                        var sectorX = Math.floor(((Acorn.Input.mouse.X / Graphics.actualRatio[0]) - Graphics.worldContainer.position.x)/(this.map.SECTOR_TILES*this.map.TILE_SIZE*zoom));
                        var sectorY = Math.floor(((Acorn.Input.mouse.Y / Graphics.actualRatio[1]) - Graphics.worldContainer.position.y)/(this.map.SECTOR_TILES*this.map.TILE_SIZE*zoom));
                        //clicked on a sector?
                        if (typeof this.map.sectors[sectorX + 'x' + sectorY] == 'undefined'){
                            break;
                        }else{
                            Acorn.Input.buttons = {2:true}
                            Acorn.Input.mouseDown = true;
                            if (!tile.open){
                                this.changesMade = true;
                                tile.open = true;
                                tile.sprite.tint = 0xffffff;
                                if (tile.overlaySprite){
                                    tile.overlaySprite.tint = 0xffffff;
                                }
                            }
                        }
                        break;
                    case 'applytrigger':
                        //set trigger
                        var tile = this.map.getTile();
                        var sectorX = Math.floor(((Acorn.Input.mouse.X / Graphics.actualRatio[0]) - Graphics.worldContainer.position.x)/(this.map.SECTOR_TILES*this.map.TILE_SIZE*zoom));
                        var sectorY = Math.floor(((Acorn.Input.mouse.Y / Graphics.actualRatio[1]) - Graphics.worldContainer.position.y)/(this.map.SECTOR_TILES*this.map.TILE_SIZE*zoom));
                        //clicked on a sector?
                        if (typeof this.map.sectors[sectorX + 'x' + sectorY] == 'undefined'){
                            break;
                        }else{
                            Acorn.Input.buttons = {2:true}
                            Acorn.Input.mouseDown = true;
                            //make sure this tile doesnt have the same type of trigger
                            var alreadyHasTrigger = false;
                            for (var i = 0; i < tile.triggers.length; i++){
                                if (tile.triggers[i].on == this.currentOnTrigger){
                                    alreadyHasTrigger = true;
                                    break;
                                }
                            }
                            if (!alreadyHasTrigger){
                                tile.triggers.push({
                                    on: this.currentOnTrigger,
                                    do: this.currentDoTrigger,
                                    data: this.triggerDoInfo
                                });
                                this.changesMade = true;
                                tile.sprite.tint = 0xc0d5f7;
                                if (tile.overlaySprite){
                                    tile.overlaySprite.tint = 0xc0d5f7;
                                }
                            }
                        }
                        break;
                    case 'deletetriggers':
                        //toggle blocked on a node
                        var tile = this.map.getTile();
                        var sectorX = Math.floor(((Acorn.Input.mouse.X / Graphics.actualRatio[0]) - Graphics.worldContainer.position.x)/(this.map.SECTOR_TILES*this.map.TILE_SIZE*zoom));
                        var sectorY = Math.floor(((Acorn.Input.mouse.Y / Graphics.actualRatio[1]) - Graphics.worldContainer.position.y)/(this.map.SECTOR_TILES*this.map.TILE_SIZE*zoom));
                        //clicked on a sector?
                        if (typeof this.map.sectors[sectorX + 'x' + sectorY] == 'undefined'){
                            break;
                        }else{
                            Acorn.Input.buttons = {2:true}
                            Acorn.Input.mouseDown = true;
                            if (tile.triggers.length > 0){
                                this.changesMade = true;
                                tile.triggers = [];
                                tile.sprite.tint = 0xffffff;
                                if (tile.overlaySprite){
                                    tile.overlaySprite.tint = 0xffffff;
                                }
                            }
                        }
                        break;
                }
            }
        },

        setInfoTexts: function(){
            //get tile and sector
            this.triggerInfo.visible = false;
            var zoom = this.ZOOM_SETTINGS[this.currentZoomSetting];
            this.zoomText.text = 'Zoom (Current: ' + zoom + ')';
            this.modeText.text = 'Mode Select - Current: ' + this.currentMode;
            var mX = (Acorn.Input.mouse.X / Graphics.actualRatio[0]) - Graphics.worldContainer.position.x;
            var mY = (Acorn.Input.mouse.Y / Graphics.actualRatio[1]) - Graphics.worldContainer.position.y;

            var sectorX = Math.floor(mX/(this.map.SECTOR_TILES*this.map.TILE_SIZE*zoom));
            var sectorY = Math.floor(mY/(this.map.SECTOR_TILES*this.map.TILE_SIZE*zoom));
            this.sectorInfo.text = 'Sector: ' + sectorX + 'x' + sectorY;
            this.sectorInfo.visible = true;
            this.sectorInfo.position.y = this.tileInfo.position.y - this.tileInfo.height - 10;
            this.sectorInfo.position.x = Graphics.width/2;

            if (typeof this.map.sectors[sectorX + 'x' + sectorY] == 'undefined'){
                this.tileInfo.text = 'Click to create new sector at ' + sectorX + 'x' + sectorY + ' (must be in place mode)';
            }else{
                var mTX = mX - sectorX*(this.map.SECTOR_TILES*this.map.TILE_SIZE*zoom);
                var mTY = mY - sectorY*(this.map.SECTOR_TILES*this.map.TILE_SIZE*zoom);
                var tileX = Math.floor(mTX/(this.map.TILE_SIZE*zoom));
                var tileY = Math.floor(mTY/(this.map.TILE_SIZE*zoom));
                this.tileInfo.text = 'Tile: ' + tileX + 'x' + tileY;

                var tile = this.map.sectors[sectorX + 'x' + sectorY].tiles[tileX][tileY];
                if (tile.triggers.length > 0){
                    var str = '';
                    for (var i = 0; i < tile.triggers.length; i++){
                        var tstr = 'Trigger ' + i + ': ON <' + tile.triggers[i].on + '> DO <' + tile.triggers[i].do + '>';
                        if (tile.triggers[i].data){
                            for (var j in tile.triggers[i].data){
                                tstr += ' (' + j + '=' + tile.triggers[i].data[j] + ') ';
                            }
                        }
                        str += tstr + ' --- ';
                    }
                    this.triggerInfo.text = str;
                    this.triggerInfo.visible = true;
                }
            }
            this.tileInfo.visible = true;
            this.tileInfo.position.x = Graphics.width/2;




        },
        drawBG: function(){
            Graphics.bgContainer.clear();
            var colors= [
                        'aqua', 'black', 'blue', 'fuchsia', 'green', 
                        'lime', 'maroon', 'navy', 'olive', 'orange', 'purple', 'red', 
                        'silver', 'teal', 'white', 'yellow'
                    ];
            Graphics.drawBG('silver', 'silver');

        },

        resetColors: function(){
            MapGen.sZone1.defaultFill = Graphics.pallette.color1;
            MapGen.sZone2.defaultFill = Graphics.pallette.color1;
            MapGen.sZone1.style.fill = Graphics.pallette.color1;
            MapGen.sZone2.style.fill = Graphics.pallette.color1;
        }
    }
    window.MapGen = MapGen;
})(window);
