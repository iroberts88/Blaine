
(function(window) {
    MainMenu = {
        bgMap: null,

        init: function() {

            //draw the map BG
            for (var i = 0; i < this.bgMap.length;i++){
                for (var j = 0; j < this.bgMap[i].length;j++){
                    var sprite = Graphics.getSprite(this.bgMap[i][j].tex);
                    sprite.scale.x = 2;
                    sprite.scale.y = 2;
                    sprite.position.x = j*32;
                    sprite.position.y = i*32;
                    Graphics.bgContainer.addChild(sprite);
                    if (this.bgMap[i][j].oTex){
                        var sprite = Graphics.getSprite(this.bgMap[i][j].oTex);
                        sprite.scale.x = 2;
                        sprite.scale.y = 2;
                        sprite.position.x = j*32;
                        sprite.position.y = i*32;
                        Graphics.bgContainer.addChild(sprite);
                    }
                    Graphics.bgContainer.scale.x = 1.3;
                    Graphics.bgContainer.scale.y = 1.3;
                }
            }

            Graphics.worldPrimitives.lineStyle(1,0x000000,0.3);
            Graphics.worldPrimitives.beginFill(0x000000,0.3)
            Graphics.worldPrimitives.drawRect(0,0,Graphics.width,Graphics.height);
            Graphics.worldPrimitives.endFill()

            this.newText = Graphics.makeUiElement({
                text: 'NEW',
                style: AcornSetup.baseStyle,
                interactive: true,buttonMode: true,buttonGlow: true,
                position: [Graphics.width* 0.25,(Graphics.height * .5)],
                clickFunc: function onClick(){
                }
            });
            this.newText.style.fontSize = 48;
            //Graphics.uiContainer.addChild(this.newText);

            this.editText = Graphics.makeUiElement({
                text: 'EDIT',
                style: AcornSetup.baseStyle,
                interactive: true,buttonMode: true,buttonGlow: true,
                position: [Graphics.width* 0.75,(Graphics.height * .5)],
                clickFunc: function onClick(){
                }
            });
            this.editText.style.fontSize = 48;
            //Graphics.uiContainer.addChild(this.editText);
            console.log('Main Menu INITIALIZED')
        },
        
        update: function(dt){
            Graphics.uiPrimitives2.clear();

            
        }

    }
    window.MainMenu = MainMenu;
})(window);
