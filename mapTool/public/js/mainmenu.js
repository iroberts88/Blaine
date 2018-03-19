
(function(window) {
    MainMenu = {
        init: function() {
            Graphics.drawBG(Graphics.pallette.color2, Graphics.pallette.color2);
            MapGen.data = {};
            MapGen.map = null;
            this.newText = Graphics.makeUiElement({
                text: 'NEW',
                style: AcornSetup.baseStyle,
                interactive: true,buttonMode: true,buttonGlow: true,
                position: [Graphics.width* 0.25,(Graphics.height * .5)],
                clickFunc: function onClick(){
                    Acorn.changeState('mapgen');
                }
            });
            this.newText.style.fontSize = 48;
            Graphics.uiContainer.addChild(this.newText);

            this.editText = Graphics.makeUiElement({
                text: 'EDIT',
                style: AcornSetup.baseStyle,
                interactive: true,buttonMode: true,buttonGlow: true,
                position: [Graphics.width* 0.75,(Graphics.height * .5)],
                clickFunc: function onClick(){
                    var s = "Enter map name: ";
                    var name = prompt(s, '');
                    if (name && name != ''){
                        Acorn.Net.socket_.emit('editMap',{name: name});
                        MapGen.mapName = name;
                        Graphics.showLoadingMessage(true);
                    }
                }
            });
            this.editText.style.fontSize = 48;
            Graphics.uiContainer.addChild(this.editText);
        },
        
        update: function(dt){
            Graphics.uiPrimitives2.clear();
            
        }

    }
    window.MainMenu = MainMenu;
})(window);
