
(function(window) {
    MainMenu = {
        bgMap: null,
        loginType: null,

        errorTicker: 0,
        errorVisible: false,
        errorAlpha: 1.0,

        charSelect: false,
        currentChar: null,

        fadeOut: null,
        fadeOutTicker: null,

        init: function() {
            this.currentChar = null;
            this.charSelect = false;
            this.fadeOut = false;
            this.fadeOutTicker = 0;

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
            this.mainPanel.style.cssText = 'width:400px;height:225px;top:50%;left:50%;background-color:#fff;position:absolute;border-radius:12px;padding:5px 15px 5px 15px;'
            this.mainPanel.style.display = 'inline-block';
            document.body.appendChild( this.mainPanel );
            Graphics.elements.push('mainPanel');

            //Logo Text
            this.logoText = document.createElement( 'div' );
            this.logoText.id = 'logoText';
            this.logoText.type = 'text';
            this.logoText.style.cssText = 'position:absolute;background-color: #FFF;text-align: center;display: inline-block;font-size: 24px;top:35px;left:50px;color:#484848;font-family:Pokemon,Lato;font-weight:bold;line-height:15px';
            this.logoText.innerHTML = 'PROJECT POK|MON';
            this.mainPanel.appendChild( this.logoText );
            //Logo Text
            this.errorText = document.createElement( 'div' );
            this.errorText.id = 'errorText';
            this.errorText.type = 'text';
            this.errorText.style.cssText = 'position:absolute;background-color: #FFF;text-align: center;display: inline-block;font-size: 10px;top:75px;left:80px;color:#FF0000;font-family:Pokemon;font-weight:bold;line-height:15px';
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
                Acorn.Sound.play('select');
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
                Acorn.Sound.play('select');
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
                Acorn.Sound.play('select');
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
                Acorn.Sound.play('select');
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
            this.cancelButton.style.cssText = 'top:150px;left:215px;cursor: pointer;position:absolute;border-radius:10px;background-color: #484848;border: none;color: gray;padding: 15px 32px;text-align: center;text-decoration: none;display: inline-block;color:#D2D2D2;font-family:Pokemon;font-size:14px;font-weight:bold;line-height:15px';
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
            console.log('Main Menu INITIALIZED');
            Acorn.Sound.play('opening');
        },
        setLoginErrorText: function(s){
            this.errorText.innerHTML = s;
            this.errorText.style.left = 200 - this.errorText.clientWidth/2;
            this.errorVisible = true;
            this.errorTicker = 0;
            this.errorAlpha = 1.0;
            this.errorText.style.color = 'rgba(255, 0, 0,' +  this.errorAlpha + ')';
        },
        showCharacterSelection(data){
            this.charSelect = true;
            Graphics.uiPrimitives.lineStyle(1,0xFFFFFF,1);
            Graphics.uiPrimitives.beginFill(0xFFFFFF,1)
            Graphics.uiPrimitives.drawRoundedRect(Graphics.width/2-200,Graphics.height/2-200,400,400,12);
            Graphics.uiPrimitives.endFill()
            var charSelection = new PIXI.Text('SELECT A CHARACTER',AcornSetup.style2);
            charSelection.anchor.x = 0.5;
            charSelection.anchor.y = 0.5;
            charSelection.position.x = Graphics.width/2;
            charSelection.position.y = Graphics.height/2 - 175;
            Graphics.uiContainer.addChild(charSelection);
            for (var i = 0; i < 3;i++){
                var num = new PIXI.Text(i+1,AcornSetup.style2);
                num.anchor.y = 0.5;
                num.position.x = Graphics.width/2 - 190;
                num.position.y = Graphics.height/2 - 120 + i*60;
                Graphics.uiContainer.addChild(num);
                //check if character exists
                if (typeof data.characters[i] == 'undefined'){
                    button = Graphics.makeUiElement({
                        text: 'NEW CHARACTER',
                        style: AcornSetup.baseStyle,
                        interactive: true,buttonMode: true,
                        position: [(Graphics.width/2 - 150),Graphics.height/2 - 120 + i*60],
                        anchor: [0,0.5],
                        clickFunc: function onClick(e){
                            //new character!
                            Acorn.Sound.play('select');
                            MainMenu.playButton.visible = true;
                            if(!e.currentTarget.newChar){
                                MainMenu.deleteButton.visible = true;
                            }
                            MainMenu.currentChar = e.currentTarget.num;
                            var start = [e.currentTarget.position.x + e.currentTarget.width + 20,e.currentTarget.position.y];
                            console.log(start)
                            Graphics.uiPrimitives1.clear();
                            Graphics.uiPrimitives1.lineStyle(1,0x484848,1);
                            Graphics.uiPrimitives1.beginFill(0x484848,1)
                            Graphics.uiPrimitives1.moveTo(start[0],start[1]);
                            Graphics.uiPrimitives1.lineTo(start[0]+10,start[1]-15);
                            Graphics.uiPrimitives1.lineTo(start[0]+10,start[1]+15);
                            Graphics.uiPrimitives1.lineTo(start[0],start[1]);
                            Graphics.uiPrimitives1.endFill();
                        }
                    });
                    button.num = 1;
                    button.newChar = true;
                    button.style.fontSize = 24;
                    Graphics.uiContainer.addChild(button);
                }else{
                    //enter already created character!
                }
                Graphics.uiPrimitives.lineStyle(1,0x484848,1);
                Graphics.uiPrimitives.beginFill(0x484848,1)
                Graphics.uiPrimitives.drawRoundedRect(button.position.x - 7,button.position.y - button.height/2 - 10,button.width + 15,button.height + 15,12);
                Graphics.uiPrimitives.endFill();
            }
            this.playButton = Graphics.makeUiElement({
                text: 'PLAY!',
                style: AcornSetup.style2,
                interactive: true,buttonMode: true,
                position: [(Graphics.width/2),Graphics.height/2 +60],
                anchor: [0.5,0.5],
                clickFunc: function onClick(){
                    console.log('play')
                    Acorn.Sound.play('newChar');
                    Graphics.uiPrimitives.clear()
                    Graphics.uiPrimitives1.clear()
                    Graphics.uiContainer.removeChildren()
                    MainMenu.fadeOut = true;
                }
            });
            this.playButton.style.fontSize = 24;
            this.playButton.visible = false;
            Graphics.uiContainer.addChild(this.playButton);

            this.deleteButton = Graphics.makeUiElement({
                text: 'DELETE',
                style: AcornSetup.style2,
                interactive: true,buttonMode: true,
                position: [(Graphics.width/2-190),Graphics.height/2 +190],
                anchor: [0,1],
                clickFunc: function onClick(){
                    console.log('delete')
                }
            });
            this.deleteButton.style.fontSize = 24;
            this.deleteButton.visible = false;
            Graphics.uiContainer.addChild(this.deleteButton);

            backButton = Graphics.makeUiElement({
                text: 'LOGOUT',
                style: AcornSetup.style2,
                interactive: true,buttonMode: true,
                position: [Graphics.width/2+190,Graphics.height/2+190],
                anchor: [1,1],
                clickFunc: function onClick(){
                        Acorn.Net.socket_.emit('playerUpdate',{command: 'logout'});
                }
            });
            backButton.style.fontSize = 24;
            Graphics.uiContainer.addChild(backButton);
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

            if (this.fadeOut){
                this.fadeOutTicker += dt;
                if (this.fadeOutTicker >= 1){
                    NewChar.slot = MainMenu.currentChar;
                    Acorn.changeState('newchar');
                }else{
                    Graphics.bgContainer.alpha = (1.0-this.fadeOutTicker);
                }
            }
        }

    }
    window.MainMenu = MainMenu;
})(window);
