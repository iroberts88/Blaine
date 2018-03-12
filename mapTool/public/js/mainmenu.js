
(function(window) {
    MainMenu = {
        init: function() {
            Graphics.drawBG(Graphics.pallette.color2, Graphics.pallette.color2);

            this.newText = Graphics.makeUiElement({
                text: 'NEW',
                style: AcornSetup.baseStyle,
                interactive: true,buttonMode: true,buttonGlow: true,
                position: [Graphics.width* 0.25,(Graphics.height * .5)],
                clickFunc: function onClick(){
                    
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
