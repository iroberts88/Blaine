
(function(window) {
    MapGen = {
       
        tileSelectorOn: false,
        currentMode: 'place',

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
                tile = prompt("Please enter a default tile for this map", '1x22');
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

            var tt = new PIXI.Text('Current - ');
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
            this.tileInfo.anchor.x = 1;
            this.tileInfo.anchor.y = 1;
            this.sectorInfo.anchor.x = 0.5;
            this.sectorInfo.anchor.y = 1;
            this.tileInfo.position.x = Graphics.width - 20;
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
                                MapGen.map.defaultTile = e.currentTarget.resource;
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
                        MapGen.map.defaultTile = e.currentTarget.resource;
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
        },

        setInfoTexts: function(){

        },
        drawBG: function(){
            Graphics.bgContainer.clear();
            var colors= [
                        'aqua', 'black', 'blue', 'fuchsia', 'green', 
                        'lime', 'maroon', 'navy', 'olive', 'orange', 'purple', 'red', 
                        'silver', 'teal', 'white', 'yellow'
                    ];
            Graphics.drawBG('white', 'white');

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
