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
    }
    preload ()
    {  
        var that = this;
        this.map = new TileMap();
        window.currentGameMap = this.map;
        console.log(this.map);
        this.changesMade = false;

        this.map.defaultTile = '1x1';
        this.map.init(this.data);


        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

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

        /*
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
    }

    create ()
    {   

    }

}