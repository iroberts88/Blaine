
(function(window) {
    MapGen = {
        
        ZOOM_SETTINGS: [0.2,0.4,0.6,0.8,1,1.2,1.4,1.6,1.8],
        currentZoomSetting: 4,
        tileSelectorOn: false,

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
                tile = prompt("Please enter a default tile for this map", '1x1');
                try{
                    var sprite = Graphics.resources[tile];
                    this.map.defaultTile = tile;
                    gotTile = true;
                    console.log('Got Default Tile!!!');
                }catch(e){
                    console.log('fail');
                }
            }


            this.map.init({
                dTile: tile
            });

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
                    MapGen.currentMode = 'place'
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
                    MapGen.currentMode = 'overlay'
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
                    MapGen.currentMode = 'blocked'
                }
            });
            Graphics.uiContainer.addChild(this.blockedButton);

            this.directionsButton = Graphics.makeUiElement({
                text: 'directions',
                style: style,
                position: [5, this.blockedButton.position.y + 5 + this.blockedButton.height],
                anchor: [0,0],
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    MapGen.currentMode = 'directions'
                }
            });
            Graphics.uiContainer.addChild(this.directionsButton);

            this.triggersButton = Graphics.makeUiElement({
                text: 'triggers',
                style: style,
                position: [5, this.directionsButton.position.y + 5 + this.directionsButton.height],
                anchor: [0,0],
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    MapGen.currentMode = 'triggers'
                }
            });
            Graphics.uiContainer.addChild(this.triggersButton);

            this.deleteSectorsButton = Graphics.makeUiElement({
                text: 'delete sectors',
                style: style,
                position: [5, this.triggersButton.position.y + 5 + this.triggersButton.height],
                anchor: [0,0],
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    MapGen.currentMode = 'deleteSectors'
                }
            });
            Graphics.uiContainer.addChild(this.deleteSectorsButton);

            //back button
            this.exitButton = Graphics.makeUiElement({
                text: 'Exit',
                style: style,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    /*console.log(MapGen.changesMade)
                    if (MapGen.changesMade){
                        if (confirm('Exit and lose unsaved data?') == true) {
                            MapGen.data = null;
                            MapGen.mapName = null;
                            Acorn.changeState('mainMenu');
                        }
                    }else{
                        MapGen.data = null;
                        MapGen.mapName = null;
                        Acorn.changeState('mainMenu');
                    }*/
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
                    /*var name = prompt("Please enter a name for the map", MapGen.mapName);
                    if (!name || name == ''){
                        alert('Map not saved.');
                    }else{
                        var mapData = {};
                        var sz1 = [];
                        var sz2 = [];
                        for (var i = 0; i < MapGen.map.startZone1.length;i++){
                            var node = {
                                q: MapGen.map.startZone1[i].q,
                                r: MapGen.map.startZone1[i].r,
                                h: MapGen.map.startZone1[i].h,
                                deleted: MapGen.map.startZone1[i].deleted,
                                tile: MapGen.map.startZone1[i].tile
                            }
                            sz1.push(node);
                        }
                        for (var i = 0; i < MapGen.map.startZone2.length;i++){
                            var node = {
                                q: MapGen.map.startZone2[i].q,
                                r: MapGen.map.startZone2[i].r,
                                h: MapGen.map.startZone2[i].h,
                                deleted: MapGen.map.startZone2[i].deleted,
                                tile: MapGen.map.startZone2[i].tile
                            }
                            sz2.push(node);
                        }
                        for (var i in MapGen.map.axialMap){
                            for (var j in MapGen.map.axialMap[i]){
                                if (typeof mapData[i] == 'undefined'){
                                    mapData[i] = {};
                                }
                                var node = {
                                    q: MapGen.map.axialMap[i][j].q,
                                    r: MapGen.map.axialMap[i][j].r,
                                    h: MapGen.map.axialMap[i][j].h,
                                    deleted: MapGen.map.axialMap[i][j].deleted,
                                    tile: MapGen.map.axialMap[i][j].tile
                                }
                                mapData[i][j] = node;
                            }
                        }
                        MapGen.changesMade = false;
                        Acorn.Net.socket_.emit('createMap',{name: name,mapData: mapData,sz1: sz1,sz2:sz2});
                    }*/
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
                    /*if (confirm('Delete map "' + MapGen.mapName + '"?') == true) {
                        Acorn.Net.socket_.emit('deleteMap',{name:MapGen.mapName});
                        Acorn.changeState('mainMenu');
                    }*/
                }
            });
            this.deleteButton.position.x = this.saveButton.position.x - this.saveButton.width/2 - 25- this.deleteButton.width/2;
            this.deleteButton.position.y = this.exitButton.position.y;
            Graphics.uiContainer.addChild(this.deleteButton);

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
            Graphics.uiContainer.addChild(this.sectorInfo);
            Graphics.uiContainer.addChild(this.tileInfo);

            Graphics.showLoadingMessage(false);
        },


        showTileSelector: function(){
            if (this.tileSelectorOn){return;}
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
                                Graphics.uiPrimitives1.clear();
                                Graphics.uiContainer2.removeChildren();
                                MapGen.tileSelectorOn = false;
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
                        Graphics.uiPrimitives1.clear();
                        Graphics.uiContainer2.removeChildren();
                        MapGen.tileSelectorOn = false;
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
                            }
                            Acorn.Input.buttons = {}
                        }else{
                            Acorn.Input.buttons = {2:true}
                            Acorn.Input.mouseDown = true;
                            if (tile.resource != this.currentPlaceTile){
                                Graphics.worldContainer.removeChild(tile.sprite);
                                var posX = tile.sprite.position.x;
                                var posY = tile.sprite.position.y;
                                console.log(this.currentPlaceTile);
                                tile.sprite = Graphics.getSprite(this.currentPlaceTile);
                                console.log(tile);
                                tile.sprite.position.x = posX;
                                tile.sprite.position.y = posY;
                                tile.sprite.scale.x = 2;
                                tile.sprite.scale.y = 2;
                                Graphics.worldContainer.addChild(tile.sprite);
                                tile.resource = this.currentPlaceTile;
                            }
                        }
                }
            }
        },

        setInfoTexts: function(){
            //get tile and sector
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
                this.tileInfo.text = 'Click to create new sector at ' + sectorX + 'x' + sectorY;
            }else{
                var mTX = mX - sectorX*(this.map.SECTOR_TILES*this.map.TILE_SIZE*zoom);
                var mTY = mY - sectorY*(this.map.SECTOR_TILES*this.map.TILE_SIZE*zoom);
                var tileX = Math.floor(mTX/(this.map.TILE_SIZE*zoom));
                var tileY = Math.floor(mTY/(this.map.TILE_SIZE*zoom));
                this.tileInfo.text = 'Tile: ' + tileX + 'x' + tileY;
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
