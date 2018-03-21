
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

            Graphics.uiPrimitives.lineStyle(2,0x000000,1);
            Graphics.uiPrimitives.beginFill(0xFFFFFF,1)
            Graphics.uiPrimitives.drawRoundedRect(Graphics.width/2 - 200,Graphics.height/2 -200,400,400,25);
            Graphics.uiPrimitives.endFill()


            this.logoText = Graphics.makeUiElement({
                text: 'Logo Here',
                style: AcornSetup.baseStyle,
                position: [Graphics.width* 0.5,Graphics.height*0.5 - 150],
            });
            Graphics.uiContainer.addChild(this.logoText);

            var usernameInput = document.createElement( 'input' );
            usernameInput.id = 'username';
            usernameInput.type = 'text';
            usernameInput.name = 'username';
            usernameInput.placeholder = 'Name';
            usernameInput.maxlength = 16;
            usernameInput.style.cssText = 'text-shadow:rgba(0,30,84,0.3) 0 -1px 0;width:300px;height:45px;top:42%;left:42.2%;background-color:#fff;font-weight:bold;font-size: 24px;font-family:Helvetica;position:absolute';
            usernameInput.style.display = 'block';
            document.body.appendChild( usernameInput );

            Graphics.elements.push('username');

            this.guestText = Graphics.makeUiElement({
                text: 'Play as a guest',
                style: AcornSetup.baseStyle,
                interactive: true,buttonMode: true,buttonGlow: true,
                position: [Graphics.width* 0.5,Graphics.height * 0.5-15],
                clickFunc: function onClick(){
                }
            });
            this.guestText.style.fontSize = 24;
            Graphics.uiContainer.addChild(this.guestText);

            var usernameInput = document.createElement( 'input' );
            usernameInput.id = 'password';
            usernameInput.type = 'password';
            usernameInput.name = 'password';
            usernameInput.placeholder = 'password';
            usernameInput.maxlength = 16;
            usernameInput.style.cssText = 'text-shadow:rgba(0,30,84,0.3) 0 -1px 0;width:300px;height:45px;top:52%;left:42.2%;background-color:#fff;font-weight:bold;font-size: 24px;font-family:Helvetica;position:absolute';
            usernameInput.style.display = 'block';
            document.body.appendChild( usernameInput );

            Graphics.elements.push('password');


            Graphics.resize();
            console.log('Main Menu INITIALIZED')
        },
        
        update: function(dt){
            Graphics.uiPrimitives2.clear();
            
        }

    }
    window.MainMenu = MainMenu;
})(window);
