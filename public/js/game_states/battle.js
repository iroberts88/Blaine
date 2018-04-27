
(function(window) {
    Battle = {
        battleData: null,
        wild: null,
        myTeam: null,
        otherTeam: null,
        chatLog: [],

        wildStart: false,
        trainerStart: false,
        gopkmnStart: false,
        gopkmnTicker: 0,

        //container for sprites and healthbars of each team?
        pokemonContainer: {},

        myActivePokemon: {},

        init: function() {
            Graphics.uiPrimitives1.clear();
            Graphics.uiPrimitives1.lineStyle(3,0x000000,1);
            Graphics.uiPrimitives1.beginFill(0xFFFFFF,1);
            Graphics.uiPrimitives1.drawRect(0,0,Graphics.width/4,Graphics.height);
            Graphics.uiPrimitives1.drawRect(Graphics.width/4,0,Graphics.width*0.75,Graphics.height*0.75);
            Graphics.uiPrimitives1.drawRect(Graphics.width/4,Graphics.height*0.75,Graphics.width*0.75,Graphics.height/4);
            Graphics.uiPrimitives1.endFill();
            console.log("init!");
            console.log(this.battleData);
            //get which team you're on
            for (var i = 0; i < this.battleData.team1.length;i++){
                for (var j in Party.pokemon){
                    if (this.battleData.team1[i].id == Party.pokemon[j].id){
                        this.myTeam = 1;
                        this.otherTeam = 2;
                        this.myActivePokemon[Party.pokemon[j].id] = Party.pokemon[j];
                    }
                }
            }
            for (var i = 0; i < this.battleData.team2.length;i++){
                for (var j in Party.pokemon){
                    if (this.battleData.team2[i].id == Party.pokemon[j].id){
                        this.myTeam = 2;
                        this.otherTeam = 1;
                        this.myActivePokemon[Party.pokemon[j].id] = Party.pokemon[j];
                    }
                }
            }
            if (this.battleData.wild){
                this.wild = true;
                this.wildStart = true;
            }else{
                this.wild = false;
            }
            switch(this.battleData.type){
                case '1v1':
                    if (this.wild){
                        var data = {}
                        data.sprite = Graphics.getSprite(this.battleData['team' + this.otherTeam][0].number);
                        data.sprite.scale.x = 4;
                        data.sprite.scale.y = 4;
                        data.sprite.anchor.x = 0.5;
                        data.sprite.anchor.y = 0.5;
                        data.sprite.position.x = Graphics.width/4 + data.sprite.width/2;
                        data.sprite.position.y = (Graphics.height*0.75)/6;
                        data.mDistance = (Graphics.width*0.75 - (Graphics.width*0.75)/6) - data.sprite.width/2;
                        data.ticker = 0;
                        Graphics.uiContainer2.addChild(data.sprite);
                        this.pokemonContainer[this.battleData['team' + this.otherTeam][0].id] = data;
                    }
                    break;
            }
        },
        
        update: function(dt){ 
            if (this.wildStart){
                this.updateWildStart(dt);
            }
            if (this.gopkmnStart){
                this.updateGopkmnStart(dt);
            }
        },
        updateWildStart: function(dt){
            var time = 2.0;
            var stop = false;
            for (var i in this.pokemonContainer){
                this.pokemonContainer[i].ticker += dt;
                this.pokemonContainer[i].sprite.position.x = Graphics.width/4 + this.pokemonContainer[i].sprite.width/2 + (this.pokemonContainer[i].mDistance* (this.pokemonContainer[i].ticker/time));
                if (this.pokemonContainer[i].ticker >= 2.0){
                    //next phase!
                    this.addChat("A wild " + this.battleData['team' + this.otherTeam][0].nickname.toUpperCase() + ' appeared!');
                    this.pokemonContainer[i].sprite.position.x = Graphics.width/4 + this.pokemonContainer[i].sprite.width/2 + this.pokemonContainer[i].mDistance;
                    stop = true;
                }
            }
            if (stop){
                this.wildStart = false;
                this.gopkmnStart = true;
                this.gopkmnTicker = 0;
            }
        },

        updateGopkmnStart: function(dt){
            var time = 1.5;
            this.gopkmnTicker += dt;
            if (this.gopkmnTicker >= time && this.gopkmnTicker < time*2){
                this.addChat("Go, " + this.battleData['team' + this.myTeam][0].nickname + '!');
                this.gopkmnTicker = time*2;
            }
            if (this.gopkmnTicker >= time*3){
                //add your pkmn
                for (var i in this.myActivePokemon){
                    var data = {};
                    data.sprite = Graphics.getSprite('b'+this.myActivePokemon[i].number);
                    data.sprite.scale.x = 6;
                    data.sprite.scale.y = 6;
                    data.sprite.anchor.x = 0.5;
                    data.sprite.anchor.y = 0.5;
                    data.sprite.position.x = Graphics.width/4 + (Graphics.width*0.75)/6;
                    data.sprite.position.y = (Graphics.height*0.75)*(5/6);
                    Graphics.uiContainer2.addChild(data.sprite);
                    this.pokemonContainer[this.myActivePokemon[i].id] = data;
                }
            }
        },

        addChat: function(text){
            var newChat = new PIXI.Text(text,{
                font: '18px Pokemon',
                fill: 'black',
                align: 'left',
                wordWrap: true,
                wordWrapWidth: Graphics.width/4 - 20
            });
            newChat.anchor.x = 0;
            newChat.anchor.y = 1;
            newChat.position.x = 10
            newChat.position.y = Graphics.height - 100;
            Graphics.uiContainer2.addChild(newChat);
            for (var i = 0;i < this.chatLog.length;i++){
                this.chatLog[i].position.y -= (newChat.height+5);
            }
            this.chatLog.push(newChat);
        }
    }
    window.Battle = Battle;
})(window);
