
(function(window) {
    AfterBattle = {
    	lost: false,
        ticker: 0,
        stage: 1,
        cpoke: 1,

        init: function() { 
        	Battle.ready = false;
        	Game.battleActive = false;
            Graphics.ui.alpha = 1.0;

            Graphics.uiPrimitives1.clear();
            Graphics.uiPrimitives2.clear();
            Graphics.uiContainer2.removeChildren();
            var uiTex = Game.getBoxTexture();
            var uiSprite = new PIXI.Sprite(uiTex)
            Graphics.uiContainer2.addChild(uiSprite);
            var t = 'You Lost!';
            if (!this.lost){
            	t = 'You won!!';
            }
            this.winLoseText = new PIXI.Text(t,AcornSetup.style1);
            this.winLoseText.anchor.x = 0.5;
            this.winLoseText.anchor.y = 0.5;
            this.winLoseText.position.x = Graphics.width/2;
            this.winLoseText.position.y = Graphics.height/10;
            Graphics.uiContainer2.addChild(this.winLoseText);

            this.spriteContainer = {};
            for (var i in Party.pokemon){
            	var p = Party.pokemon[i];
            	if (p == ''){continue;}
            	this.spriteContainer[p.id] = this.getPokemonSprite(p,i);
            }

            this.okButton = Graphics.makeUiElement({
            	text: 'OK!',
            	anchor: [1,0],
            	position: [Graphics.width-30,30],
            	interactive: true,
            	buttonMode: true,
            	clickFunc: function(e){
                    if (AfterBattle.stage == 3){
                        Graphics.uiPrimitives1.clear();
                        Graphics.uiPrimitives2.clear();
                        Graphics.uiContainer2.removeChildren();
                		Game.setBattleChange(false);
                        Game.resetAllPokemon();
                		Acorn.changeStateNoInit('ingame');
                        Party.resetPreviousValues();
                    }
            	}
            });
            Graphics.uiContainer2.addChild(this.okButton);
            this.ticker = 0;
            this.stage = 1;
            this.cpoke = 1;
        },

        getPokemonSprite: function(p){

        	var yStart = (p.slot-1)*(Graphics.height/7.5) + 250;
        	var alpha = 0.35;
        	var participated = false;
        	if (p.exp - p.previousStatValues.exp > 0){
        		participated = true;
        		alpha = 1;
        	}
        	var cont = {};
        	cont.pokemon = p;
        	cont.alpha = alpha;

        	cont.sprite = Graphics.getSprite(p.number);
            cont.sprite.scale.x = -2.5;
            cont.sprite.scale.y = 2.5;
            cont.sprite.anchor.y = 0.5;
            cont.sprite.position.x = 50 + cont.sprite.width;
            cont.sprite.position.y = yStart;
            cont.sprite.alpha = alpha;
            cont.nameText = new PIXI.Text(p.nickname,AcornSetup.style2);
            cont.nameText.anchor.x = 0.5;
            cont.nameText.position.x = 300;
            cont.nameText.position.y = yStart-cont.nameText.height-5;
            cont.nameText.alpha = alpha;
            cont.lvlText = new PIXI.Text('LvL: ' + p.level,AcornSetup.style2);
            cont.lvlText.anchor.x = 0.5;
            cont.lvlText.position.x = 300;
            cont.lvlText.position.y = yStart+5;
            cont.lvlText.alpha = alpha;

            cont.expTxt = new PIXI.Text('Exp: ',AcornSetup.style2);
            cont.expTxt.anchor.x = 0.5;
            cont.expTxt.position.x = 500;
            cont.expTxt.position.y = yStart-cont.nameText.height/2;
            cont.expTxt.alpha = alpha;

            cont.expBarHeight = 20;
            cont.expBarWidth = 400;
            cont.bonusExpTxt = new PIXI.Text('',AcornSetup.style2);
            cont.bonusExpTxt.position.x = cont.expTxt.position.x + cont.expTxt.width/2 + 25;
            cont.bonusExpTxt.position.y = yStart - cont.expBarHeight/2 - 5 - cont.bonusExpTxt.height;
            cont.bonusExpTxt.alpha = alpha;
            if (participated){
                cont.bonusExpTxt.text = '+' + (p.exp - p.previousStatValues.exp);
            }

            cont.expDisplayed = p.previousStatValues.exp;
            cont.expToAdd = Math.max(0.1,((p.exp-p.previousStatValues.exp)/300));

            cont.expBar = new PIXI.Graphics();
            cont.expBar.position.x = cont.expTxt.position.x + cont.expTxt.width/2 + 25;
            cont.expBar.position.y = yStart - cont.expBarHeight/2;

            return cont;
        },
        update: function(dt){ 
            this.ticker += dt;
            switch(this.stage){
                case 1:
                    if (this.ticker >= 0.5){
                        if (Party.pokemon[this.cpoke] == ''){
                            this.stage += 1;
                            this.ticker = 0;
                            return;
                        }
                        var cont = this.spriteContainer[Party.pokemon[this.cpoke].id];
                        Graphics.uiContainer2.addChild(cont.sprite);
                        Graphics.uiContainer2.addChild(cont.nameText);
                        Graphics.uiContainer2.addChild(cont.lvlText);
                        Graphics.uiContainer2.addChild(cont.expTxt);
                        Graphics.uiContainer2.addChild(cont.bonusExpTxt);
                        Graphics.uiContainer2.addChild(cont.expBar);
                        this.drawExpBar(cont);
                        this.ticker = 0;
                        this.cpoke += 1;
                        if (this.cpoke == 7){
                            this.stage += 1;
                            this.ticker = 0;
                        }
                    }
                    break;
                case 2:
                    if (this.ticker >= 1){
                        var done = true;
                        for (var i in this.spriteContainer){
                            var cont = this.spriteContainer[i];
                            var p = cont.pokemon
                            cont.expDisplayed += cont.expToAdd
                            if (cont.expDisplayed >= p.exp){
                                cont.expDisplayed = p.exp;
                            }else{
                                done = false;
                            }
                            cont.expToAdd *=1.01
                            while(cont.expDisplayed >= p.expToNextLevel){
                                //levelup
                                p.level += 1;   
                                p.expAtCurrentLevel = p.getExpValue(p.level);
                                p.expToNextLevel = p.getExpValue(p.level+1);
                                cont.lvlText.text = 'LvL: ' + p.previousStatValues.lvl + ' -> ' + p.level;
                            }
                            this.drawExpBar(cont);
                        }
                        if (done){
                            this.stage += 1;
                            this.ticker = 0;
                        }
                    }
                    break;
            }
        },

        drawExpBar: function(c){
        	var p = c.pokemon;
        	var gfx = c.expBar;
            gfx.clear();
            var percent = (c.expDisplayed-p.expAtCurrentLevel)/(p.expToNextLevel-p.expAtCurrentLevel);
            var xSize = c.expBarWidth;
            var ySize = c.expBarHeight;
            if (!percent){
                gfx.lineStyle(2,0x000000,c.alpha);
                gfx.beginFill(0x707070,0);
                gfx.drawRect(0,0,xSize,ySize);
                gfx.endFill();
                return;
            }
            gfx.lineStyle(2,0x707070,c.alpha);
            gfx.beginFill(0x707070,c.alpha);
            gfx.drawRect(0,0,xSize*percent,ySize);
            gfx.endFill();
            gfx.lineStyle(2,0x000000,c.alpha);
            gfx.beginFill(0x707070,0);
            gfx.drawRect(0,0,xSize,ySize);
            gfx.endFill();

        }

    }
    window.AfterBattle = AfterBattle;
})(window);
