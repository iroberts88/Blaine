
(function(window) {
    MainMenu = {
        bgMap: null,
        loginType: null,

        errorTicker: 0,
        errorVisible: false,
        errorAlpha: 1.0,

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

            this.mainPanel = document.createElement('div');
            this.mainPanel.id = 'mainPanel'
            this.mainPanel.style.cssText = 'width:400px;height:225px;top:' + (window.innerHeight/2-200) + 'px;left:' + (window.innerWidth/2-200) + 'px;background-color:#fff;position:absolute;border-radius:12px;margin:2px;padding:5px 15px 5px 15px;vertical-align:top;'
            this.mainPanel.style.display = 'block';
            document.body.appendChild( this.mainPanel );
            Graphics.elements.push('mainPanel');

            //Logo Text
            this.logoText = document.createElement( 'div' );
            this.logoText.id = 'logoText';
            this.logoText.type = 'text';
            this.logoText.style.cssText = 'position:absolute;background-color: #FFF;text-align: center;display: inline-block;font-size: 24px;top:35px;left:90px;color:#484848;font-family:Pokemon,Lato;font-weight:bold;line-height:15px';
            this.logoText.innerHTML = 'PKMN Project';
            this.mainPanel.appendChild( this.logoText );
            //Logo Text
            this.errorText = document.createElement( 'div' );
            this.errorText.id = 'errorText';
            this.errorText.type = 'text';
            this.errorText.style.cssText = 'position:absolute;background-color: #FFF;text-align: center;display: inline-block;font-size: 12px;top:75px;left:80px;color:#FF0000;font-family:Pokemon;font-weight:bold;line-height:15px';
            this.errorText.innerHTML = '';
            this.mainPanel.appendChild( this.errorText );
            //Username input box
            this.usernameInput = document.createElement( 'input' );
            this.usernameInput.id = 'username';
            this.usernameInput.type = 'text';
            this.usernameInput.name = 'username';
            this.usernameInput.placeholder = 'username';
            this.usernameInput.maxlength = 16;
            this.usernameInput.style.cssText = 'border-width:1px;border-style:solid;width:200px;height:40px;top:101px;left:105px;background-color:#fff;font-weight:bold;font-size: 24px;font-family:Helvetica;position:absolute';
            this.usernameInput.style.display = 'inline-block';
            //password input box
            this.passwordInput = document.createElement( 'input' );
            this.passwordInput.id = 'password';
            this.passwordInput.type = 'password';
            this.passwordInput.placeholder = 'password';
            this.passwordInput.maxlength = 16;
            this.passwordInput.style.cssText = 'border-width:1px;border-style:solid;width:200px;height:40px;top:145px;left:105px;background-color:#fff;font-weight:bold;font-size: 24px;font-family:Helvetica;position:absolute';
            this.passwordInput.style.display = 'inline-block';
            //play as a guest button
            this.guestButton = document.createElement( 'div' );
            this.guestButton.id = 'guestButton';
            this.guestButton.type = 'button';
            this.guestButton.style.cssText = 'top:155px;left:75px;cursor: pointer;position:absolute;border-radius:10px;background-color: #484848;border: none;color: gray;padding: 15px 32px;text-align: center;text-decoration: none;display: inline-block;color:#D2D2D2;font-family:Pokemon;font-size:24px;font-weight:bold;line-height:15px';
            this.guestButton.innerHTML = 'play as guest ';
            this.guestButton.onpointerup = function(){
                MainMenu.loginType = 'guest';
                MainMenu.mainPanel.style.height = '225px';
                MainMenu.mainPanel.appendChild(MainMenu.usernameInput);
                MainMenu.usernameInput.focus();
                MainMenu.mainPanel.appendChild(MainMenu.submitButton);
                MainMenu.mainPanel.appendChild(MainMenu.cancelButton);
                MainMenu.submitButton.style.top = '150px';
                MainMenu.cancelButton.style.top = '150px';
                MainMenu.mainPanel.removeChild(MainMenu.loginButton);
                MainMenu.mainPanel.removeChild(MainMenu.createButton);
                MainMenu.mainPanel.removeChild(MainMenu.guestButton);
            }
            this.mainPanel.appendChild( this.guestButton );
            //login and play button
            this.loginButton = document.createElement( 'div' );
            this.loginButton.id = 'loginButton';
            this.loginButton.type = 'button';
            this.loginButton.style.cssText = 'top:100px;left:75px;cursor: pointer;position:absolute;border-radius:10px;background-color: #484848;border: none;color: gray;padding: 15px 32px;text-align: center;text-decoration: none;display: inline-block;color:#D2D2D2;font-family:Pokemon;font-size:14px;font-weight:bold;line-height:15px';
            this.loginButton.innerHTML = 'login';
            this.loginButton.onpointerup = function(){
                MainMenu.loginType = 'normal';
                MainMenu.mainPanel.style.height = '255px';
                MainMenu.mainPanel.appendChild(MainMenu.usernameInput);
                MainMenu.usernameInput.focus();
                MainMenu.mainPanel.appendChild(MainMenu.passwordInput);
                MainMenu.mainPanel.appendChild(MainMenu.submitButton);
                MainMenu.mainPanel.appendChild(MainMenu.cancelButton);
                MainMenu.submitButton.style.top = '200px';
                MainMenu.cancelButton.style.top = '200px';
                MainMenu.mainPanel.removeChild(MainMenu.loginButton);
                MainMenu.mainPanel.removeChild(MainMenu.createButton);
                MainMenu.mainPanel.removeChild(MainMenu.guestButton);
            }
            this.mainPanel.appendChild( this.loginButton );
            //create a new user and play button
            this.createButton = document.createElement( 'div' );
            this.createButton.id = 'createButton';
            this.createButton.type = 'button';
            this.createButton.style.cssText = 'top:100px;left:195px;cursor: pointer;position:absolute;border-radius:10px;background-color: #484848;border: none;color: gray;padding: 15px 32px;text-align: center;text-decoration: none;display: inline-block;color:#D2D2D2;font-family:Pokemon;font-size:14px;font-weight:bold;line-height:15px';
            this.createButton.innerHTML = 'new player';
            this.createButton.onpointerup = function(){
                MainMenu.loginType = 'new';
                MainMenu.mainPanel.style.height = '255px';
                MainMenu.mainPanel.appendChild(MainMenu.usernameInput);
                MainMenu.usernameInput.focus();
                MainMenu.mainPanel.appendChild(MainMenu.passwordInput);
                MainMenu.mainPanel.appendChild(MainMenu.submitButton);
                MainMenu.mainPanel.appendChild(MainMenu.cancelButton);
                MainMenu.submitButton.style.top = '200px';
                MainMenu.cancelButton.style.top = '200px';
                MainMenu.mainPanel.removeChild(MainMenu.loginButton);
                MainMenu.mainPanel.removeChild(MainMenu.createButton);
                MainMenu.mainPanel.removeChild(MainMenu.guestButton);
            }
            this.mainPanel.appendChild( this.createButton );
            //create submit and cancel buttons
            this.submitButton = document.createElement( 'div' );
            this.submitButton.id = 'submitButton';
            this.submitButton.type = 'button';
            this.submitButton.style.cssText = 'top:150px;left:83px;cursor: pointer;position:absolute;border-radius:10px;background-color: #484848;border: none;color: gray;padding: 15px 32px;text-align: center;text-decoration: none;display: inline-block;color:#D2D2D2;font-family:Pokemon;font-size:14px;font-weight:bold;line-height:15px';
            this.submitButton.innerHTML = 'submit';
            this.submitButton.onpointerup = function(){
                //check for valid sn/pw;
                var sn = MainMenu.usernameInput.value;
                var pw = MainMenu.passwordInput.value;
                switch(MainMenu.loginType){
                    case 'normal':
                        Acorn.Net.socket_.emit('loginAttempt',{sn: sn,pw:pw});
                        break;
                    case 'new':
                        Acorn.Net.socket_.emit('createUser',{sn: sn,pw:pw});
                        break;
                    case 'guest':
                        Acorn.Net.socket_.emit('guestLogin',{sn: sn});
                        break;
                }
            }
            this.cancelButton = document.createElement( 'div' );
            this.cancelButton.id = 'cancelButton';
            this.cancelButton.type = 'button';
            this.cancelButton.style.cssText = 'top:150px;left:210px;cursor: pointer;position:absolute;border-radius:10px;background-color: #484848;border: none;color: gray;padding: 15px 32px;text-align: center;text-decoration: none;display: inline-block;color:#D2D2D2;font-family:Pokemon;font-size:14px;font-weight:bold;line-height:15px';
            this.cancelButton.innerHTML = 'cancel';
            this.cancelButton.onpointerup = function(){
                MainMenu.mainPanel.style.height = '225px';
                MainMenu.mainPanel.removeChild(MainMenu.usernameInput);
                try{
                    MainMenu.mainPanel.removeChild(MainMenu.passwordInput);
                }catch(e){}
                MainMenu.mainPanel.removeChild(MainMenu.submitButton);
                MainMenu.mainPanel.removeChild(MainMenu.cancelButton);
                MainMenu.mainPanel.appendChild(MainMenu.loginButton);
                MainMenu.mainPanel.appendChild(MainMenu.createButton);
                MainMenu.mainPanel.appendChild(MainMenu.guestButton);
                MainMenu.passwordInput.value = '';
                MainMenu.usernameInput.value = '';
            }

            Graphics.resize();
            console.log('Main Menu INITIALIZED')
        },
        setLoginErrorText: function(s){
            this.errorText.innerHTML = s;
            this.errorText.style.left = 200 - this.errorText.clientWidth/2;
            this.errorVisible = true;
            this.errorTicker = 0;
            this.errorAlpha = 1.0;
            this.errorText.style.color = 'rgba(255, 0, 0,' +  this.errorAlpha + ')';
        },
        update: function(dt){
            Graphics.uiPrimitives2.clear();

            if (this.errorVisible){
                this.errorTicker += dt;
                if (this.errorTicker > 5){
                    this.errorAlpha = this.errorAlpha*0.95;
                    this.errorText.style.color = 'rgba(255, 0, 0,' +  this.errorAlpha + ')';
                    if (this.errorAlpha < 0.02){
                        this.errorText.innerHTML = '';
                        this.errorVisible = false;

                    }
                }
            }
        }

    }
    window.MainMenu = MainMenu;
})(window);
