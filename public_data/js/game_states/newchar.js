
(function(window) {
    NewChar = {
        slot: null,
        prompted: false,
        currentSprite: 'ash2',
        init: function() {
            
            Graphics.uiPrimitives2.lineStyle(1,0xDCDCDC,1);
            Graphics.uiPrimitives2.beginFill(0xDCDCDC,1);
            Graphics.uiPrimitives2.drawRect(0,0,Graphics.width,Graphics.height);
            Graphics.uiPrimitives2.endFill()

            this.oak = Graphics.getSprite('oak');
            this.oak.scale.x = 2;
            this.oak.scale.y = 2;
            this.oak.position.x = 25;
            this.oak.position.y = 25;
            Graphics.uiContainer.addChild(this.oak);
            this.oakText = new PIXI.Text('Hello there! Welcome to the world of POK|MON!',AcornSetup.style2);
            this.oakText.position.x = this.oak.position.x + 50 + this.oak.width;
            this.oakText.position.y = this.oak.position.y + this.oak.height/2;
            this.oakText.anchor.y = 0.5;
            Graphics.uiContainer.addChild(this.oakText);

            this.nameText = new PIXI.Text('Please tell me your name: ',AcornSetup.style2);
            this.nameText.position.x = Graphics.width*0.75;
            this.nameText.position.y = this.oak.position.y + this.oak.height/2;
            this.nameText.anchor.y = 0.5;
            this.nameText.anchor.x = 0.5;
            Graphics.uiContainer.addChild(this.nameText);

            this.characterNameInput = document.createElement( 'input' );
            this.characterNameInput.id = 'charname';
            this.characterNameInput.type = 'text';
            this.characterNameInput.name = 'charname';
            this.characterNameInput.placeholder = 'name';
            this.characterNameInput.maxlength = 16;
            this.characterNameInput.style.cssText = 'border-width:1px;border-style:solid;width:200px;height:40px;top:10%;left:75%;background-color:#fff;font-weight:bold;font-size: 24px;font-family:Helvetica;position:absolute';
            this.characterNameInput.style.display = 'inline-block';
            Graphics.elements.push('charname');

            this.spriteText = new PIXI.Text('Choose your new character\'s appearance ',AcornSetup.style2);
            this.spriteText.position.x = Graphics.width*0.5;
            this.spriteText.position.y = Graphics.height/3 - 100;
            this.spriteText.anchor.y = 0.5;
            this.spriteText.anchor.x = 0.5;
            Graphics.uiContainer.addChild(this.spriteText);

            var spriteOptions = [
                'ash2','agatha','beauty','beauty2','birdcatcher2', 'bugcatcher2','burglar2','channeler','blaine2','brock2','bruno2','bugsy',
                'chuck','clair','cooltrainer2_f','cooltrainer2_m','crazylady','cueball','engineer','erika2','ethan','fighter2','fisherman2',
                'firebreather','gambler','gary','gentleman','giovanni','rival4','hiker2','james','jessie','janine','jrtrainer_f','jrtrainer_m','juggler','kid','koga2','lance2',
                'lass','lorelei','maniac','misty2','monk','psychic','pokefan_f','pokefan_m','pryce','rocker2','rocket2','rocketf','sabrina2','sailor2',
                'schoolboy','scientist2','supernerd','surge2','teacher','whitney','youngster2'
            ];
            var s = 60
            var xpos = s;
            var ypos = Graphics.height/3;
            for (var i = 0; i < spriteOptions.length;i++){
                this[spriteOptions[i] + 'Button'] = Graphics.makeUiElement({
                    sprite: spriteOptions[i],
                    style: AcornSetup.baseStyle,
                    interactive: true,buttonMode: true,
                    position: [xpos,ypos],
                    anchor: [0.5,0.5],
                    clickFunc: function onClick(e){
                        Acorn.Sound.play('select');
                        NewChar[NewChar.currentSprite + 'Button'].filters = [];
                        NewChar.currentSprite = e.currentTarget.sName;
                        NewChar[NewChar.currentSprite + 'Button'].filters = [NewChar.outLineFilter];
                    }
                });
                this[spriteOptions[i] + 'Button'].scale.y = 2;
                this[spriteOptions[i] + 'Button'].scale.x = 2;
                this[spriteOptions[i] + 'Button'].sName = spriteOptions[i];
                Graphics.uiContainer.addChild(this[spriteOptions[i] + 'Button']);
                if (xpos >= Graphics.width - s*2.5){
                    xpos = s;
                    ypos += s*2;
                }else{
                    xpos += s*2;
                }
            }


            this.okButton = document.createElement( 'div' );
            this.okButton.id = 'okButton';
            this.okButton.type = 'button';     
            this.okButton.innerHTML = 'OK';
            this.okButton.style.cssText = 'top:80%;left:50%;cursor: pointer;position:absolute;border-radius:10px;background-color: #484848;border: none;color: gray;padding: 15px 32px;text-align: center;text-decoration: none;display: inline-block;color:#D2D2D2;font-family:Pokemon;font-weight:bold;line-height:15px';
            this.okButton.onpointerup = function(){
                if (NewChar.characterNameInput.value.length > 3){
                    Acorn.Net.socket_.emit('playerUpdate',{command: 'newChar',sprite: NewChar.currentSprite,name:NewChar.characterNameInput.value,slot: NewChar.slot});
                }
            }
            Graphics.elements.push('okButton');

            this.outLineFilter = new PIXI.filters.GlowFilter(10, 2, 1.5, 0xFF00000, 0.5);
            NewChar[NewChar.currentSprite + 'Button'].filters = [NewChar.outLineFilter];
        },
        
        update: function(dt){
            if (Acorn.Sound.currentMusic == 'newChar' && !this.prompted && Acorn.Sound.getSound('newChar')._sound.currentTime != 0){
                Graphics.uiPrimitives2.clear();
                document.body.appendChild(this.characterNameInput);
                document.body.appendChild(this.okButton);
                this.prompted = true;
            }
              /*  //for now just prompt names
                var name = '';
                var sprite = ''
                var rival = '';
                while (name == '' || rival == ''){
                    sprite = prompt("enter sprite_name", 'ash');
                    name = prompt("enter character_name", 'ASH');
                    rival = prompt("enter rival_name", 'GARY');
                    if (rival.length <3 || rival.length > 16 || name.length < 3 || name.length > 16){
                        name = '';
                        rival = '';
                        alert("names must be between 3 and 16 characters");
                    }
                }
                this.prompted = true;
                Acorn.Net.socket_.emit('playerUpdate',{command: 'newChar',sprite: sprite,name:name,rival:rival,slot: this.slot});
            }*/
        }

    }
    window.NewChar = NewChar;
})(window);
