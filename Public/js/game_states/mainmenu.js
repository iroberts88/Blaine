
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

            var mainPanel = document.createElement('div');
            mainPanel.id = 'mainPanel'
            mainPanel.style.cssText = 'width:400px;height:400px;top:35%;left:40%;background-color:#fff;position:absolute;border-radius:12px;margin:2px;padding:5px 15px 5px 15px;vertical-align:top;'
            mainPanel.style.display = 'block';
            document.body.appendChild( mainPanel );
            Graphics.elements.push('mainPanel');

              var logoText = document.createElement( 'div' );
            logoText.id = 'logoText';
            logoText.type = 'text';
            logoText.style.cssText = 'position:relative;background-color: #FFF;text-align: center;display: inline-block;font-size: 18px;top:25px;left:65px;color:#484848;font-family:"Permanent Marker";font-size: 48px;font-weight:bold;line-height:15px';
            logoText.innerHTML = 'logo here';
            mainPanel.appendChild( logoText );

            var usernameInput = document.createElement( 'input' );
            usernameInput.id = 'username';
            usernameInput.type = 'text';
            usernameInput.name = 'username';
            usernameInput.placeholder = 'name';
            usernameInput.maxlength = 16;
            usernameInput.style.cssText = 'width:300px;height:45px;top:101px;left:51px;background-color:#fff;font-weight:bold;font-size: 24px;font-family:Helvetica;position:absolute';
            usernameInput.style.display = 'block';
            mainPanel.appendChild( usernameInput );

             var guestText = document.createElement( 'div' );
            guestText.id = 'guestText';
            guestText.type = 'button';
            guestText.style.cssText = 'cursor: pointer;position:relative;transition-duration: 0.4s;-webkit-transition-duration: 0.4s;border-radius:10px;background-color: #484848;border: none;color: gray;padding: 15px 32px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;top:150px;left:50px;color:#D2D2D2;font-family:"Permanent Marker";font-size:32px;font-weight:bold;line-height:15px';
            guestText.innerHTML = 'Play as guest ';
            guestText.onmouseover = function() 
            {
                this.style.backgroundColor = "blue";
            }
            guestText.onmouseout = function() 
            {
                this.style.backgroundColor = "#484848";
            }
            mainPanel.appendChild( guestText );

            var passwordInput = document.createElement( 'input' );
            passwordInput.id = 'password';
            passwordInput.type = 'password';
            passwordInput.name = 'password';
            passwordInput.placeholder = 'password';
            passwordInput.maxlength = 16;
            passwordInput.style.cssText = 'width:300px;height:45px;top:251px;left:51px;background-color:#fff;font-weight:bold;font-size: 24px;font-family:Helvetica;position:absolute';
            passwordInput.style.display = 'block';
            mainPanel.appendChild( passwordInput );



            Graphics.resize();
            console.log('Main Menu INITIALIZED')
        },
        
        update: function(dt){
            Graphics.uiPrimitives2.clear();
            
        }

    }
    window.MainMenu = MainMenu;
})(window);
